import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { PaymentRepository } from '../db/repositories';
import { 
  Payment, 
  PaymentStatus, 
  PagarmePixRequest, 
  PagarmePixResponse,
  PagarmeWebhookPayload,
  CreatePixPaymentRequest,
  CreatePixPaymentResponse,
  PaymentStatusResponse
} from '../types/payment';

export class PaymentService {
  private paymentRepository: PaymentRepository;
  private pagarmeApiKey: string;
  private pagarmeEncryptionKey: string;
  private pagarmeEnvironment: string;
  private pagarmeBaseUrl: string;

  constructor() {
    this.paymentRepository = new PaymentRepository();
    this.pagarmeApiKey = process.env.PAGARME_API_KEY || '';
    this.pagarmeEncryptionKey = process.env.PAGARME_ENCRYPTION_KEY || '';
    this.pagarmeEnvironment = process.env.PAGARME_ENVIRONMENT || 'sandbox';
    this.pagarmeBaseUrl = this.pagarmeEnvironment === 'production' 
      ? 'https://api.pagar.me/core/v5' 
      : 'https://api.pagar.me/core/v5';
  }

  /**
   * Cria um novo pagamento PIX
   */
  async createPixPayment(request: CreatePixPaymentRequest): Promise<CreatePixPaymentResponse> {
    try {
      // Validar dados da requisição
      this.validateCreatePaymentRequest(request);

      // Criar pagamento no banco com status inicial
      const payment: Payment = {
        id: uuidv4(),
        userId: request.userId,
        ticketId: request.ticketId,
        eventId: request.eventId,
        amount: request.amount,
        status: PaymentStatus.PENDING,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 horas
        metadata: {
          eventName: request.eventName,
          customerName: request.customerName,
          customerEmail: request.customerEmail,
          customerDocument: request.customerDocument,
        }
      };

      // Salvar no banco
      await this.paymentRepository.create(payment);

      // Preparar dados para o Pagar.me
      const pagarmeRequest: PagarmePixRequest = {
        amount: request.amount,
        payment_method: 'pix',
        pix_expiration_date: payment.expiresAt,
        customer: {
          name: request.customerName,
          email: request.customerEmail,
          type: 'individual',
          document: request.customerDocument,
        },
        items: [
          {
            amount: request.amount,
            description: `Ingresso para ${request.eventName}`,
            quantity: 1,
            code: request.ticketId,
          }
        ],
        metadata: {
          paymentId: payment.id,
          ticketId: request.ticketId,
          eventId: request.eventId,
          userId: request.userId,
        }
      };

      // Chamar API do Pagar.me
      const pagarmeResponse = await this.callPagarmeApi('/orders', pagarmeRequest);

      // Atualizar pagamento com dados do Pagar.me
      const updatedPayment = await this.paymentRepository.updateWithPagarmeData(
        payment.id, 
        pagarmeResponse
      );

      return {
        success: true,
        payment: updatedPayment,
        pixQrCode: pagarmeResponse.pix_qr_code,
        pixQrCodeBase64: pagarmeResponse.pix_qr_code_base64,
        pixCopyPaste: pagarmeResponse.pix_qr_code,
        expiresAt: updatedPayment.expiresAt,
      };

    } catch (error) {
      console.error('Erro ao criar pagamento PIX:', error);
      throw new Error(`Falha ao criar pagamento PIX: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  /**
   * Processa webhook do Pagar.me
   */
  async processWebhook(webhookPayload: PagarmeWebhookPayload): Promise<void> {
    try {
      console.log('Processando webhook do Pagar.me:', JSON.stringify(webhookPayload, null, 2));

      const { type, data } = webhookPayload;

      // Verificar se é um webhook de pagamento
      if (type !== 'order.paid' && type !== 'order.payment_failed' && type !== 'order.canceled') {
        console.log(`Webhook ignorado - tipo não suportado: ${type}`);
        return;
      }

      // Buscar pagamento pelo ID do Pagar.me
      const payments = await this.paymentRepository.findByUserId(data.customer.id.toString());
      const payment = payments.find(p => p.pagarmeTransactionId === data.id.toString());

      if (!payment) {
        console.error(`Pagamento não encontrado para transação Pagar.me: ${data.id}`);
        return;
      }

      // Atualizar status baseado no tipo do webhook
      let newStatus: PaymentStatus;
      let additionalData: Partial<Payment> = {};

      switch (type) {
        case 'order.paid':
          newStatus = PaymentStatus.PAID;
          break;
        case 'order.payment_failed':
          newStatus = PaymentStatus.FAILED;
          break;
        case 'order.canceled':
          newStatus = PaymentStatus.CANCELLED;
          break;
        default:
          newStatus = PaymentStatus.FAILED;
      }

      // Atualizar pagamento no banco
      await this.paymentRepository.updateStatus(payment.id, newStatus, additionalData);

      console.log(`Status do pagamento ${payment.id} atualizado para: ${newStatus}`);

    } catch (error) {
      console.error('Erro ao processar webhook:', error);
      throw new Error(`Falha ao processar webhook: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  /**
   * Consulta status de um pagamento
   */
  async getPaymentStatus(paymentId: string): Promise<PaymentStatusResponse> {
    try {
      const payment = await this.paymentRepository.findById(paymentId);

      if (!payment) {
        throw new Error('Pagamento não encontrado');
      }

      return {
        success: true,
        payment,
      };

    } catch (error) {
      console.error('Erro ao consultar status do pagamento:', error);
      throw new Error(`Falha ao consultar status do pagamento: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  /**
   * Busca pagamentos de um usuário
   */
  async getUserPayments(userId: string): Promise<Payment[]> {
    try {
      return await this.paymentRepository.findByUserId(userId);
    } catch (error) {
      console.error('Erro ao buscar pagamentos do usuário:', error);
      throw new Error(`Falha ao buscar pagamentos do usuário: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  /**
   * Cancela um pagamento
   */
  async cancelPayment(paymentId: string): Promise<Payment> {
    try {
      const payment = await this.paymentRepository.findById(paymentId);

      if (!payment) {
        throw new Error('Pagamento não encontrado');
      }

      if (payment.status === PaymentStatus.PAID) {
        throw new Error('Não é possível cancelar um pagamento já aprovado');
      }

      if (payment.status === PaymentStatus.CANCELLED) {
        throw new Error('Pagamento já foi cancelado');
      }

      // Atualizar status para cancelado
      return await this.paymentRepository.updateStatus(paymentId, PaymentStatus.CANCELLED);

    } catch (error) {
      console.error('Erro ao cancelar pagamento:', error);
      throw new Error(`Falha ao cancelar pagamento: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  /**
   * Chama a API do Pagar.me
   */
  private async callPagarmeApi(endpoint: string, data: any): Promise<PagarmePixResponse> {
    try {
      const response = await axios.post(`${this.pagarmeBaseUrl}${endpoint}`, data, {
        headers: {
          'Authorization': `Basic ${Buffer.from(this.pagarmeApiKey + ':').toString('base64')}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000, // 30 segundos
      });

      if (response.status !== 200 && response.status !== 201) {
        throw new Error(`API do Pagar.me retornou status ${response.status}: ${response.statusText}`);
      }

      return response.data;

    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Erro na API do Pagar.me:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
        });
        
        if (error.response?.status === 401) {
          throw new Error('Credenciais inválidas do Pagar.me');
        } else if (error.response?.status === 422) {
          throw new Error(`Dados inválidos para Pagar.me: ${JSON.stringify(error.response.data)}`);
        } else {
          throw new Error(`Erro na API do Pagar.me: ${error.response?.data?.message || error.message}`);
        }
      }
      
      throw new Error(`Erro ao chamar API do Pagar.me: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  /**
   * Valida dados da requisição de criação de pagamento
   */
  private validateCreatePaymentRequest(request: CreatePixPaymentRequest): void {
    if (!request.userId || !request.ticketId || !request.eventId) {
      throw new Error('userId, ticketId e eventId são obrigatórios');
    }

    if (!request.amount || request.amount <= 0) {
      throw new Error('amount deve ser maior que zero');
    }

    if (!request.customerName || !request.customerEmail || !request.customerDocument) {
      throw new Error('Dados do cliente são obrigatórios');
    }

    if (!request.eventName) {
      throw new Error('Nome do evento é obrigatório');
    }

    // Validar formato do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(request.customerEmail)) {
      throw new Error('Email inválido');
    }

    // Validar CPF/CNPJ (formato básico)
    const documentRegex = /^\d{11}|\d{14}$/;
    if (!documentRegex.test(request.customerDocument.replace(/\D/g, ''))) {
      throw new Error('Documento inválido (deve ser CPF ou CNPJ)');
    }
  }

  /**
   * Verifica se as credenciais do Pagar.me estão configuradas
   */
  isPagarmeConfigured(): boolean {
    return !!(this.pagarmeApiKey && this.pagarmeEncryptionKey);
  }
}
