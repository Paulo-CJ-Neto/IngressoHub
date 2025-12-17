import { eventsService } from '../eventsService';
import api from '../api';
import { Event } from '@ingressohub/entities';

jest.mock('../api');

describe('eventsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllEvents', () => {
    it('deve buscar todos os eventos', async () => {
      const mockEvents: Event[] = [
        { id: '1', name: 'Event 1', date: new Date().toISOString(), location: 'Location 1', producer_id: 'p1', price: 100, max_tickets: 100, sold_tickets: 0, status: 'active' },
        { id: '2', name: 'Event 2', date: new Date().toISOString(), location: 'Location 2', producer_id: 'p1', price: 200, max_tickets: 50, sold_tickets: 0, status: 'active' },
      ];

      (api.get as jest.Mock).mockResolvedValue({ data: mockEvents });

      const result = await eventsService.getAllEvents();

      expect(result).toEqual(mockEvents);
      expect(api.get).toHaveBeenCalledWith('/events');
    });

    it('deve lançar erro se API falhar', async () => {
      (api.get as jest.Mock).mockRejectedValue(new Error('Network error'));

      await expect(eventsService.getAllEvents()).rejects.toThrow();
    });
  });

  describe('getActiveEvents', () => {
    it('deve buscar eventos ativos', async () => {
      const mockEvents: Event[] = [
        { id: '1', name: 'Event 1', date: new Date().toISOString(), location: 'Location 1', producer_id: 'p1', price: 100, max_tickets: 100, sold_tickets: 0, status: 'active' },
      ];

      (api.get as jest.Mock).mockResolvedValue({ data: mockEvents });

      const result = await eventsService.getActiveEvents();

      expect(result).toEqual(mockEvents);
      expect(api.get).toHaveBeenCalledWith('/events/active');
    });
  });

  describe('getEventById', () => {
    it('deve buscar evento por ID', async () => {
      const mockEvent: Event = {
        id: 'event_123',
        name: 'Test Event',
        date: new Date().toISOString(),
        location: 'Test Location',
        producer_id: 'producer_123',
        price: 100,
        max_tickets: 100,
        sold_tickets: 0,
        status: 'active',
      };

      (api.get as jest.Mock).mockResolvedValue({ data: mockEvent });

      const result = await eventsService.getEventById('event_123');

      expect(result).toEqual(mockEvent);
      expect(api.get).toHaveBeenCalledWith('/events/event_123');
    });
  });

  describe('createEvent', () => {
    it('deve criar evento', async () => {
      const eventData: Partial<Event> = {
        name: 'New Event',
        date: new Date().toISOString(),
        location: 'New Location',
        price: 150,
        producer_id: 'producer_123',
      };

      const mockEvent: Event = {
        id: 'new_event',
        ...eventData,
        max_tickets: 100,
        sold_tickets: 0,
        status: 'active',
      } as Event;

      (api.post as jest.Mock).mockResolvedValue({ data: mockEvent });

      const result = await eventsService.createEvent(eventData);

      expect(result).toEqual(mockEvent);
      expect(api.post).toHaveBeenCalledWith('/events', eventData);
    });
  });

  describe('updateEvent', () => {
    it('deve atualizar evento', async () => {
      const updates = { name: 'Updated Event' };
      const mockEvent: Event = {
        id: 'event_123',
        name: 'Updated Event',
        date: new Date().toISOString(),
        location: 'Location',
        producer_id: 'p1',
        price: 100,
        max_tickets: 100,
        sold_tickets: 0,
        status: 'active',
      };

      (api.put as jest.Mock).mockResolvedValue({ data: mockEvent });

      const result = await eventsService.updateEvent('event_123', updates);

      expect(result).toEqual(mockEvent);
      expect(api.put).toHaveBeenCalledWith('/events/event_123', updates);
    });
  });

  describe('deleteEvent', () => {
    it('deve deletar evento', async () => {
      (api.delete as jest.Mock).mockResolvedValue({});

      await eventsService.deleteEvent('event_123');

      expect(api.delete).toHaveBeenCalledWith('/events/event_123');
    });
  });
});

