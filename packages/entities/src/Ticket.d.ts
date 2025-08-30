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
export declare class TicketService {
    static create(ticketData: Omit<Ticket, 'id' | 'created_at'>): Promise<Ticket>;
    static findByQrCode(qrCode: string): Promise<Ticket | null>;
    static findByEventId(eventId: string): Promise<Ticket[]>;
    static findByBuyerEmail(email: string): Promise<Ticket[]>;
    static update(id: string, updates: Partial<Ticket>): Promise<Ticket>;
}
