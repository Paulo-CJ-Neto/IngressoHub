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
import { Event } from '@ingressohub/entities';

export class EventRepository {
  private static readonly tableName = TABLE_NAMES.EVENTS;

  // Buscar evento por ID
  static async findById(id: string): Promise<Event | null> {
    try {
      const command = new GetCommand({
        TableName: this.tableName,
        Key: { id }
      });

      const response = await docClient.send(command);
      return response.Item as Event || null;
    } catch (error) {
      console.error('Erro ao buscar evento:', error);
      throw new Error('Erro ao buscar evento');
    }
  }

  // Listar todos os eventos
  static async findAll(): Promise<Event[]> {
    try {
      const command = new ScanCommand({
        TableName: this.tableName
      });

      const response = await docClient.send(command);
      return response.Items as Event[] || [];
    } catch (error) {
      console.error('Erro ao listar eventos:', error);
      throw new Error('Erro ao listar eventos');
    }
  }

  // Buscar eventos ativos
  static async findActive(): Promise<Event[]> {
    try {
      const command = new QueryCommand({
        TableName: this.tableName,
        IndexName: 'status-index', // Assumindo que existe um GSI para status
        KeyConditionExpression: '#status = :status',
        ExpressionAttributeNames: {
          '#status': 'status'
        },
        ExpressionAttributeValues: {
          ':status': 'active'
        }
      });

      const response = await docClient.send(command);
      return response.Items as Event[] || [];
    } catch (error) {
      // Se o índice não existir, faz scan e filtra
      console.warn('Índice de status não encontrado, fazendo scan...');
      const allEvents = await this.findAll();
      return allEvents.filter(event => event.status === 'active');
    }
  }

  // Criar ou atualizar evento
  static async createOrUpdate(event: Event): Promise<Event> {
    try {
      const command = new PutCommand({
        TableName: this.tableName,
        Item: {
          ...event,
          updated_at: new Date().toISOString()
        }
      });

      await docClient.send(command);
      return event;
    } catch (error) {
      console.error('Erro ao criar/atualizar evento:', error);
      throw new Error('Erro ao criar/atualizar evento');
    }
  }

  // Atualizar evento
  static async update(id: string, updates: Partial<Event>): Promise<Event | null> {
    try {
      // Primeiro, buscar o evento atual
      const currentEvent = await this.findById(id);
      if (!currentEvent) {
        return null;
      }

      // Preparar expressão de atualização
      const updateExpression: string[] = [];
      const expressionAttributeNames: Record<string, string> = {};
      const expressionAttributeValues: Record<string, any> = {};

      Object.entries(updates).forEach(([key, value]) => {
        if (value !== undefined && key !== 'id') {
          updateExpression.push(`#${key} = :${key}`);
          expressionAttributeNames[`#${key}`] = key;
          expressionAttributeValues[`:${key}`] = value;
        }
      });

      // Adicionar timestamp de atualização
      updateExpression.push('#updated_at = :updated_at');
      expressionAttributeNames['#updated_at'] = 'updated_at';
      expressionAttributeValues[':updated_at'] = new Date().toISOString();

      const command = new UpdateCommand({
        TableName: this.tableName,
        Key: { id },
        UpdateExpression: `SET ${updateExpression.join(', ')}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: 'ALL_NEW'
      });

      const response = await docClient.send(command);
      return response.Attributes as Event;
    } catch (error) {
      console.error('Erro ao atualizar evento:', error);
      throw new Error('Erro ao atualizar evento');
    }
  }

  // Deletar evento
  static async delete(id: string): Promise<boolean> {
    try {
      const command = new DeleteCommand({
        TableName: this.tableName,
        Key: { id }
      });

      await docClient.send(command);
      return true;
    } catch (error) {
      console.error('Erro ao deletar evento:', error);
      throw new Error('Erro ao deletar evento');
    }
  }

  // Incrementar ingressos vendidos
  static async incrementSoldTickets(id: string, quantity: number): Promise<Event | null> {
    try {
      const command = new UpdateCommand({
        TableName: this.tableName,
        Key: { id },
        UpdateExpression: 'SET #sold_tickets = #sold_tickets + :quantity, #updated_at = :updated_at',
        ExpressionAttributeNames: {
          '#sold_tickets': 'sold_tickets',
          '#updated_at': 'updated_at'
        },
        ExpressionAttributeValues: {
          ':quantity': quantity,
          ':updated_at': new Date().toISOString()
        },
        ReturnValues: 'ALL_NEW'
      });

      const response = await docClient.send(command);
      return response.Attributes as Event;
    } catch (error) {
      console.error('Erro ao incrementar ingressos vendidos:', error);
      throw new Error('Erro ao incrementar ingressos vendidos');
    }
  }
}
