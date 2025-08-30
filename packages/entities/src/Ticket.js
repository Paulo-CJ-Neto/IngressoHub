"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketService = void 0;
// Dados mockados para demonstração
const mockTickets = [];
class TicketService {
    static async create(ticketData) {
        // Simula uma chamada de API
        await new Promise(resolve => setTimeout(resolve, 1000));
        const newTicket = {
            id: `ticket_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            ...ticketData,
            created_at: new Date().toISOString()
        };
        mockTickets.push(newTicket);
        return newTicket;
    }
    static async findByQrCode(qrCode) {
        await new Promise(resolve => setTimeout(resolve, 500));
        return mockTickets.find(ticket => ticket.qr_code === qrCode) || null;
    }
    static async findByEventId(eventId) {
        await new Promise(resolve => setTimeout(resolve, 500));
        return mockTickets.filter(ticket => ticket.event_id === eventId);
    }
    static async findByBuyerEmail(email) {
        await new Promise(resolve => setTimeout(resolve, 500));
        return mockTickets.filter(ticket => ticket.buyer_email === email);
    }
    static async update(id, updates) {
        await new Promise(resolve => setTimeout(resolve, 300));
        const index = mockTickets.findIndex(t => t.id === id);
        if (index === -1)
            throw new Error('Ticket not found');
        const updated = { ...mockTickets[index], ...updates };
        mockTickets[index] = updated;
        return updated;
    }
}
exports.TicketService = TicketService;
