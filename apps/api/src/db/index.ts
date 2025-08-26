// Exportações principais do módulo de banco de dados
export { dynamoClient, TABLE_NAMES, validateEnvironment } from './config';
export { docClient } from './client';

// Re-exportações para facilitar o uso
export * from './config';
export * from './client';
