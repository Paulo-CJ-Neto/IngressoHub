export interface Event {
    id: string;
    name: string;
    date: string;
    location: string;
    price: number;
    max_tickets: number;
    sold_tickets: number;
    image_url?: string;
    description?: string;
    status: 'active' | 'inactive';
}
export declare class EventService {
    static filter(filters: Partial<Event>, sortBy?: string): Promise<Event[]>;
    static update(id: string, updates: Partial<Event>): Promise<Event>;
}
