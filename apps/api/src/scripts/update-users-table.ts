import { UpdateCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAMES } from '../db';

/**
 * Script para atualizar a tabela de usuários existente
 * Adiciona o campo user_type para todos os usuários existentes
 * Execute com: npm run db:update-users-table
 */

async function updateUsersTable() {
  try {
    console.log('🔍 Atualizando tabela de usuários...');
    
    // Buscar todos os usuários existentes
    const scanCommand = new ScanCommand({
      TableName: TABLE_NAMES.USERS
    });
    
    const response = await docClient.send(scanCommand);
    const users = response.Items || [];
    
    console.log(`📊 Encontrados ${users.length} usuários para atualizar`);
    
    if (users.length === 0) {
      console.log('✅ Nenhum usuário encontrado para atualizar');
      return;
    }
    
    // Atualizar cada usuário com o campo user_type
    let updatedCount = 0;
    for (const user of users) {
      try {
        // Definir user_type baseado em alguma lógica ou padrão
        // Por padrão, usuários existentes serão 'client'
        const userType = user.user_type || 'client';
        
        if (!user.user_type) {
          const updateCommand = new UpdateCommand({
            TableName: TABLE_NAMES.USERS,
            Key: { id: user.id },
            UpdateExpression: 'SET user_type = :userType',
            ExpressionAttributeValues: {
              ':userType': userType
            }
          });
          
          await docClient.send(updateCommand);
          updatedCount++;
          console.log(`✅ Usuário ${user.email} atualizado com user_type: ${userType}`);
        } else {
          console.log(`ℹ️ Usuário ${user.email} já possui user_type: ${user.user_type}`);
        }
      } catch (error) {
        console.error(`❌ Erro ao atualizar usuário ${user.email}:`, error);
      }
    }
    
    console.log(`\n🎉 Atualização concluída! ${updatedCount} usuários foram atualizados`);
    
  } catch (error) {
    console.error('❌ Erro ao atualizar tabela de usuários:', error);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  updateUsersTable();
}

export { updateUsersTable };
