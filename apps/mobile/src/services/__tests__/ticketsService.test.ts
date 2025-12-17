import { ticketsService } from '../ticketsService';
import api from '../api';
import { Ticket } from '@ingressohub/entities';

jest.mock('../api');

describe('ticketsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllTickets', () => {
    it('deve buscar todos os tickets', async () => {
      const mockTickets: Ticket[] = [
        {
          id: 'ticket_1',
          event_id: 'event_1',
          buyer_name: 'Buyer 1',
          buyer_cpf: '12345678900',
          buyer_email: 'buyer1@example.com',
          quantity: 1,
          total_price: 100,
          qr_code: 'QR_1',
          status: 'valid',
          created_at: new Date().toISOString(),
        },
      ];

      (api.get as jest.Mock).mockResolvedValue({ data: mockTickets });

      const result = await ticketsService.getAllTickets();

      expect(result).toEqual(mockTickets);
      expect(api.get).toHaveBeenCalledWith('/tickets');
    });
  });

  describe('getTicketsByEvent', () => {
    it('deve buscar tickets por evento', async () => {
      const mockTickets: Ticket[] = [];
      (api.get as jest.Mock).mockResolvedValue({ data: mockTickets });

      const result = await ticketsService.getTicketsByEvent('event_123');

      expect(result).toEqual(mockTickets);
      expect(api.get).toHaveBeenCalledWith('/tickets/event/event_123');
    });
  });

  describe('getTicketByQrCode', () => {
    it('deve buscar ticket por QR code', async () => {
      const mockTicket: Ticket = {
        id: 'ticket_123',
        event_id: 'event_123',
        buyer_name: 'Buyer',
        buyer_cpf: '12345678900',
        buyer_email: 'buyer@example.com',
        quantity: 1,
        total_price: 100,
        qr_code: 'QR_123',
        status: 'valid',
        created_at: new Date().toISOString(),
      };

      (api.get as jest.Mock).mockResolvedValue({ data: mockTicket });

      const result = await ticketsService.getTicketByQrCode('QR_123');

      expect(result).toEqual(mockTicket);
      expect(api.get).toHaveBeenCalledWith('/tickets/qr/QR_123');
    });
  });

  describe('validateTicketByIds', () => {
    it('deve validar ticket com sucesso', async () => {
      const mockResponse = {
        status: 'valid' as const,
        validatedAt: new Date().toISOString(),
      };

      (api.post as jest.Mock).mockResolvedValue({ data: mockResponse });

      const result = await ticketsService.validateTicketByIds({
        ticket_id: 'ticket_123',
        event_id: 'event_123',
      });

      expect(result.status).toBe('valid');
      expect(api.post).toHaveBeenCalledWith('/validate-ticket', {
        ticket_id: 'ticket_123',
        event_id: 'event_123',
      });
    });

    it('deve retornar already_used se ticket já usado', async () => {
      const mockResponse = {
        status: 'already_used' as const,
        usedAt: new Date().toISOString(),
      };

      (api.post as jest.Mock).mockResolvedValue({ data: mockResponse });

      const result = await ticketsService.validateTicketByIds({
        ticket_id: 'ticket_123',
        event_id: 'event_123',
      });

      expect(result.status).toBe('already_used');
    });
  });
});

