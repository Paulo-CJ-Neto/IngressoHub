import { PaymentService } from '../PaymentService';
import { PaymentRepository } from '../../db/repositories/PaymentRepository';
import { PaymentStatus } from '../../types/payment';
import { createMockPayment } from '../../test-utils/helpers';
import { AbacatePay } from 'abacatepay';

jest.mock('abacatepay');
jest.mock('../../db/repositories/PaymentRepository');

describe('PaymentService', () => {
  let paymentService: PaymentService;
  let mockPaymentRepository: jest.Mocked<PaymentRepository>;
  let mockAbacatePay: jest.Mocked<AbacatePay>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock AbacatePay
    const mockCreateBilling = jest.fn();
    mockAbacatePay = {
      createBilling: mockCreateBilling,
    } as any;
    
    (AbacatePay as jest.MockedClass<typeof AbacatePay>).mockImplementation(() => mockAbacatePay);
    
    // Mock environment variable
    process.env.ABACATEPAY_API_KEY = 'test-api-key';
    
    paymentService = new PaymentService();
    mockPaymentRepository = PaymentRepository as jest.Mocked<typeof PaymentRepository>;
  });

  afterEach(() => {
    delete process.env.ABACATEPAY_API_KEY;
  });

  describe('createPixPayment', () => {
    const mockRequest = {
      userId: 'user_123',
      ticketId: 'ticket_123',
      eventId: 'event_123',
      amount: 100,
      eventName: 'Test Event',
      customerName: 'Test Customer',
      customerEmail: 'customer@example.com',
      customerDocument: '12345678900',
    };

    it('deve criar pagamento PIX com sucesso', async () => {
      const mockPayment = createMockPayment();
      const mockAbacatePayResponse = {
        id: 'billing_123',
        status: 'pending',
        integration: {
          pix: {
            code: 'pix_code_123',
            qrCodeUrl: 'https://example.com/qrcode.png',
          },
        },
      };

      mockPaymentRepository.prototype.create = jest.fn().mockResolvedValue(mockPayment);
      mockPaymentRepository.prototype.updateWithAbacatePayData = jest.fn().mockResolvedValue({
        ...mockPayment,
        abacatePayBillingId: 'billing_123',
      });

      mockAbacatePay.createBilling = jest.fn().mockResolvedValue(mockAbacatePayResponse);

      const result = await paymentService.createPixPayment(mockRequest);

      expect(result.success).toBe(true);
      expect(result.payment).toBeDefined();
      expect(result.pixQrCode).toBe(mockAbacatePayResponse.integration.pix.code);
      expect(mockPaymentRepository.prototype.create).toHaveBeenCalled();
      expect(mockAbacatePay.createBilling).toHaveBeenCalled();
    });

    it('deve lançar erro se dados inválidos', async () => {
      const invalidRequest = {
        ...mockRequest,
        amount: -1,
      };

      await expect(paymentService.createPixPayment(invalidRequest)).rejects.toThrow();
    });

    it('deve lançar erro se email inválido', async () => {
      const invalidRequest = {
        ...mockRequest,
        customerEmail: 'invalid-email',
      };

      await expect(paymentService.createPixPayment(invalidRequest)).rejects.toThrow();
    });

    it('deve lançar erro se AbacatePay falhar', async () => {
      const mockPayment = createMockPayment();
      mockPaymentRepository.prototype.create = jest.fn().mockResolvedValue(mockPayment);

      mockAbacatePay.createBilling = jest.fn().mockRejectedValue(new Error('API Error'));

      await expect(paymentService.createPixPayment(mockRequest)).rejects.toThrow();
    });
  });

  describe('processWebhook', () => {
    it('deve processar webhook de pagamento aprovado', async () => {
      const mockPayment = createMockPayment({ abacatePayBillingId: 'billing_123' });
      const webhookPayload = {
        type: 'billing.paid',
        billing: {
          id: 'billing_123',
          status: 'paid',
        },
        customer: {
          id: 'user_123',
        },
      };

      mockPaymentRepository.prototype.findByAbacatePayBillingId = jest.fn().mockResolvedValue(mockPayment);
      mockPaymentRepository.prototype.updateStatus = jest.fn().mockResolvedValue({
        ...mockPayment,
        status: PaymentStatus.PAID,
      });

      await paymentService.processWebhook(webhookPayload);

      expect(mockPaymentRepository.prototype.updateStatus).toHaveBeenCalledWith(
        mockPayment.id,
        PaymentStatus.PAID,
        expect.any(Object)
      );
    });

    it('deve processar webhook de pagamento falhado', async () => {
      const mockPayment = createMockPayment({ abacatePayBillingId: 'billing_123' });
      const webhookPayload = {
        type: 'billing.failed',
        billing: {
          id: 'billing_123',
          status: 'failed',
        },
        customer: {
          id: 'user_123',
        },
      };

      mockPaymentRepository.prototype.findByAbacatePayBillingId = jest.fn().mockResolvedValue(mockPayment);
      mockPaymentRepository.prototype.updateStatus = jest.fn().mockResolvedValue({
        ...mockPayment,
        status: PaymentStatus.FAILED,
      });

      await paymentService.processWebhook(webhookPayload);

      expect(mockPaymentRepository.prototype.updateStatus).toHaveBeenCalledWith(
        mockPayment.id,
        PaymentStatus.FAILED,
        expect.any(Object)
      );
    });

    it('deve ignorar webhook sem billing ID', async () => {
      const webhookPayload = {
        type: 'billing.created',
        billing: {},
      };

      await paymentService.processWebhook(webhookPayload);

      expect(mockPaymentRepository.prototype.updateStatus).not.toHaveBeenCalled();
    });
  });

  describe('getPaymentStatus', () => {
    it('deve retornar status do pagamento', async () => {
      const mockPayment = createMockPayment();
      mockPaymentRepository.prototype.findById = jest.fn().mockResolvedValue(mockPayment);

      const result = await paymentService.getPaymentStatus('payment_123');

      expect(result.success).toBe(true);
      expect(result.payment).toEqual(mockPayment);
    });

    it('deve lançar erro se pagamento não encontrado', async () => {
      mockPaymentRepository.prototype.findById = jest.fn().mockResolvedValue(null);

      await expect(paymentService.getPaymentStatus('invalid_id')).rejects.toThrow();
    });
  });

  describe('cancelPayment', () => {
    it('deve cancelar pagamento pendente', async () => {
      const mockPayment = createMockPayment({ status: PaymentStatus.PENDING });
      mockPaymentRepository.prototype.findById = jest.fn().mockResolvedValue(mockPayment);
      mockPaymentRepository.prototype.updateStatus = jest.fn().mockResolvedValue({
        ...mockPayment,
        status: PaymentStatus.CANCELLED,
      });

      const result = await paymentService.cancelPayment('payment_123');

      expect(result.status).toBe(PaymentStatus.CANCELLED);
    });

    it('deve lançar erro ao cancelar pagamento já aprovado', async () => {
      const mockPayment = createMockPayment({ status: PaymentStatus.PAID });
      mockPaymentRepository.prototype.findById = jest.fn().mockResolvedValue(mockPayment);

      await expect(paymentService.cancelPayment('payment_123')).rejects.toThrow();
    });
  });

  describe('isAbacatePayConfigured', () => {
    it('deve retornar true se API key configurada', () => {
      process.env.ABACATEPAY_API_KEY = 'test-key';
      const service = new PaymentService();
      expect(service.isAbacatePayConfigured()).toBe(true);
    });

    it('deve retornar false se API key não configurada', () => {
      delete process.env.ABACATEPAY_API_KEY;
      const service = new PaymentService();
      expect(service.isAbacatePayConfigured()).toBe(false);
    });
  });
});
