import request from 'supertest';
import express from 'express';
import ticketsRouter from '../tickets';
import { TicketRepository } from '../../db/repositories/TicketRepository';
import { EventRepository } from '../../db/repositories/EventRepository';
import { createMockTicket } from '../../test-utils/helpers';

jest.mock('../../db/repositories/TicketRepository');
jest.mock('../../db/repositories/EventRepository');
jest.mock('../../services/TicketIssueService');

const app = express();
app.use(express.json());
app.use('/api/tickets', ticketsRouter);

describe('Tickets Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/tickets', () => {
    it('deve listar todos os tickets', async () => {
      const mockTickets = [createMockTicket(), createMockTicket()];
      (TicketRepository.findAll as jest.Mock).mockResolvedValue(mockTickets);

      const response = await request(app).get('/api/tickets');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
    });
  });

  describe('GET /api/tickets/event/:eventId', () => {
    it('deve buscar tickets por evento', async () => {
      const mockTickets = [createMockTicket({ event_id: 'event_123' })];
      (TicketRepository.findByEventId as jest.Mock).mockResolvedValue(mockTickets);

      const response = await request(app).get('/api/tickets/event/event_123');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].event_id).toBe('event_123');
    });
  });

  describe('GET /api/tickets/buyer/:email', () => {
    it('deve buscar tickets por email do comprador', async () => {
      const mockTickets = [createMockTicket({ buyer_email: 'buyer@example.com' })];
      (TicketRepository.findByBuyerEmail as jest.Mock).mockResolvedValue(mockTickets);

      const response = await request(app).get('/api/tickets/buyer/buyer@example.com');

      expect(response.status).toBe(200);
      expect(response.body[0].buyer_email).toBe('buyer@example.com');
    });
  });

  describe('GET /api/tickets/qr/:qrCode', () => {
    it('deve buscar ticket por QR code', async () => {
      const mockTicket = createMockTicket({ qr_code: 'QR_123' });
      (TicketRepository.findByQrCode as jest.Mock).mockResolvedValue(mockTicket);

      const response = await request(app).get('/api/tickets/qr/QR_123');

      expect(response.status).toBe(200);
      expect(response.body.qr_code).toBe('QR_123');
    });

    it('deve retornar 404 se ticket não encontrado', async () => {
      (TicketRepository.findByQrCode as jest.Mock).mockResolvedValue(null);

      const response = await request(app).get('/api/tickets/qr/invalid_qr');

      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/tickets/status/:status', () => {
    it('deve buscar tickets por status válido', async () => {
      const mockTickets = [createMockTicket({ status: 'valid' })];
      (TicketRepository.findByStatus as jest.Mock).mockResolvedValue(mockTickets);

      const response = await request(app).get('/api/tickets/status/valid');

      expect(response.status).toBe(200);
      expect(response.body[0].status).toBe('valid');
    });

    it('deve retornar erro se status inválido', async () => {
      const response = await request(app).get('/api/tickets/status/invalid_status');

      expect(response.status).toBe(400);
    });
  });
});

