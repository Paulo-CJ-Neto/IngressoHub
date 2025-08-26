import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { dynamoClient } from './config';

// Cliente DynamoDB DocumentClient para operações CRUD mais simples
export const docClient = DynamoDBDocumentClient.from(dynamoClient, {
  marshallOptions: {
    // Configurações para serialização/deserialização
    removeUndefinedValues: true,
    convertEmptyValues: true,
  },
  unmarshallOptions: {
    // Configurações para deserialização
    wrapNumbers: false,
  },
});

// Exporta também o cliente base para operações mais avançadas
export { dynamoClient } from './config';
