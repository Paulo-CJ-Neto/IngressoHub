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
import { Ticket } from '@ingressohub/entities';

export class TicketRepository {
  private static readonly tableName = TABLE_NAMES.TICKETS;

  // Buscar ingresso por ID
  static async findById(id: string): Promise<Ticket | null> {
    try {
      const command = new GetCommand({
        TableName: this.tableName,
        Key: { id }
      });

      const response = await docClient.send(command);
      return response.Item as Ticket || null;
    } catch (error) {
      console.error('Erro ao buscar ingresso:', error);
      throw new Error('Erro ao buscar ingresso');
    }
  }

  // Buscar ingresso por QR Code
  static async findByQrCode(qrCode: string): Promise<Ticket | null> {
    try {
      const command = new QueryCommand({
        TableName: this.tableName,
        IndexName: 'qr-code-index', // Assumindo que existe um GSI para QR Code
        KeyConditionExpression: '#qr_code = :qr_code',
        ExpressionAttributeNames: {
          '#qr_code': 'qr_code'
        },
        ExpressionAttributeValues: {
          ':qr_code': qrCode
        }
      });

      const response = await docClient.send(command);
      return response.Items?.[0] as Ticket || null;
    } catch (error) {
      // Se o índice não existir, faz scan e filtra
      console.warn('Índice de QR Code não encontrado, fazendo scan...');
      const allTickets = await this.findAll();
      return allTickets.find(ticket => ticket.qr_code === qrCode) || null;
    }
  }

  // Buscar ingressos por evento
  static async findByEventId(eventId: string): Promise<Ticket[]> {
    try {
      const command = new QueryCommand({
        TableName: this.tableName,
        IndexName: 'event-id-index', // Assumindo que existe um GSI para event_id
        KeyConditionExpression: '#event_id = :event_id',
        ExpressionAttributeNames: {
          '#event_id': 'event_id'
        },
        ExpressionAttributeValues: {
          ':event_id': eventId
        }
      });

      const response = await docClient.send(command);
      return response.Items as Ticket[] || [];
    } catch (error) {
      // Se o índice não existir, faz scan e filtra
      console.warn('Índice de event_id não encontrado, fazendo scan...');
      const allTickets = await this.findAll();
      return allTickets.filter(ticket => ticket.event_id === eventId);
    }
  }

  // Buscar ingressos por comprador (email)
  static async findByBuyerEmail(email: string): Promise<Ticket[]> {
    try {
      const command = new QueryCommand({
        TableName: this.tableName,
        IndexName: 'buyer-email-index', // Assumindo que existe um GSI para buyer_email
        KeyConditionExpression: '#buyer_email = :buyer_email',
        ExpressionAttributeNames: {
          '#buyer_email': 'buyer_email'
        },
        ExpressionAttributeValues: {
          ':buyer_email': email
        }
      });

      const response = await docClient.send(command);
      return response.Items as Ticket[] || [];
    } catch (error) {
      // Se o índice não existir, faz scan e filtra
      console.warn('Índice de buyer_email não encontrado, fazendo scan...');
      const allTickets = await this.findAll();
      return allTickets.filter(ticket => ticket.buyer_email === email);
    }
  }

  // Buscar ingressos por status
  static async findByStatus(status: Ticket['status']): Promise<Ticket[]> {
    try {
      const command = new QueryCommand({
        TableName: this.tableName,
        IndexName: 'status-index', // Assumindo que existe um GSI para status
        KeyConditionExpression: '#status = :status',
        ExpressionAttributeNames: {
          '#status': 'status'
        },
        ExpressionAttributeValues: {
          ':status': status
        }
      });

      const response = await docClient.send(command);
      return response.Items as Ticket[] || [];
    } catch (error) {
      // Se o índice não existir, faz scan e filtra
      console.warn('Índice de status não encontrado, fazendo scan...');
      const allTickets = await this.findAll();
      return allTickets.filter(ticket => ticket.status === status);
    }
  }

  // Listar todos os ingressos
  static async findAll(): Promise<Ticket[]> {
    try {
      const command = new ScanCommand({
        TableName: this.tableName
      });

      const response = await docClient.send(command);
      return response.Items as Ticket[] || [];
    } catch (error) {
      console.error('Erro ao listar ingressos:', error);
      throw new Error('Erro ao listar ingressos');
    }
  }

