import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import 'dotenv/config';

// Configuração do cliente DynamoDB
export const dynamoClient = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1', // Região padrão, pode ser alterada via variável de ambiente
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
  // Configurações opcionais para desenvolvimento local
  ...(process.env.NODE_ENV === 'development' && {
    endpoint: process.env.DYNAMODB_ENDPOINT, // Para DynamoDB Local
  }),
});

// Configurações das tabelas
export const TABLE_NAMES = {
  EVENTS: process.env.EVENTS_TABLE_NAME || 'Events',
  TICKETS: process.env.TICKETS_TABLE_NAME || 'Tickets',
  USERS: process.env.USERS_TABLE_NAME || 'Users',
  PAYMENTS: process.env.PAYMENTS_TABLE_NAME || 'Payments',
} as const;

// Validação das variáveis de ambiente necessárias
export function validateEnvironment() {
  const requiredVars = ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(`Variáveis de ambiente obrigatórias não encontradas: ${missingVars.join(', ')}`);
  }

  // Validar variáveis do AbacatePay se estivermos em produção
  if (process.env.NODE_ENV === 'production') {
    const abacatePayVars = ['ABACATEPAY_API_KEY'];
    const missingAbacatePayVars = abacatePayVars.filter(varName => !process.env[varName]);
    
    if (missingAbacatePayVars.length > 0) {
      console.warn(`Variáveis do AbacatePay não encontradas: ${missingAbacatePayVars.join(', ')}. Pagamentos PIX não funcionarão.`);
    }
  }
}
