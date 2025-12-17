import { S3Service } from '../services/S3Service';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

async function testS3Connection() {
  console.log('🧪 Testando conexão com S3...');
  
  try {
    // Verificar se as variáveis de ambiente estão configuradas
    const requiredVars = ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'S3_BUCKET_NAME'];
    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      console.error('❌ Variáveis de ambiente faltando:', missingVars);
      console.log('💡 Configure as seguintes variáveis no arquivo .env:');
      missingVars.forEach(varName => {
        console.log(`   ${varName}=seu_valor_aqui`);
      });
      return;
    }
    
    console.log('✅ Variáveis de ambiente configuradas');
    console.log(`📍 Bucket: ${process.env.S3_BUCKET_NAME}`);
    console.log(`📍 Região: ${process.env.AWS_REGION || 'us-east-1'}`);
    
    // Testar geração de URL pré-assinada
    console.log('\n🔗 Testando geração de URL pré-assinada...');
    const presignedUrl = await S3Service.generatePresignedUrl(
      'test-image.jpg',
      'test-event-123',
      'image/jpeg'
    );
    
    console.log('✅ URL pré-assinada gerada com sucesso');
    console.log(`🔗 URL: ${presignedUrl.substring(0, 100)}...`);
    
    // Testar validação de URL S3
    console.log('\n🔍 Testando validação de URL S3...');
    const testUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/events/test-event-123/test-image.jpg`;
    const isValid = S3Service.isValidS3Url(testUrl);
    
    console.log(`✅ Validação de URL: ${isValid ? 'Válida' : 'Inválida'}`);
    
    console.log('\n🎉 Teste de conexão S3 concluído com sucesso!');
    console.log('\n📋 Próximos passos:');
    console.log('1. Configure o bucket S3 com as políticas CORS e de acesso público');
    console.log('2. Teste o upload de imagens via endpoint POST /api/events');
    console.log('3. Verifique se as imagens estão sendo salvas corretamente');
    
  } catch (error: any) {
    console.error('❌ Erro no teste de conexão S3:', error.message);
    
    if (error.name === 'CredentialsProviderError') {
      console.log('\n💡 Possíveis soluções:');
      console.log('1. Verifique se suas credenciais AWS estão corretas');
      console.log('2. Confirme se o usuário tem permissões para acessar o S3');
      console.log('3. Verifique se a região está configurada corretamente');
    } else if (error.name === 'NoSuchBucket') {
      console.log('\n💡 Possíveis soluções:');
      console.log('1. Verifique se o bucket existe na AWS');
      console.log('2. Confirme se o nome do bucket está correto');
      console.log('3. Verifique se o bucket está na região correta');
    }
  }
}

// Executar teste se chamado diretamente
if (require.main === module) {
  testS3Connection();
}

export { testS3Connection };
