import { CreateTableCommand, ListTablesCommand } from '@aws-sdk/client-dynamodb';
import { dynamoClient, TABLE_NAMES } from '../db';

/**
 * Script para criar a tabela de pagamentos no DynamoDB
 * Execute com: npm run db:create-payments-table
 */

async function createPaymentsTable() {
  try {
    console.log('🔍 Verificando tabelas existentes...');
    
    // Listar tabelas existentes
    const listCommand = new ListTablesCommand({});
    const listResponse = await dynamoClient.send(listCommand);
    
    if (listResponse.TableNames?.includes(TABLE_NAMES.PAYMENTS)) {
      console.log(`✅ Tabela ${TABLE_NAMES.PAYMENTS} já existe`);
      return;
    }

    console.log(`📋 Criando tabela ${TABLE_NAMES.PAYMENTS}...`);

    const createCommand = new CreateTableCommand({
      TableName: TABLE_NAMES.PAYMENTS,
      AttributeDefinitions: [
        {
          AttributeName: 'id',
          AttributeType: 'S'
        },
        {
          AttributeName: 'userId',
          AttributeType: 'S'
        },
        {
          AttributeName: 'ticketId',
          AttributeType: 'S'
        },
        {
          AttributeName: 'status',
          AttributeType: 'S'
        },
        {
          AttributeName: 'expiresAt',
          AttributeType: 'S'
        }
      ],
      KeySchema: [
        {
          AttributeName: 'id',
          KeyType: 'HASH'
        }
      ],
      GlobalSecondaryIndexes: [
        {
          IndexName: 'UserIdIndex',
          KeySchema: [
            {
              AttributeName: 'userId',
              KeyType: 'HASH'
            }
          ],
          Projection: {
            ProjectionType: 'ALL'
          },
          ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5
          }
        },
        {
          IndexName: 'TicketIdIndex',
          KeySchema: [
            {
              AttributeName: 'ticketId',
              KeyType: 'HASH'
            }
          ],
          Projection: {
            ProjectionType: 'ALL'
          },
          ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5
          }
        },
        {
          IndexName: 'StatusExpiresAtIndex',
          KeySchema: [
            {
              AttributeName: 'status',
              KeyType: 'HASH'
            },
            {
              AttributeName: 'expiresAt',
              KeyType: 'RANGE'
            }
          ],
          Projection: {
            ProjectionType: 'ALL'
          },
          ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5
          }
        }
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5
      }
    });

    await dynamoClient.send(createCommand);
    
    console.log(`✅ Tabela ${TABLE_NAMES.PAYMENTS} criada com sucesso!`);
    console.log('📊 Índices criados:');
    console.log('   - UserIdIndex (para buscar pagamentos por usuário)');
    console.log('   - TicketIdIndex (para buscar pagamentos por ticket)');
    console.log('   - StatusExpiresAtIndex (para buscar pagamentos expirados)');

  } catch (error) {
    console.error('❌ Erro ao criar tabela de pagamentos:', error);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  createPaymentsTable();
}

export { createPaymentsTable };
