import { PaymentRepository } from '../PaymentRepository';
import { docClient } from '../../index';
import { createMockPayment } from '../../../test-utils/helpers';
import { PaymentStatus } from '../../../types/payment';
import { GetCommand, PutCommand, UpdateCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';

jest.mock('../../index', () => ({
  docClient: {
    send: jest.fn(),
  },
  TABLE_NAMES: {
    PAYMENTS: 'Payments-Test',
  },
}));

describe('PaymentRepository', () => {
  let repository: PaymentRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    repository = new PaymentRepository();
  });

  describe('create', () => {
    it('deve criar pagamento com sucesso', async () => {
      const mockPayment = createMockPayment();
      (docClient.send as jest.Mock).mockResolvedValue({});

      const result = await repository.create(mockPayment);

      expect(result).toEqual(mockPayment);
      expect(docClient.send).toHaveBeenCalled();
      const callArg = (docClient.send as jest.Mock).mock.calls[0][0];
      expect(callArg.input).toMatchObject({ 
        TableName: expect.any(String), 
        Item: expect.any(Object),
        ConditionExpression: 'attribute_not_exists(id)'
      });
    });

    it('deve lançar erro se pagamento já existe', async () => {
      const mockPayment = createMockPayment();
      (docClient.send as jest.Mock).mockRejectedValue(new Error('ConditionalCheckFailedException'));

      await expect(repository.create(mockPayment)).rejects.toThrow();
    });
  });

  describe('findById', () => {
    it('deve buscar pagamento por ID', async () => {
      const mockPayment = createMockPayment();
      (docClient.send as jest.Mock).mockResolvedValue({ Item: mockPayment });

      const result = await repository.findById('payment_123');

      expect(result).toEqual(mockPayment);
      expect(docClient.send).toHaveBeenCalled();
      const callArg = (docClient.send as jest.Mock).mock.calls[0][0];
      expect(callArg.input).toMatchObject({ 
        TableName: expect.any(String), 
        Key: { id: 'payment_123' }
      });
    });

    it('deve retornar null se pagamento não encontrado', async () => {
      (docClient.send as jest.Mock).mockResolvedValue({ Item: null });

      const result = await repository.findById('invalid_id');

      expect(result).toBeNull();
    });
  });

  describe('findByUserId', () => {
    it('deve buscar pagamentos por usuário', async () => {
      const mockPayments = [
        createMockPayment({ userId: 'user_123' }),
        createMockPayment({ userId: 'user_123' }),
      ];
      (docClient.send as jest.Mock).mockResolvedValue({ Items: mockPayments });

      const result = await repository.findByUserId('user_123');

      expect(result).toHaveLength(2);
      expect(result.every(p => p.userId === 'user_123')).toBe(true);
    });
  });

  describe('updateStatus', () => {
    it('deve atualizar status do pagamento', async () => {
      const mockPayment = createMockPayment();
      const updatedPayment = { ...mockPayment, status: PaymentStatus.PAID };
      (docClient.send as jest.Mock).mockResolvedValue({ Attributes: updatedPayment });

      const result = await repository.updateStatus('payment_123', PaymentStatus.PAID);

      expect(result.status).toBe(PaymentStatus.PAID);
      expect(docClient.send).toHaveBeenCalled();
      const callArg = (docClient.send as jest.Mock).mock.calls[0][0];
      expect(callArg.input).toMatchObject({ 
        TableName: expect.any(String),
        Key: { id: 'payment_123' },
        UpdateExpression: expect.stringContaining('status')
      });
    });

    it('deve atualizar status com dados adicionais', async () => {
      const mockPayment = createMockPayment();
      const updatedPayment = {
        ...mockPayment,
        status: PaymentStatus.PAID,
        abacatePayBillingId: 'billing_123',
      };
      (docClient.send as jest.Mock).mockResolvedValue({ Attributes: updatedPayment });

      const result = await repository.updateStatus(
        'payment_123',
        PaymentStatus.PAID,
        { abacatePayBillingId: 'billing_123' }
      );

      expect(result.abacatePayBillingId).toBe('billing_123');
    });
  });

  describe('updateWithAbacatePayData', () => {
    it('deve atualizar pagamento com dados do AbacatePay', async () => {
      const mockPayment = createMockPayment();
      const abacatePayData = {
        id: 'billing_123',
        integration: {
          pix: {
            code: 'pix_code_123',
            qrCodeUrl: 'https://example.com/qrcode.png',
          },
        },
      };
      const updatedPayment = {
        ...mockPayment,
        abacatePayBillingId: 'billing_123',
        pixQrCode: 'pix_code_123',
        pixQrCodeBase64: 'https://example.com/qrcode.png',
        pixCopyPaste: 'pix_code_123',
      };
      (docClient.send as jest.Mock).mockResolvedValue({ Attributes: updatedPayment });

      const result = await repository.updateWithAbacatePayData('payment_123', abacatePayData);

      expect(result.abacatePayBillingId).toBe('billing_123');
      expect(result.pixQrCode).toBe('pix_code_123');
      expect(result.pixCopyPaste).toBe('pix_code_123');
    });
  });
});

