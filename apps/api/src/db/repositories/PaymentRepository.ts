import { 
  PutCommand, 
  GetCommand, 
  UpdateCommand, 
  QueryCommand,
  DeleteCommand,
  ScanCommand
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
   * Busca pagamento por billing ID do AbacatePay
   */
  async findByAbacatePayBillingId(billingId: string): Promise<Payment | null> {
    // Como não temos índice para billingId, fazemos scan e filtramos
    // Em produção, considere adicionar um índice GSI para billingId
    try {
      const allPayments = await this.findAll();
      return allPayments.find(p => p.abacatePayBillingId === billingId) || null;
    } catch (error) {
      console.error('Erro ao buscar pagamento por billing ID:', error);
      throw new Error('Falha ao buscar pagamento por billing ID no banco de dados');
    }
  }

  /**
   * Busca todos os pagamentos (usado internamente para busca por billingId)
   * Nota: Em produção com muitos registros, considere adicionar um índice GSI para abacatePayBillingId
   */
  private async findAll(): Promise<Payment[]> {
    const command = new ScanCommand({
      TableName: this.tableName,
    });

    try {
      const response = await docClient.send(command);
      return response.Items as Payment[] || [];
    } catch (error) {
      console.error('Erro ao buscar todos os pagamentos:', error);
      throw new Error('Falha ao buscar pagamentos no banco de dados');
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
   * Atualiza um pagamento com dados do AbacatePay
   */
  async updateWithAbacatePayData(id: string, abacatePayData: any): Promise<Payment> {
    try {
      // Validar dados recebidos
      if (!abacatePayData?.data) {
        throw new Error('Dados do AbacatePay não encontrados');
      }

      const { data } = abacatePayData;

      // Mapear status do AbacatePay para nosso enum
      let status = PaymentStatus.PENDING;
      if (data.status === 'PAID') {
        status = PaymentStatus.PAID;
      } else if (data.status === 'EXPIRED') {
        status = PaymentStatus.EXPIRED;
      } else if (data.status === 'CANCELLED') {
        status = PaymentStatus.CANCELLED;
      }

      // Processar base64 - remover prefixo data:image se existir e limitar tamanho
      let pixQrCodeBase64 = data.brCodeBase64 || '';
      if (pixQrCodeBase64.startsWith('data:image')) {
        // Remover prefixo data:image/png;base64,
        pixQrCodeBase64 = pixQrCodeBase64.split(',')[1] || pixQrCodeBase64;
      }

      // Limitar tamanho do base64 (DynamoDB tem limite de 400KB por item)
      // Se for muito grande, manter apenas uma referência
      const MAX_BASE64_SIZE = 350000; // ~350KB para deixar margem
      if (pixQrCodeBase64.length > MAX_BASE64_SIZE) {
        console.warn(`QR Code base64 muito grande (${pixQrCodeBase64.length} bytes). Armazenando apenas referência.`);
        pixQrCodeBase64 = pixQrCodeBase64.substring(0, 100); // Manter apenas parte inicial como referência
      }

      // Validar campos obrigatórios
      if (!data.id) {
        throw new Error('ID do AbacatePay não encontrado');
      }

      if (!data.brCode) {
        throw new Error('Código PIX copia-e-cola não encontrado');
      }

      const expiresAt = data.expiresAt || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

      const command = new UpdateCommand({
        TableName: this.tableName,
        Key: { id },
        UpdateExpression: `
          SET 
            #status = :status,
            abacatePayBillingId = :abacatePayBillingId,
            updatedAt = :updatedAt,
            pixQrCode = :pixQrCode,
            pixQrCodeBase64 = :pixQrCodeBase64,
            pixCopyPaste = :pixCopyPaste,
            expiresAt = :expiresAt
        `,
        ExpressionAttributeNames: {
          '#status': 'status', // Escapar palavra reservada
        },
        ExpressionAttributeValues: {
          ':status': status,
          ':abacatePayBillingId': data.id,
          ':updatedAt': new Date().toISOString(),
          ':pixQrCode': pixQrCodeBase64 || '', // Imagem base64 (pode ser vazia se muito grande)
          ':pixQrCodeBase64': pixQrCodeBase64 || '', // Imagem base64
          ':pixCopyPaste': data.brCode, // Código copia-e-cola
          ':expiresAt': expiresAt,
        },
        ReturnValues: 'ALL_NEW',
      });

      const response = await docClient.send(command);
      
      if (!response.Attributes) {
        throw new Error('Resposta do DynamoDB não contém atributos');
      }

      return response.Attributes as Payment;
    } catch (error) {
      console.error('Erro ao atualizar pagamento com dados do AbacatePay:', error);
      console.error('Dados recebidos:', JSON.stringify(abacatePayData, null, 2));
      
      if (error instanceof Error) {
        throw new Error(`Falha ao atualizar pagamento com dados do AbacatePay: ${error.message}`);
      }
      
      throw new Error('Falha ao atualizar pagamento com dados do AbacatePay');
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
        ':status': PaymentStatus.PENDING,
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