  // Criar ou atualizar ingresso
  static async createOrUpdate(ticket: Ticket): Promise<Ticket> {
    try {
      const command = new PutCommand({
        TableName: this.tableName,
        Item: {
          ...ticket,
          created_at: ticket.created_at || new Date().toISOString()
        }
      });

      await docClient.send(command);
      return ticket;
    } catch (error) {
      console.error('Erro ao criar/atualizar ingresso:', error);
      throw new Error('Erro ao criar/atualizar ingresso');
    }
  }

  // Atualizar ingresso
  static async update(id: string, updates: Partial<Ticket>): Promise<Ticket | null> {
    try {
      // Primeiro, buscar o ingresso atual
      const currentTicket = await this.findById(id);
      if (!currentTicket) {
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
        return currentTicket; // Nada para atualizar
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
      return response.Attributes as Ticket;
    } catch (error) {
      console.error('Erro ao atualizar ingresso:', error);
      throw new Error('Erro ao atualizar ingresso');
    }
  }

  // Deletar ingresso
  static async delete(id: string): Promise<boolean> {
    try {
      const command = new DeleteCommand({
        TableName: this.tableName,
        Key: { id }
      });

      await docClient.send(command);
      return true;
    } catch (error) {
      console.error('Erro ao deletar ingresso:', error);
      throw new Error('Erro ao deletar ingresso');
    }
  }

  // Validar ingresso (mudar status para 'used')
  static async validateTicket(id: string): Promise<Ticket | null> {
    try {
      const command = new UpdateCommand({
        TableName: this.tableName,
        Key: { id },
        UpdateExpression: 'SET #status = :status, #used_at = :used_at',
        ExpressionAttributeNames: {
          '#status': 'status',
          '#used_at': 'used_at'
        },
        ExpressionAttributeValues: {
          ':status': 'used',
          ':used_at': new Date().toISOString(),
          ':expected': 'valid'
        },
        ConditionExpression: '#status = :expected',
        ReturnValues: 'ALL_NEW'
      });

      const response = await docClient.send(command);
      return response.Attributes as Ticket;
    } catch (error) {
      console.error('Erro ao validar ingresso:', error);
      throw new Error('Erro ao validar ingresso');
    }
  }

  // Cancelar ingresso (mudar status para 'cancelled')
  static async cancelTicket(id: string): Promise<Ticket | null> {
    try {
      const command = new UpdateCommand({
        TableName: this.tableName,
        Key: { id },
        UpdateExpression: 'SET #status = :status',
        ExpressionAttributeNames: {
          '#status': 'status'
        },
        ExpressionAttributeValues: {
          ':status': 'cancelled'
        },
        ReturnValues: 'ALL_NEW'
      });

      const response = await docClient.send(command);
      return response.Attributes as Ticket;
    } catch (error) {
      console.error('Erro ao cancelar ingresso:', error);
      throw new Error('Erro ao cancelar ingresso');
    }
  }

  // Gerar QR Code único
  static async generateUniqueQrCode(): Promise<string> {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    const qrCode = `QR_${timestamp}_${random}`;
    
    // Verificar se já existe (muito improvável, mas por segurança)
    const existingTicket = await this.findByQrCode(qrCode);
    if (existingTicket) {
      // Se existir, gerar outro
      return this.generateUniqueQrCode();
    }
    
    return qrCode;
  }

  // Buscar ingressos por CPF do comprador
  static async findByBuyerCpf(cpf: string): Promise<Ticket[]> {
    try {
      const allTickets = await this.findAll();
      return allTickets.filter(ticket => ticket.buyer_cpf === cpf);
    } catch (error) {
      console.error('Erro ao buscar ingressos por CPF:', error);
      throw new Error('Erro ao buscar ingressos por CPF');
    }
  }

  // Estatísticas de ingressos por evento
  static async getEventTicketStats(eventId: string): Promise<{
    total: number;
    valid: number;
    used: number;
    cancelled: number;
    revenue: number;
  }> {
    try {
      const tickets = await this.findByEventId(eventId);
      
      const stats = {
        total: tickets.length,
        valid: tickets.filter(t => t.status === 'valid').length,
        used: tickets.filter(t => t.status === 'used').length,
        cancelled: tickets.filter(t => t.status === 'cancelled').length,
        revenue: tickets.reduce((sum, t) => sum + t.total_price, 0)
      };
      
      return stats;
    } catch (error) {
      console.error('Erro ao obter estatísticas do evento:', error);
      throw new Error('Erro ao obter estatísticas do evento');
    }
  }
}
