import request from 'supertest';
import express from 'express';
import eventsRouter from '../events';
import { EventRepository } from '../../db/repositories/EventRepository';
import { createMockEvent } from '../../test-utils/helpers';

jest.mock('../../db/repositories/EventRepository');
jest.mock('../../middleware/upload', () => ({
  uploadEventImages: (req: any, res: any, next: any) => {
    req.files = [];
    next();
  },
}));
jest.mock('../../services/S3Service');

const app = express();
app.use(express.json());
app.use('/api/events', eventsRouter);

describe('Events Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/events', () => {
    it('deve listar todos os eventos', async () => {
      const mockEvents = [createMockEvent(), createMockEvent()];
      (EventRepository.findAll as jest.Mock).mockResolvedValue(mockEvents);

      const response = await request(app).get('/api/events');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
    });
  });

  describe('GET /api/events/active', () => {
    it('deve listar eventos ativos', async () => {
      const mockEvents = [createMockEvent({ status: 'active' })];
      (EventRepository.findActive as jest.Mock).mockResolvedValue(mockEvents);

      const response = await request(app).get('/api/events/active');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].status).toBe('active');
    });
  });

  describe('GET /api/events/:id', () => {
    it('deve buscar evento por ID', async () => {
      const mockEvent = createMockEvent({ id: 'event_123' });
      (EventRepository.findById as jest.Mock).mockResolvedValue(mockEvent);

      const response = await request(app).get('/api/events/event_123');

      expect(response.status).toBe(200);
      expect(response.body.id).toBe('event_123');
    });

    it('deve retornar 404 se evento não encontrado', async () => {
      (EventRepository.findById as jest.Mock).mockResolvedValue(null);

      const response = await request(app).get('/api/events/invalid_id');

      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/events', () => {
    it('deve criar evento com dados válidos', async () => {
      const eventData = {
        name: 'Test Event',
        date: new Date().toISOString(),
        location: 'Test Location',
        price: 100,
        producer_id: 'producer_123',
        max_tickets: 100,
      };

      const mockEvent = createMockEvent(eventData);
      (EventRepository.createOrUpdate as jest.Mock).mockResolvedValue(mockEvent);

      const response = await request(app)
        .post('/api/events')
        .send(eventData);

      expect(response.status).toBe(201);
      expect(response.body.name).toBe('Test Event');
    });

    it('deve retornar erro se dados obrigatórios faltando', async () => {
      const response = await request(app)
        .post('/api/events')
        .send({ name: 'Test Event' });

      expect(response.status).toBe(400);
    });
  });
});

