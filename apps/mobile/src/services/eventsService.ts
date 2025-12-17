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
  
  // Criar evento com upload de imagens
  createEventWithImages(eventData: Partial<Event>, imageUris: string[]): Promise<Event>;
  
  // Atualizar evento
  updateEvent(id: string, updates: Partial<Event>): Promise<Event>;
  
  // Deletar evento
  deleteEvent(id: string): Promise<void>;
  
  // Incrementar ingressos vendidos
  incrementSoldTickets(id: string, quantity: number): Promise<Event>;
  
  // Adicionar imagens a evento existente
  addImagesToEvent(eventId: string, imageUris: string[]): Promise<{ newImages: string[] }>;
  
  // Remover imagem de evento
  removeImageFromEvent(eventId: string, imageUrl: string): Promise<void>;
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

  async createEventWithImages(eventData: Partial<Event>, imageUris: string[]): Promise<Event> {
    try {
      const formData = new FormData();
      
      // Adicionar dados do evento
      Object.entries(eventData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          // Tratar arrays e objetos especiais (como ticket_types)
          if (key === 'ticket_types' && Array.isArray(value)) {
            const jsonString = JSON.stringify(value);
            console.log(`[FormData] Enviando ${key} como JSON:`, jsonString);
            formData.append(key, jsonString);
          } else if (typeof value === 'object' && !Array.isArray(value)) {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, String(value));
          }
        }
      });
      
      // Adicionar imagens
      for (let i = 0; i < imageUris.length; i++) {
        const uri = imageUris[i];
        const filename = `image_${i}_${Date.now()}.jpg`;
        
        formData.append('images', {
          uri,
          type: 'image/jpeg',
          name: filename,
        } as any);
      }
      
      const response = await api.post('/events', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000,
      });
      
      return response.data;
    } catch (error) {
      console.error('Erro ao criar evento com imagens:', error);
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

  async addImagesToEvent(eventId: string, imageUris: string[]): Promise<{ newImages: string[] }> {
    try {
      const formData = new FormData();
      
      // Adicionar imagens
      for (let i = 0; i < imageUris.length; i++) {
        const uri = imageUris[i];
        const filename = `image_${i}_${Date.now()}.jpg`;
        
        formData.append('images', {
          uri,
          type: 'image/jpeg',
          name: filename,
        } as any);
      }
      
      const response = await api.post(
        `/events/${eventId}/images`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 60000,
        }
      );
      
      return response.data;
    } catch (error) {
      console.error(`Erro ao adicionar imagens ao evento ${eventId}:`, error);
      throw error;
    }
  }

  async removeImageFromEvent(eventId: string, imageUrl: string): Promise<void> {
    try {
      await api.delete(
        `/events/${eventId}/images`,
        {
          data: { imageUrl },
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    } catch (error) {
      console.error(`Erro ao remover imagem do evento ${eventId}:`, error);
      throw error;
    }
  }
}

export const eventsService = new EventsServiceImpl();
