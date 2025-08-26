import { 
  GetCommand, 
  PutCommand, 
  UpdateCommand, 
  DeleteCommand, 
  QueryCommand,
  ScanCommand 
} from '@aws-sdk/lib-dynamodb';
import { docClient } from '../client';
import { TABLE_NAMES } from '../config';
import { User } from '@ingressohub/entities';

export class UserRepository {
  private static readonly tableName = TABLE_NAMES.USERS;

  // Buscar usuário por ID
  static async findById(id: string): Promise<User | null> {
    try {
      const command = new GetCommand({
        TableName: this.tableName,
        Key: { id }
      });

      const response = await docClient.send(command);
      return response.Item as User || null;
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      throw new Error('Erro ao buscar usuário');
    }
  }

  // Buscar usuário por email
  static async findByEmail(email: string): Promise<User | null> {
    try {
      const command = new QueryCommand({
        TableName: this.tableName,
        IndexName: 'email-index', // Assumindo que existe um GSI para email
        KeyConditionExpression: '#email = :email',
        ExpressionAttributeNames: {
          '#email': 'email'
        },
        ExpressionAttributeValues: {
          ':email': email
        }
      });

      const response = await docClient.send(command);
      return response.Items?.[0] as User || null;
    } catch (error) {
      // Se o índice não existir, faz scan e filtra
      console.warn('Índice de email não encontrado, fazendo scan...');
      const allUsers = await this.findAll();
      return allUsers.find(user => user.email === email) || null;
    }
  }

  // Listar todos os usuários
  static async findAll(): Promise<User[]> {
    try {
      const command = new ScanCommand({
        TableName: this.tableName
      });

      const response = await docClient.send(command);
      return response.Items as User[] || [];
    } catch (error) {
      console.error('Erro ao listar usuários:', error);
      throw new Error('Erro ao listar usuários');
    }
  }

  // Criar ou atualizar usuário
  static async createOrUpdate(user: User): Promise<User> {
    try {
      const command = new PutCommand({
        TableName: this.tableName,
        Item: {
          ...user,
          created_at: user.created_at || new Date().toISOString()
        }
      });

      await docClient.send(command);
      return user;
    } catch (error) {
      console.error('Erro ao criar/atualizar usuário:', error);
      throw new Error('Erro ao criar/atualizar usuário');
    }
  }

  // Atualizar usuário
  static async update(id: string, updates: Partial<User>): Promise<User | null> {
    try {
      // Primeiro, buscar o usuário atual
      const currentUser = await this.findById(id);
      if (!currentUser) {
        return null;
      }

      // Preparar expressão de atualização
      const updateExpression: string[] = [];
      const expressionAttributeNames: Record<string, string> = {};
      const expressionAttributeValues: Record<string, any> = {};

      Object.entries(updates).forEach(([key, value]) => {
        if (value !== undefined && key !== 'id' && key !== 'created_at') {
          updateExpression.push(`#${key} = :${key}`);
          expressionAttributeNames[`#${key}`] = key;
          expressionAttributeValues[`:${key}`] = value;
        }
      });

      if (updateExpression.length === 0) {
        return currentUser; // Nada para atualizar
      }

      const command = new UpdateCommand({
        TableName: this.tableName,
        Key: { id },
        UpdateExpression: `SET ${updateExpression.join(', ')}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: 'ALL_NEW'
      });

      const response = await docClient.send(command);
      return response.Attributes as User;
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      throw new Error('Erro ao atualizar usuário');
    }
  }

  // Deletar usuário
  static async delete(id: string): Promise<boolean> {
    try {
      const command = new DeleteCommand({
        TableName: this.tableName,
        Key: { id }
      });

      await docClient.send(command);
      return true;
    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
      throw new Error('Erro ao deletar usuário');
    }
  }

  // Buscar usuários por nome (busca parcial)
  static async searchByName(name: string): Promise<User[]> {
    try {
      const allUsers = await this.findAll();
      const searchTerm = name.toLowerCase();
      
      return allUsers.filter(user => 
        user.full_name.toLowerCase().includes(searchTerm)
      );
    } catch (error) {
      console.error('Erro ao buscar usuários por nome:', error);
      throw new Error('Erro ao buscar usuários por nome');
    }
  }

  // Verificar se email já existe
  static async emailExists(email: string): Promise<boolean> {
    try {
      const existingUser = await this.findByEmail(email);
      return existingUser !== null;
    } catch (error) {
      console.error('Erro ao verificar email:', error);
      throw new Error('Erro ao verificar email');
    }
  }
}
