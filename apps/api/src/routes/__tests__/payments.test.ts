import request from 'supertest';
import express from 'express';
import paymentsRouter from '../payments';
import { PaymentService } from '../../services/PaymentService';
import { createMockPayment } from '../../test-utils/helpers';
import { PaymentStatus } from '../../types/payment';

jest.mock('../../services/PaymentService');

const app = express();
app.use(express.json());
app.use('/api/payments', paymentsRouter);

describe('Payments Routes', () => {
  let mockPaymentService: jest.Mocked<PaymentService>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPaymentService = PaymentService as jest.Mocked<typeof PaymentService>;
    (PaymentService as any).mockImplementation(() => ({
      isAbacatePayConfigured: jest.fn().mockReturnValue(true),
      createPixPayment: jest.fn(),
      processWebhook: jest.fn(),
      getPaymentStatus: jest.fn(),
      getUserPayments: jest.fn(),
      cancelPayment: jest.fn(),
    }));
  });

  describe('POST /api/payments/pix', () => {
    it('deve criar pagamento PIX com sucesso', async () => {
      const mockPayment = createMockPayment();
      const requestData = {
        userId: 'user_123',
        ticketId: 'ticket_123',
        eventId: 'event_123',
        amount: 100,
        eventName: 'Test Event',
        customerName: 'Test Customer',
        customerEmail: 'customer@example.com',
        customerDocument: '12345678900',
      };

      const paymentServiceInstance = new PaymentService();
      (paymentServiceInstance.createPixPayment as jest.Mock).mockResolvedValue({
        success: true,
        payment: mockPayment,
        pixQrCode: 'pix_qr_123',
        pixQrCodeBase64: 'base64_qr',
        pixCopyPaste: 'pix_qr_123',
        expiresAt: new Date().toISOString(),
      });

      const response = await request(app)
        .post('/api/payments/pix')
        .send(requestData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });

    it('deve retornar erro se dados obrigatórios faltando', async () => {
      const response = await request(app)
        .post('/api/payments/pix')
        .send({ userId: 'user_123' });

      expect(response.status).toBe(400);
    });

    it('deve retornar erro se AbacatePay não configurado', async () => {
      const paymentServiceInstance = new PaymentService();
      (paymentServiceInstance.isAbacatePayConfigured as jest.Mock).mockReturnValue(false);

      const response = await request(app)
        .post('/api/payments/pix')
        .send({
          userId: 'user_123',
          ticketId: 'ticket_123',
          eventId: 'event_123',
          amount: 100,
        });

      expect(response.status).toBe(503);
    });
  });

  describe('POST /api/payments/webhook', () => {
    it('deve processar webhook do AbacatePay', async () => {
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

      const paymentServiceInstance = new PaymentService();
      (paymentServiceInstance.processWebhook as jest.Mock).mockResolvedValue(undefined);

      const response = await request(app)
        .post('/api/payments/webhook')
        .send(webhookPayload);

      expect(response.status).toBe(200);
    });

    it('deve retornar erro se webhook inválido', async () => {
      const response = await request(app)
        .post('/api/payments/webhook')
        .send({ invalid: 'data' });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/payments/status/:id', () => {
    it('deve retornar status do pagamento', async () => {
      const mockPayment = createMockPayment();
      const paymentServiceInstance = new PaymentService();
      (paymentServiceInstance.getPaymentStatus as jest.Mock).mockResolvedValue({
        success: true,
        payment: mockPayment,
      });

      const response = await request(app).get('/api/payments/status/payment_123');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});

