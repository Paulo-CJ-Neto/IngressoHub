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

// Dados mockados para demonstração
const mockEvents: Event[] = [
  {
    id: '1',
    name: 'Show de Rock In Rio',
    date: new Date('2024-12-15T20:00:00').toISOString(),
    location: 'Parque Olímpico, Rio de Janeiro',
    price: 150.00,
    max_tickets: 1000,
    sold_tickets: 850,
    image_url: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=600&h=300&fit=crop',
    description: 'O maior festival de rock do Brasil! Uma experiência única com as melhores bandas nacionais e internacionais. Prepare-se para uma noite inesquecível de música, energia e diversão.',
    status: 'active'
  },
  {
    id: '2',
    name: 'Festival de Música Eletrônica',
    date: new Date('2024-11-20T22:00:00').toISOString(),
    location: 'Autódromo de Interlagos, São Paulo',
    price: 200.00,
    max_tickets: 500,
    sold_tickets: 490,
    image_url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=300&fit=crop',
    description: 'Uma noite de pura energia eletrônica! DJs internacionais e nacionais, efeitos visuais impressionantes e uma experiência sensorial completa.',
    status: 'active'
  },
  {
    id: '3',
    name: 'Teatro: Romeu e Julieta',
    date: new Date('2024-10-25T19:30:00').toISOString(),
    location: 'Teatro Municipal, São Paulo',
    price: 80.00,
    max_tickets: 200,
    sold_tickets: 120,
    image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=300&fit=crop',
    description: 'A clássica história de amor de Shakespeare como você nunca viu antes. Uma produção moderna e emocionante que vai te fazer rir, chorar e se apaixonar.',
    status: 'active'
  },
  {
    id: '4',
    name: 'Stand-up Comedy Night',
    date: new Date('2024-11-10T21:00:00').toISOString(),
    location: 'Casa de Comédia, Rio de Janeiro',
    price: 60.00,
    max_tickets: 150,
    sold_tickets: 150,
    image_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=300&fit=crop',
    description: 'Uma noite de muito riso com os melhores comediantes do Brasil. Humor inteligente e irreverente que vai fazer você esquecer dos problemas.',
    status: 'active'
  }
];

export class EventService {
  static async filter(filters: Partial<Event>, sortBy?: string): Promise<Event[]> {
    // Simula uma chamada de API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    let filteredEvents = mockEvents.filter(event => {
      if (filters.status && event.status !== filters.status) return false;
      if (filters.id && event.id !== filters.id) return false;
      return true;
    });

    if (sortBy === 'date') {
      filteredEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }

    return filteredEvents;
  }

  static async update(id: string, updates: Partial<Event>): Promise<Event> {
    // Simula uma chamada de API
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const eventIndex = mockEvents.findIndex(event => event.id === id);
    if (eventIndex === -1) {
      throw new Error('Event not found');
    }
    
    mockEvents[eventIndex] = { ...mockEvents[eventIndex], ...updates };
    return mockEvents[eventIndex];
  }
}
