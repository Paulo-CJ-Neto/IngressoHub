import { S3Client, ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

interface S3CostEstimate {
  storageGB: number;
  requests: number;
  dataTransferGB: number;
  estimatedCost: {
    storage: number;
    requests: number;
    dataTransfer: number;
    total: number;
  };
}

export class S3CostMonitor {
  private static client = new S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });

  private static readonly BUCKET_NAME = process.env.S3_BUCKET_NAME || 'ingressohub-images';

  // Preços AWS S3 (região sa-east-1 - São Paulo)
  private static readonly PRICING = {
    storage: 0.025, // $0.025 por GB/mês
    putRequests: 0.0004, // $0.0004 por 1.000 requests PUT
    getRequests: 0.0004, // $0.0004 por 1.000 requests GET
    dataTransferOut: 0.09, // $0.09 por GB (primeiros 10GB gratuitos)
  };

  /**
   * Analisar custos do bucket S3
   */
  static async analyzeCosts(): Promise<S3CostEstimate> {
    try {
      console.log('🔍 Analisando custos do S3...');
      console.log(`📍 Bucket: ${this.BUCKET_NAME}`);
      console.log(`📍 Região: ${process.env.AWS_REGION || 'us-east-1'}`);

      // Listar todos os objetos
      const objects = await this.listAllObjects();
      console.log(`📊 Total de objetos: ${objects.length}`);

      // Calcular tamanho total
      const totalSizeBytes = objects.reduce((sum, obj) => sum + (obj.Size || 0), 0);
      const totalSizeGB = totalSizeBytes / (1024 * 1024 * 1024);

      // Estimar requests (baseado no número de objetos)
      const estimatedPutRequests = objects.length; // Cada upload = 1 PUT request
      const estimatedGetRequests = objects.length * 10; // Assumir 10 visualizações por imagem

      // Estimar transferência de dados (assumir 1 visualização por imagem por mês)
      const estimatedDataTransferGB = totalSizeGB;

      // Calcular custos
      const storageCost = totalSizeGB * this.PRICING.storage;
      const putRequestsCost = (estimatedPutRequests / 1000) * this.PRICING.putRequests;
      const getRequestsCost = (estimatedGetRequests / 1000) * this.PRICING.getRequests;
      const dataTransferCost = Math.max(0, (estimatedDataTransferGB - 10)) * this.PRICING.dataTransferOut; // Primeiros 10GB gratuitos

      const totalCost = storageCost + putRequestsCost + getRequestsCost + dataTransferCost;

      const costEstimate: S3CostEstimate = {
        storageGB: totalSizeGB,
        requests: estimatedPutRequests + estimatedGetRequests,
        dataTransferGB: estimatedDataTransferGB,
        estimatedCost: {
          storage: storageCost,
          requests: putRequestsCost + getRequestsCost,
          dataTransfer: dataTransferCost,
          total: totalCost,
        },
      };

      return costEstimate;

    } catch (error: any) {
      console.error('❌ Erro ao analisar custos:', error.message);
      throw error;
    }
  }

  /**
   * Listar todos os objetos do bucket
   */
  private static async listAllObjects(): Promise<any[]> {
    const objects: any[] = [];
    let continuationToken: string | undefined;

    do {
      const command = new ListObjectsV2Command({
        Bucket: this.BUCKET_NAME,
        ContinuationToken: continuationToken,
      });

      const response = await this.client.send(command);
      
      if (response.Contents) {
        objects.push(...response.Contents);
      }

      continuationToken = response.NextContinuationToken;
    } while (continuationToken);

    return objects;
  }

  /**
   * Gerar relatório de custos
   */
  static async generateCostReport(): Promise<void> {
    try {
      const costs = await this.analyzeCosts();

      console.log('\n📊 RELATÓRIO DE CUSTOS S3');
      console.log('=' .repeat(50));
      
      console.log(`📁 Armazenamento: ${costs.storageGB.toFixed(3)} GB`);
      console.log(`🔄 Requests estimados: ${costs.requests.toLocaleString()}`);
      console.log(`📤 Transferência de dados: ${costs.dataTransferGB.toFixed(3)} GB`);
      
      console.log('\n💰 CUSTOS ESTIMADOS (mensal):');
      console.log(`   💾 Armazenamento: $${costs.estimatedCost.storage.toFixed(4)}`);
      console.log(`   🔄 Requests: $${costs.estimatedCost.requests.toFixed(4)}`);
      console.log(`   📤 Transferência: $${costs.estimatedCost.dataTransfer.toFixed(4)}`);
      console.log(`   📊 TOTAL: $${costs.estimatedCost.total.toFixed(4)}`);
      
      console.log('\n💡 RECOMENDAÇÕES:');
      
      if (costs.estimatedCost.total > 10) {
        console.log('   ⚠️  Custos altos detectados!');
        console.log('   🔧 Considere implementar políticas de lifecycle');
        console.log('   🗜️  Considere comprimir imagens antes do upload');
        console.log('   ☁️  Considere usar CloudFront para reduzir transferência');
      } else if (costs.estimatedCost.total > 5) {
        console.log('   ⚡ Custos moderados');
        console.log('   📈 Monitore o crescimento do uso');
      } else {
        console.log('   ✅ Custos baixos - sistema otimizado');
      }

      // Salvar relatório em arquivo
      const report = {
        timestamp: new Date().toISOString(),
        bucket: this.BUCKET_NAME,
        region: process.env.AWS_REGION || 'us-east-1',
        costs,
        recommendations: this.generateRecommendations(costs),
      };

      const fs = require('fs');
      const reportPath = `s3-cost-report-${new Date().toISOString().split('T')[0]}.json`;
      fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
      
      console.log(`\n💾 Relatório salvo em: ${reportPath}`);

    } catch (error: any) {
      console.error('❌ Erro ao gerar relatório:', error.message);
    }
  }

  /**
   * Gerar recomendações baseadas nos custos
   */
  private static generateRecommendations(costs: S3CostEstimate): string[] {
    const recommendations: string[] = [];

    if (costs.storageGB > 10) {
      recommendations.push('Implementar política de lifecycle para arquivar objetos antigos');
    }

    if (costs.estimatedCost.requests > 1) {
      recommendations.push('Considerar usar CloudFront para reduzir requests diretos ao S3');
    }

    if (costs.estimatedCost.dataTransfer > 2) {
      recommendations.push('Implementar compressão de imagens antes do upload');
      recommendations.push('Considerar usar formatos de imagem mais eficientes (WebP)');
    }

    if (costs.estimatedCost.total > 20) {
      recommendations.push('Revisar estratégia de armazenamento');
      recommendations.push('Considerar migrar para região mais barata se aplicável');
    }

    return recommendations;
  }

  /**
   * Configurar alertas de custo (simulação)
   */
  static async setupCostAlerts(): Promise<void> {
    console.log('\n🚨 CONFIGURAÇÃO DE ALERTAS DE CUSTO');
    console.log('=' .repeat(50));
    
    console.log('Para configurar alertas reais, acesse o AWS Console:');
    console.log('1. AWS Console → CloudWatch → Billing');
    console.log('2. Create Alarm → Billing');
    console.log('3. Configure os seguintes alertas:');
    console.log('   - $5/mês: Aviso de custos baixos');
    console.log('   - $15/mês: Aviso de custos moderados');
    console.log('   - $30/mês: Alerta de custos altos');
    console.log('   - $50/mês: Alerta crítico de custos');
    
    console.log('\n📧 Configure notificações por email/SMS');
    console.log('🔔 Configure alertas para diferentes serviços (S3, CloudFront, etc.)');
  }
}

// Executar análise se chamado diretamente
if (require.main === module) {
  S3CostMonitor.generateCostReport()
    .then(() => S3CostMonitor.setupCostAlerts())
    .catch(console.error);
}

// Export já declarado na classe
