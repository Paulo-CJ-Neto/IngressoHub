import { docClient, TABLE_NAMES } from './index';

/**
 * Testa a conexão com o DynamoDB listando as tabelas disponíveis
 */
export async function testDynamoDBConnection() {
  try {
    console.log('🔍 Testando conexão com DynamoDB...');
    console.log('📍 Região:', process.env.AWS_REGION || 'us-east-1');
    console.log('📋 Tabelas configuradas:', TABLE_NAMES);
    
    // Testar conexão fazendo uma operação simples
    // Vamos tentar listar alguns itens da tabela de eventos
    const { ScanCommand } = await import('@aws-sdk/lib-dynamodb');
    
    const command = new ScanCommand({
      TableName: TABLE_NAMES.EVENTS,
      Limit: 1 // Apenas 1 item para teste
    });
    
    const response = await docClient.send(command);
    console.log('✅ Conexão com DynamoDB estabelecida com sucesso!');
    console.log(`📊 Tabela ${TABLE_NAMES.EVENTS}: ${response.Items?.length || 0} itens encontrados`);
    
    return true;
  } catch (error: any) {
    console.error('❌ Erro ao conectar com DynamoDB:', error.message);
    
    if (error.name === 'ResourceNotFoundException') {
      console.log('💡 Dica: Verifique se as tabelas existem no DynamoDB');
    } else if (error.name === 'UnrecognizedClientException') {
      console.log('💡 Dica: Verifique suas credenciais AWS');
    } else if (error.name === 'NetworkError') {
      console.log('💡 Dica: Verifique sua conexão com a internet e configurações de rede');
    }
    
    return false;
  }
}

// Executar teste se o arquivo for executado diretamente
if (require.main === module) {
  testDynamoDBConnection()
    .then(success => {
      if (success) {
        console.log('🎉 Teste de conexão concluído com sucesso!');
      } else {
        console.log('💥 Teste de conexão falhou!');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('💥 Erro inesperado:', error);
      process.exit(1);
    });
}
