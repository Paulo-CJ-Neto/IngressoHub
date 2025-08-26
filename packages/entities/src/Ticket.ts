export interface Ticket {
  id: string;
  event_id: string;
  buyer_name: string;
  buyer_cpf: string;
  buyer_email: string;
  quantity: number;
  total_price: number;
  qr_code: string;
  status: 'valid' | 'used' | 'cancelled';
  created_at: string;
  used_at?: string;
}

// Dados mockados para demonstração
const mockTickets: Ticket[] = [];

export class TicketService {
  static async create(ticketData: Omit<Ticket, 'id' | 'created_at'>): Promise<Ticket> {
    // Simula uma chamada de API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newTicket: Ticket = {
      id: `ticket_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...ticketData,
      created_at: new Date().toISOString()
    };
    
    mockTickets.push(newTicket);
    return newTicket;
  }

  static async findByQrCode(qrCode: string): Promise<Ticket | null> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockTickets.find(ticket => ticket.qr_code === qrCode) || null;
  }

  static async findByEventId(eventId: string): Promise<Ticket[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockTickets.filter(ticket => ticket.event_id === eventId);
  }

  static async findByBuyerEmail(email: string): Promise<Ticket[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockTickets.filter(ticket => ticket.buyer_email === email);
  }

  static async update(id: string, updates: Partial<Ticket>): Promise<Ticket> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = mockTickets.findIndex(t => t.id === id);
    if (index === -1) throw new Error('Ticket not found');
    const updated: Ticket = { ...mockTickets[index], ...updates };
    mockTickets[index] = updated;
    return updated;
  }
}
