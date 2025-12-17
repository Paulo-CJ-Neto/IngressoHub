import { v4 as uuidv4 } from 'uuid';
import { PaymentRepository } from '../db/repositories';
import { 
  Payment, 
  PaymentStatus, 
  AbacatePayPixQrCodeRequest,
  AbacatePayPixQrCodeResponse,
  AbacatePayWebhookPayload,
  CreatePixPaymentRequest,
  CreatePixPaymentResponse,
  PaymentStatusResponse
} from '../types/payment';

export class PaymentService {
  private paymentRepository: PaymentRepository;
  private abacatePayApiKey: string;
  private abacatePayBaseUrl: string = 'https://api.abacatepay.com/v1';

  constructor() {
    this.paymentRepository = new PaymentRepository();
    this.abacatePayApiKey = process.env.ABACATEPAY_API_KEY || '';
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

      // Preparar dados para o AbacatePay
      // Limpar e validar CPF/CNPJ (apenas números, sem formatação)
      const cleanDocument = request.customerDocument.replace(/\D/g, '');
      
      if (!cleanDocument || (cleanDocument.length !== 11 && cleanDocument.length !== 14)) {
        throw new Error('CPF/CNPJ inválido. Deve ter 11 dígitos (CPF) ou 14 dígitos (CNPJ)');
      }

      const abacatePayRequest: AbacatePayPixQrCodeRequest = {
        amount: request.amount, // Valor em centavos
        expiresIn: 24 * 60 * 60, // 24 horas em segundos
        description: `Ingresso para ${request.eventName}`.substring(0, 140), // Limitar a 140 caracteres
        customer: {
          name: request.customerName,
          cellphone: '', // Opcional, pode ser vazio
          email: request.customerEmail,
          taxId: cleanDocument, // CPF/CNPJ apenas números
        },
        metadata: {
          externalId: request.ticketId,
          userId: request.userId,
          eventId: request.eventId,
        },
      };

      // Log para debug (sem dados sensíveis completos)
      console.log('Criando pagamento AbacatePay:', {
        amount: request.amount,
        hasCustomer: !!abacatePayRequest.customer,
        customerName: abacatePayRequest.customer?.name,
        customerEmail: abacatePayRequest.customer?.email,
        taxIdLength: abacatePayRequest.customer?.taxId?.length,
        taxIdPrefix: abacatePayRequest.customer?.taxId?.substring(0, 3) + '***',
      });

      // Chamar API do AbacatePay para criar QRCode PIX
      const abacatePayResponse = await this.createAbacatePayPixQrCode(abacatePayRequest);

      // Atualizar pagamento com dados do AbacatePay
      const updatedPayment = await this.paymentRepository.updateWithAbacatePayData(
        payment.id, 
        abacatePayResponse
      );

      return {
        success: true,
        payment: updatedPayment,
        pixQrCode: abacatePayResponse.data.brCodeBase64, // Imagem base64 do QR Code
        pixQrCodeBase64: abacatePayResponse.data.brCodeBase64, // Imagem base64 do QR Code
        pixCopyPaste: abacatePayResponse.data.brCode, // Código copia-e-cola
        expiresAt: updatedPayment.expiresAt,
      };

    } catch (error) {
      console.error('Erro ao criar pagamento PIX:', error);
      throw new Error(`Falha ao criar pagamento PIX: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  /**
   * Processa webhook do AbacatePay
   */
  async processWebhook(webhookPayload: AbacatePayWebhookPayload): Promise<void> {
    try {
      console.log('Processando webhook do AbacatePay:', JSON.stringify(webhookPayload, null, 2));

      const { type, billing } = webhookPayload;

      // Verificar se é um webhook de pagamento
      if (!billing || !billing.id) {
        console.log('Webhook ignorado - billing ID não encontrado');
        return;
      }

      // Buscar pagamento pelo billing ID do AbacatePay
      const payment = await this.paymentRepository.findByAbacatePayBillingId(billing.id);

      if (!payment) {
        console.error(`Pagamento não encontrado para billing AbacatePay: ${billing.id}`);
        return;
      }

      // Atualizar status baseado no status do billing
      // O AbacatePay pode enviar status em diferentes formatos
      let newStatus: PaymentStatus;
      let additionalData: Partial<Payment> = {};

      const billingStatus = billing.status?.toLowerCase() || '';
      
      console.log(`Processando webhook: type=${type}, billing.status=${billing.status}`);

      // Verificar diferentes formatos de status "paid"
      if (
        billingStatus === 'paid' || 
        billingStatus === 'completed' ||
        billingStatus === 'approved' ||
        type?.toLowerCase().includes('paid') ||
        type?.toLowerCase().includes('completed')
      ) {
        newStatus = PaymentStatus.PAID;
      } else if (billingStatus === 'failed' || billingStatus === 'rejected') {
        newStatus = PaymentStatus.FAILED;
      } else if (billingStatus === 'cancelled' || billingStatus === 'canceled') {
        newStatus = PaymentStatus.CANCELLED;
      } else if (billingStatus === 'pending') {
        newStatus = PaymentStatus.PENDING;
      } else if (billingStatus === 'expired') {
        newStatus = PaymentStatus.EXPIRED;
      } else {
        // Se não reconhecer, manter como pendente
        console.warn(`Status desconhecido do webhook: ${billing.status}, tipo: ${type}`);
        newStatus = PaymentStatus.PENDING;
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
   * Se o status estiver pendente, consulta diretamente no AbacatePay
   */
  async getPaymentStatus(paymentId: string): Promise<PaymentStatusResponse> {
    try {
      const payment = await this.paymentRepository.findById(paymentId);

      if (!payment) {
        throw new Error('Pagamento não encontrado');
      }

      // Se o pagamento estiver pendente ou aguardando pagamento e tiver ID do AbacatePay,
      // consultar status diretamente na API do AbacatePay para sincronizar
      if (
        payment.abacatePayBillingId && 
        payment.status === PaymentStatus.PENDING
      ) {
        try {
          const abacatePayStatus = await this.checkAbacatePayStatus(payment.abacatePayBillingId);
          
          // Se encontrou status no AbacatePay, verificar se precisa atualizar
          if (abacatePayStatus) {
            let newStatus: PaymentStatus | null = null;
            
            // Mapear status do AbacatePay para nosso enum
            if (abacatePayStatus === 'PAID') {
              newStatus = PaymentStatus.PAID;
            } else if (abacatePayStatus === 'EXPIRED') {
              newStatus = PaymentStatus.EXPIRED;
            } else if (abacatePayStatus === 'CANCELLED') {
              newStatus = PaymentStatus.CANCELLED;
            } else if (abacatePayStatus === 'PENDING') {
              newStatus = PaymentStatus.PENDING;
            }

            // Se o status mudou e foi determinado, atualizar no banco
            if (newStatus && newStatus !== payment.status) {
              const updatedPayment = await this.paymentRepository.updateStatus(payment.id, newStatus);
              
              console.log(`Status do pagamento ${paymentId} atualizado via consulta: ${payment.status} -> ${newStatus}`);
              
              return {
                success: true,
                payment: updatedPayment,
              };
            }
          }
        } catch (error) {
          // Se falhar ao consultar AbacatePay, retornar status atual do banco
          console.warn(`Não foi possível consultar status no AbacatePay para pagamento ${paymentId}:`, error);
        }
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
   * Consulta status de um pagamento diretamente no AbacatePay
   * Tenta usar o endpoint /pixQrCode/{id} primeiro, depois /pixQrCode/check/{id}
   * Nota: Se ambos falharem, o webhook será a fonte de verdade
   */
  private async checkAbacatePayStatus(pixQrCodeId: string): Promise<string | null> {
    try {
      if (!this.abacatePayApiKey) {
        console.warn('AbacatePay API Key não configurada para consulta de status');
        return null;
      }

      // Tentar endpoint principal: GET /v1/pixQrCode/{id}
      let response = await fetch(`${this.abacatePayBaseUrl}/pixQrCode/check?id=${pixQrCodeId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.abacatePayApiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        // Se não encontrar (404), pode ser que o endpoint não exista ou o ID esteja errado
        // Neste caso, confiar apenas nos webhooks
        if (response.status === 404) {
          console.warn(
            `⚠️ PixQrCode ${pixQrCodeId} não encontrado no AbacatePay. ` +
            `Isso é normal se o endpoint de consulta não estiver disponível. ` +
            `O status será atualizado via webhook quando o pagamento for confirmado.`
          );
          return null;
        }
        // Para outros erros, logar mas não falhar
        const errorText = await response.text().catch(() => 'Erro desconhecido');
        console.warn(`Erro ao consultar status no AbacatePay (${response.status}):`, errorText.substring(0, 200));
        return null;
      }

      const data = await response.json() as {
        data?: {
          id?: string;
          status?: 'PENDING' | 'EXPIRED' | 'CANCELLED' | 'PAID' | 'REFUNDED';
          [key: string]: any;
        };
        error?: string | null;
      };

      if (data.data?.status) {
        console.log(`✅ Status consultado no AbacatePay para ${pixQrCodeId}: ${data.data.status}`);
        return data.data.status;
      }

      console.warn(`Resposta do AbacatePay não contém status para ${pixQrCodeId}`);
      return null;
    } catch (error) {
      console.error('Erro ao consultar status no AbacatePay:', error);
      // Não falhar - webhooks são a fonte primária de atualização
      return null;
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
   * Atualiza status de pagamento manualmente (apenas para desenvolvimento/testes)
   * Em produção, usar webhooks do AbacatePay
   */
  async updatePaymentStatusManually(paymentId: string, status: PaymentStatus): Promise<Payment> {
    try {
      const payment = await this.paymentRepository.findById(paymentId);

      if (!payment) {
        throw new Error('Pagamento não encontrado');
      }

      // Atualizar status
      return await this.paymentRepository.updateStatus(paymentId, status);

    } catch (error) {
      console.error('Erro ao atualizar status manualmente:', error);
      throw new Error(`Falha ao atualizar status: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  /**
   * Cria QRCode PIX no AbacatePay usando a API REST
   */
  private async createAbacatePayPixQrCode(request: AbacatePayPixQrCodeRequest): Promise<AbacatePayPixQrCodeResponse> {
    try {
      if (!this.abacatePayApiKey) {
        throw new Error('AbacatePay não está configurado. Verifique a variável ABACATEPAY_API_KEY');
      }

      const response = await fetch(`${this.abacatePayBaseUrl}/pixQrCode/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.abacatePayApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        let errorData: any = {};
        try {
          errorData = await response.json();
        } catch (e) {
          // Se não conseguir parsear JSON, usar texto da resposta
          const text = await response.text().catch(() => 'Erro desconhecido');
          errorData = { error: text, message: text };
        }

        const errorMessage = errorData.error || errorData.message || errorData.details || 'Erro desconhecido';
        
        // Log detalhado do erro (sem dados sensíveis)
        console.error('Erro na resposta do AbacatePay:', {
          status: response.status,
          statusText: response.statusText,
          error: errorMessage,
          hasDetails: !!errorData.details,
          requestBody: {
            amount: request.amount,
            hasCustomer: !!request.customer,
            taxIdLength: request.customer?.taxId?.length,
          },
        });
        
        if (response.status === 401) {
          throw new Error('Credenciais inválidas do AbacatePay');
        } else if (response.status === 422 || response.status === 400) {
          // Erros de validação - incluir detalhes se disponíveis
          let errorMsg = `Dados inválidos para AbacatePay: ${errorMessage}`;
          if (errorData.details && typeof errorData.details === 'object') {
            errorMsg += ` - ${JSON.stringify(errorData.details)}`;
          }
          throw new Error(errorMsg);
        } else {
          throw new Error(`Erro na API do AbacatePay: ${errorMessage} (Status: ${response.status})`);
        }
      }

      const data = await response.json() as {
        data: {
          id: string;
          amount: number;
          status: 'PENDING' | 'EXPIRED' | 'CANCELLED' | 'PAID' | 'REFUNDED';
          devMode?: boolean;
          brCode: string;
          brCodeBase64: string;
          platformFee?: number;
          createdAt: string;
          updatedAt: string;
          expiresAt: string;
        };
        error?: string | null;
      };

      // Validar dados obrigatórios da resposta
      if (!data.data) {
        throw new Error('Resposta do AbacatePay não contém dados');
      }

      if (!data.data.id) {
        throw new Error('Resposta do AbacatePay não contém ID');
      }

      if (!data.data.brCode) {
        throw new Error('Resposta do AbacatePay não contém código PIX');
      }

      // Log para debug (sem dados sensíveis)
      console.log('Resposta do AbacatePay recebida:', {
        id: data.data.id,
        status: data.data.status,
        hasBrCode: !!data.data.brCode,
        hasBrCodeBase64: !!data.data.brCodeBase64,
        brCodeLength: data.data.brCode?.length || 0,
        brCodeBase64Length: data.data.brCodeBase64?.length || 0,
      });

      // Mapear resposta do AbacatePay para nosso formato
      return {
        data: {
          id: data.data.id,
          amount: data.data.amount,
          status: data.data.status,
          devMode: data.data.devMode || false,
          brCode: data.data.brCode, // Código copia-e-cola
          brCodeBase64: data.data.brCodeBase64 || '', // Imagem base64 do QR Code (pode ser vazia)
          platformFee: data.data.platformFee || 0,
          createdAt: data.data.createdAt,
          updatedAt: data.data.updatedAt,
          expiresAt: data.data.expiresAt,
        },
        error: data.error || null,
      };

    } catch (error) {
      console.error('Erro na API do AbacatePay:', error);
      
      if (error instanceof Error) {
        // Re-throw erros já tratados
        if (error.message.includes('Credenciais inválidas') || 
            error.message.includes('Dados inválidos') ||
            error.message.includes('Erro na API')) {
          throw error;
        }
        throw new Error(`Erro ao chamar API do AbacatePay: ${error.message}`);
      }
      
      throw new Error(`Erro ao chamar API do AbacatePay: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
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
    const cleanDocument = request.customerDocument.replace(/\D/g, '');
    if (!documentRegex.test(cleanDocument)) {
      throw new Error('Documento inválido (deve ser CPF ou CNPJ)');
    }
  }

  /**
   * Verifica se as credenciais do AbacatePay estão configuradas
   */
  isAbacatePayConfigured(): boolean {
    return !!this.abacatePayApiKey;
  }
}
