import { 
  PutCommand, 
  GetCommand, 
  UpdateCommand, 
  QueryCommand,
  DeleteCommand 
} from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAMES } from '../index';
import { Payment, PaymentStatus } from '../../types/payment';

export class PaymentRepository {
  private tableName = TABLE_NAMES.PAYMENTS;

  /**
   * Cria um novo pagamento
   */
  async create(payment: Payment): Promise<Payment> {
    const command = new PutCommand({
      TableName: this.tableName,
      Item: payment,
      ConditionExpression: 'attribute_not_exists(id)',
    });

    try {
      await docClient.send(command);
      return payment;
    } catch (error) {
      console.error('Erro ao criar pagamento:', error);
      throw new Error('Falha ao criar pagamento no banco de dados');
    }
  }

  /**
   * Busca um pagamento por ID
   */
  async findById(id: string): Promise<Payment | null> {
    const command = new GetCommand({
      TableName: this.tableName,
      Key: { id },
    });

    try {
      const response = await docClient.send(command);
      return response.Item as Payment || null;
    } catch (error) {
      console.error('Erro ao buscar pagamento:', error);
      throw new Error('Falha ao buscar pagamento no banco de dados');
    }
  }

  /**
   * Busca pagamentos por usuário
   */
  async findByUserId(userId: string): Promise<Payment[]> {
    const command = new QueryCommand({
      TableName: this.tableName,
      IndexName: 'UserIdIndex',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId,
      },
    });

    try {
      const response = await docClient.send(command);
      return response.Items as Payment[] || [];
    } catch (error) {
      console.error('Erro ao buscar pagamentos do usuário:', error);
      throw new Error('Falha ao buscar pagamentos do usuário no banco de dados');
    }
  }

  /**
   * Busca pagamentos por ticket
   */
  async findByTicketId(ticketId: string): Promise<Payment[]> {
    const command = new QueryCommand({
      TableName: this.tableName,
      IndexName: 'TicketIdIndex',
      KeyConditionExpression: 'ticketId = :ticketId',
      ExpressionAttributeValues: {
        ':ticketId': ticketId,
      },
    });

    try {
      const response = await docClient.send(command);
      return response.Items as Payment[] || [];
    } catch (error) {
      console.error('Erro ao buscar pagamentos do ticket:', error);
      throw new Error('Falha ao buscar pagamentos do ticket no banco de dados');
    }
  }

  /**
   * Atualiza o status de um pagamento
   */
  async updateStatus(id: string, status: PaymentStatus, additionalData?: Partial<Payment>): Promise<Payment> {
    const updateExpression: string[] = ['SET #status = :status', 'updatedAt = :updatedAt'];
    const expressionAttributeNames: Record<string, string> = { '#status': 'status' };
    const expressionAttributeValues: Record<string, any> = {
      ':status': status,
      ':updatedAt': new Date().toISOString(),
    };

    // Adicionar campos adicionais se fornecidos
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        if (value !== undefined) {
          updateExpression.push(`${key} = :${key}`);
          expressionAttributeValues[`:${key}`] = value;
        }
      });
    }

    const command = new UpdateCommand({
      TableName: this.tableName,
      Key: { id },
      UpdateExpression: updateExpression.join(', '),
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW',
    });

    try {
      const response = await docClient.send(command);
      return response.Attributes as Payment;
    } catch (error) {
      console.error('Erro ao atualizar status do pagamento:', error);
      throw new Error('Falha ao atualizar status do pagamento no banco de dados');
    }
  }

  /**
   * Atualiza um pagamento com dados do Pagar.me
   */
  async updateWithPagarmeData(id: string, pagarmeData: any): Promise<Payment> {
    const command = new UpdateCommand({
      TableName: this.tableName,
      Key: { id },
      UpdateExpression: `
        SET 
          status = :status,
          pagarmeTransactionId = :pagarmeTransactionId,
          updatedAt = :updatedAt,
          pixQrCode = :pixQrCode,
          pixQrCodeBase64 = :pixQrCodeBase64,
          pixCopyPaste = :pixCopyPaste,
          expiresAt = :expiresAt
      `,
      ExpressionAttributeValues: {
        ':status': PaymentStatus.WAITING_PAYMENT,
        ':pagarmeTransactionId': pagarmeData.id.toString(),
        ':updatedAt': new Date().toISOString(),
        ':pixQrCode': pagarmeData.pix_qr_code,
        ':pixQrCodeBase64': pagarmeData.pix_qr_code_base64,
        ':expiresAt': pagarmeData.pix_expiration_date,
        ':pixCopyPaste': pagarmeData.pix_qr_code, // O código copia e cola é o mesmo do QR code
      },
      ReturnValues: 'ALL_NEW',
    });

    try {
      const response = await docClient.send(command);
      return response.Attributes as Payment;
    } catch (error) {
      console.error('Erro ao atualizar pagamento com dados do Pagar.me:', error);
      throw new Error('Falha ao atualizar pagamento com dados do Pagar.me');
    }
  }

  /**
   * Deleta um pagamento
   */
  async delete(id: string): Promise<void> {
    const command = new DeleteCommand({
      TableName: this.tableName,
      Key: { id },
    });

    try {
      await docClient.send(command);
    } catch (error) {
      console.error('Erro ao deletar pagamento:', error);
      throw new Error('Falha ao deletar pagamento no banco de dados');
    }
  }

  /**
   * Busca pagamentos expirados
   */
  async findExpiredPayments(): Promise<Payment[]> {
    const now = new Date().toISOString();
    
    const command = new QueryCommand({
      TableName: this.tableName,
      IndexName: 'StatusExpiresAtIndex',
      KeyConditionExpression: '#status = :status AND expiresAt < :now',
      ExpressionAttributeNames: {
        '#status': 'status',
      },
      ExpressionAttributeValues: {
        ':status': PaymentStatus.WAITING_PAYMENT,
        ':now': now,
      },
    });

    try {
      const response = await docClient.send(command);
      return response.Items as Payment[] || [];
    } catch (error) {
      console.error('Erro ao buscar pagamentos expirados:', error);
      throw new Error('Falha ao buscar pagamentos expirados no banco de dados');
    }
  }
}
