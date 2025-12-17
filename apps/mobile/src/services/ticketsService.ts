import api from './api';
import { Ticket } from '@ingressohub/entities';

export interface TicketsService {
  // Buscar todos os tickets
  getAllTickets(): Promise<Ticket[]>;
  
  // Buscar tickets por evento
  getTicketsByEvent(eventId: string): Promise<Ticket[]>;
  
  // Buscar tickets por comprador (email)
  getTicketsByBuyerEmail(email: string): Promise<Ticket[]>;
  
  // Buscar tickets por CPF do comprador
  getTicketsByBuyerCpf(cpf: string): Promise<Ticket[]>;
  
  // Buscar tickets por status
  getTicketsByStatus(status: 'valid' | 'used' | 'cancelled'): Promise<Ticket[]>;
  
  // Buscar ticket por QR Code
  getTicketByQrCode(qrCode: string): Promise<Ticket>;
  
  // Buscar ticket por ID
  getTicketById(id: string): Promise<Ticket>;
  
  // Criar novo ticket
  createTicket(ticketData: Partial<Ticket>): Promise<Ticket>;
  
  // Atualizar ticket
  updateTicket(id: string, updates: Partial<Ticket>): Promise<Ticket>;
  
  // Validar ticket
  validateTicket(id: string): Promise<Ticket>;

  // Validar ticket via QR: ticket_id + event_id
  validateTicketByIds(payload: { ticket_id: string; event_id: string }): Promise<
    { status: 'valid'; validatedAt: string } |
    { status: 'already_used'; usedAt: string } |
    { status: 'invalid' }
  >;
  
  // Cancelar ticket
  cancelTicket(id: string): Promise<Ticket>;
  
  // Buscar estatísticas de tickets por evento
  getEventTicketStats(eventId: string): Promise<any>;
  
  // Deletar ticket
  deleteTicket(id: string): Promise<void>;

  // Criar ticket simples com QR JSON { ticket_id, event_id }
  createTicketSimple(input: {
    eventId: string;
    buyer?: { name?: string; cpf?: string; email?: string };
    quantity?: number;
    totalPrice?: number;
  }): Promise<{ ticket: Ticket; qrPayload: string; qrCodeBase64: string }>;
}

class TicketsServiceImpl implements TicketsService {
  async getAllTickets(): Promise<Ticket[]> {
    try {
      const response = await api.get('/tickets');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar tickets:', error);
      throw error;
    }
  }

  async getTicketsByEvent(eventId: string): Promise<Ticket[]> {
    try {
      const response = await api.get(`/tickets/event/${eventId}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar tickets do evento ${eventId}:`, error);
      throw error;
    }
  }

  async getTicketsByBuyerEmail(email: string): Promise<Ticket[]> {
    try {
      const response = await api.get(`/tickets/buyer/${encodeURIComponent(email)}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar tickets do comprador ${email}:`, error);
      throw error;
    }
  }

  async getTicketsByBuyerCpf(cpf: string): Promise<Ticket[]> {
    try {
      const response = await api.get(`/tickets/cpf/${cpf}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar tickets do CPF ${cpf}:`, error);
      throw error;
    }
  }

  async getTicketsByStatus(status: 'valid' | 'used' | 'cancelled'): Promise<Ticket[]> {
    try {
      const response = await api.get(`/tickets/status/${status}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar tickets com status ${status}:`, error);
      throw error;
    }
  }

  async getTicketByQrCode(qrCode: string): Promise<Ticket> {
    try {
      const response = await api.get(`/tickets/qr/${encodeURIComponent(qrCode)}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar ticket por QR Code ${qrCode}:`, error);
      throw error;
    }
  }

  async getTicketById(id: string): Promise<Ticket> {
    try {
      const response = await api.get(`/tickets/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar ticket ${id}:`, error);
      throw error;
    }
  }

  async createTicket(ticketData: Partial<Ticket>): Promise<Ticket> {
    try {
      const response = await api.post('/tickets', ticketData);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar ticket:', error);
      throw error;
    }
  }

  async updateTicket(id: string, updates: Partial<Ticket>): Promise<Ticket> {
    try {
      const response = await api.put(`/tickets/${id}`, updates);
      return response.data;
    } catch (error) {
      console.error(`Erro ao atualizar ticket ${id}:`, error);
      throw error;
    }
  }

  async validateTicket(id: string): Promise<Ticket> {
    try {
      const response = await api.patch(`/tickets/${id}/validate`);
      return response.data.ticket;
    } catch (error) {
      console.error(`Erro ao validar ticket ${id}:`, error);
      throw error;
    }
  }

  async validateTicketByIds(payload: { ticket_id: string; event_id: string }): Promise<
    { status: 'valid'; validatedAt: string } |
    { status: 'already_used'; usedAt: string } |
    { status: 'invalid' }
  > {
    try {
      const response = await api.post('/validate-ticket', payload);
      return response.data;
    } catch (error) {
      console.error('Erro ao validar ticket via ids:', error);
      throw error;
    }
  }

  async cancelTicket(id: string): Promise<Ticket> {
    try {
      const response = await api.patch(`/tickets/${id}/cancel`);
      return response.data.ticket;
    } catch (error) {
      console.error(`Erro ao cancelar ticket ${id}:`, error);
      throw error;
    }
  }

  async getEventTicketStats(eventId: string): Promise<any> {
    try {
      const response = await api.get(`/tickets/stats/event/${eventId}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar estatísticas do evento ${eventId}:`, error);
      throw error;
    }
  }

  async deleteTicket(id: string): Promise<void> {
    try {
      await api.delete(`/tickets/${id}`);
    } catch (error) {
      console.error(`Erro ao deletar ticket ${id}:`, error);
      throw error;
    }
  }

  async createTicketSimple(input: {
    eventId: string;
    buyer?: { name?: string; cpf?: string; email?: string };
    quantity?: number;
    totalPrice?: number;
  }): Promise<{ ticket: Ticket; qrPayload: string; qrCodeBase64: string }> {
    try {
      const response = await api.post('/tickets/simple', input);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar ticket simples:', error);
      throw error;
    }
  }
}

export const ticketsService = new TicketsServiceImpl();
