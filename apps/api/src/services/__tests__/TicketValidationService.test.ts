import { TicketValidationService } from '../TicketValidationService';
import { TicketRepository } from '../../db/repositories/TicketRepository';
import { createMockTicket } from '../../test-utils/helpers';

jest.mock('../../db/repositories/TicketRepository');

describe('TicketValidationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('validateByIds', () => {
    it('deve validar ingresso válido com sucesso', async () => {
      const mockTicket = createMockTicket({
        id: 'ticket_123',
        event_id: 'event_123',
        status: 'valid',
      });

      (TicketRepository.findById as jest.Mock).mockResolvedValue(mockTicket);
      (TicketRepository.validateTicket as jest.Mock).mockResolvedValue({
        ...mockTicket,
        status: 'used',
        used_at: new Date().toISOString(),
      });

      const result = await TicketValidationService.validateByIds({
        ticket_id: 'ticket_123',
        event_id: 'event_123',
      });

      expect(result.status).toBe('valid');
      expect('validatedAt' in result).toBe(true);
      expect(TicketRepository.validateTicket).toHaveBeenCalledWith('ticket_123');
    });

    it('deve retornar invalid se ingresso não encontrado', async () => {
      (TicketRepository.findById as jest.Mock).mockResolvedValue(null);

      const result = await TicketValidationService.validateByIds({
        ticket_id: 'invalid_id',
        event_id: 'event_123',
      });

      expect(result.status).toBe('invalid');
    });

    it('deve retornar invalid se evento não corresponde', async () => {
      const mockTicket = createMockTicket({
        id: 'ticket_123',
        event_id: 'event_456',
        status: 'valid',
      });

      (TicketRepository.findById as jest.Mock).mockResolvedValue(mockTicket);

      const result = await TicketValidationService.validateByIds({
        ticket_id: 'ticket_123',
        event_id: 'event_123',
      });

      expect(result.status).toBe('invalid');
    });

    it('deve retornar already_used se ingresso já foi usado', async () => {
      const mockTicket = createMockTicket({
        id: 'ticket_123',
        event_id: 'event_123',
        status: 'used',
        used_at: new Date().toISOString(),
      });

      (TicketRepository.findById as jest.Mock).mockResolvedValue(mockTicket);

      const result = await TicketValidationService.validateByIds({
        ticket_id: 'ticket_123',
        event_id: 'event_123',
      });

      expect(result.status).toBe('already_used');
      expect('usedAt' in result).toBe(true);
    });

    it('deve retornar already_used se validação falhar por condição', async () => {
      const mockTicket = createMockTicket({
        id: 'ticket_123',
        event_id: 'event_123',
        status: 'cancelled',
      });

      (TicketRepository.findById as jest.Mock).mockResolvedValue(mockTicket);
      (TicketRepository.validateTicket as jest.Mock).mockRejectedValue(new Error('Condition failed'));

      const result = await TicketValidationService.validateByIds({
        ticket_id: 'ticket_123',
        event_id: 'event_123',
      });

      expect(result.status).toBe('already_used');
    });
  });
});

