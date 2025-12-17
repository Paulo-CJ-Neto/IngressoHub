import { TicketRepository } from '../TicketRepository';
import { docClient } from '../../client';
import { createMockTicket } from '../../../test-utils/helpers';
import { GetCommand, PutCommand, UpdateCommand, QueryCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';

jest.mock('../../client');

describe('TicketRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('deve buscar ingresso por ID', async () => {
      const mockTicket = createMockTicket();
      (docClient.send as jest.Mock).mockResolvedValue({ Item: mockTicket });

      const result = await TicketRepository.findById('ticket_123');

      expect(result).toEqual(mockTicket);
      expect(docClient.send).toHaveBeenCalledWith(expect.any(GetCommand));
    });
  });

  describe('findByQrCode', () => {
    it('deve buscar ingresso por QR code usando índice', async () => {
      const mockTicket = createMockTicket({ qr_code: 'QR_123' });
      (docClient.send as jest.Mock).mockResolvedValue({ Items: [mockTicket] });

      const result = await TicketRepository.findByQrCode('QR_123');

      expect(result).toEqual(mockTicket);
      expect(docClient.send).toHaveBeenCalledWith(expect.any(QueryCommand));
    });

    it('deve fazer scan se índice não existir', async () => {
      const mockTicket = createMockTicket({ qr_code: 'QR_123' });
      (docClient.send as jest.Mock)
        .mockRejectedValueOnce(new Error('Index not found'))
        .mockResolvedValueOnce({ Items: [mockTicket] });

      const result = await TicketRepository.findByQrCode('QR_123');

      expect(result).toEqual(mockTicket);
    });
  });

  describe('findByEventId', () => {
    it('deve buscar ingressos por evento', async () => {
      const mockTickets = [
        createMockTicket({ event_id: 'event_123' }),
        createMockTicket({ event_id: 'event_123' }),
      ];
      (docClient.send as jest.Mock).mockResolvedValue({ Items: mockTickets });

      const result = await TicketRepository.findByEventId('event_123');

      expect(result).toHaveLength(2);
      expect(result.every(t => t.event_id === 'event_123')).toBe(true);
    });
  });

  describe('findByBuyerEmail', () => {
    it('deve buscar ingressos por email do comprador', async () => {
      const mockTickets = [
        createMockTicket({ buyer_email: 'buyer@example.com' }),
      ];
      (docClient.send as jest.Mock).mockResolvedValue({ Items: mockTickets });

      const result = await TicketRepository.findByBuyerEmail('buyer@example.com');

      expect(result).toHaveLength(1);
      expect(result[0].buyer_email).toBe('buyer@example.com');
    });
  });

  describe('validateTicket', () => {
    it('deve validar ingresso e marcar como usado', async () => {
      const mockTicket = createMockTicket({ status: 'valid' });
      const updatedTicket = { ...mockTicket, status: 'used', used_at: new Date().toISOString() };
      (docClient.send as jest.Mock).mockResolvedValue({ Attributes: updatedTicket });

      const result = await TicketRepository.validateTicket('ticket_123');

      expect(result?.status).toBe('used');
      expect(result?.used_at).toBeDefined();
      expect(docClient.send).toHaveBeenCalledWith(expect.any(UpdateCommand));
    });
  });

  describe('cancelTicket', () => {
    it('deve cancelar ingresso', async () => {
      const mockTicket = createMockTicket();
      const cancelledTicket = { ...mockTicket, status: 'cancelled' };
      (docClient.send as jest.Mock).mockResolvedValue({ Attributes: cancelledTicket });

      const result = await TicketRepository.cancelTicket('ticket_123');

      expect(result?.status).toBe('cancelled');
    });
  });

  describe('generateUniqueQrCode', () => {
    it('deve gerar QR code único', async () => {
      (docClient.send as jest.Mock).mockResolvedValue({ Items: [] });

      const qrCode = await TicketRepository.generateUniqueQrCode();

      expect(qrCode).toMatch(/^QR_\d+_[a-z0-9]+$/);
    });
  });
});

