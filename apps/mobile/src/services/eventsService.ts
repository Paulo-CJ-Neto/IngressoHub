import api from './api';
import { Event } from '@ingressohub/entities';

export interface EventsService {
  // Buscar todos os eventos
  getAllEvents(): Promise<Event[]>;
  
  // Buscar eventos ativos
  getActiveEvents(): Promise<Event[]>;
  
  // Buscar evento por ID
  getEventById(id: string): Promise<Event>;
  
  // Criar novo evento
  createEvent(eventData: Partial<Event>): Promise<Event>;
  
  // Atualizar evento
  updateEvent(id: string, updates: Partial<Event>): Promise<Event>;
  
  // Deletar evento
  deleteEvent(id: string): Promise<void>;
  
  // Incrementar ingressos vendidos
  incrementSoldTickets(id: string, quantity: number): Promise<Event>;
}

class EventsServiceImpl implements EventsService {
  async getAllEvents(): Promise<Event[]> {
    try {
      const response = await api.get('/events');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar eventos:', error);
      throw error;
    }
  }

  async getActiveEvents(): Promise<Event[]> {
    try {
      console.log(api.getUri())
      const response = await api.get('/events/active');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar eventos ativos:', error);
      throw error;
    }
  }

  async getEventById(id: string): Promise<Event> {
    try {
      const response = await api.get(`/events/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar evento ${id}:`, error);
      throw error;
    }
  }

  async createEvent(eventData: Partial<Event>): Promise<Event> {
    try {
      const response = await api.post('/events', eventData);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar evento:', error);
      throw error;
    }
  }

  async updateEvent(id: string, updates: Partial<Event>): Promise<Event> {
    try {
      const response = await api.put(`/events/${id}`, updates);
      return response.data;
    } catch (error) {
      console.error(`Erro ao atualizar evento ${id}:`, error);
      throw error;
    }
  }

  async deleteEvent(id: string): Promise<void> {
    try {
      await api.delete(`/events/${id}`);
    } catch (error) {
      console.error(`Erro ao deletar evento ${id}:`, error);
      throw error;
    }
  }

  async incrementSoldTickets(id: string, quantity: number): Promise<Event> {
    try {
      const response = await api.patch(`/events/${id}/sold-tickets`, { quantity });
      return response.data;
    } catch (error) {
      console.error(`Erro ao incrementar ingressos vendidos do evento ${id}:`, error);
      throw error;
    }
  }
}

export const eventsService = new EventsServiceImpl();
