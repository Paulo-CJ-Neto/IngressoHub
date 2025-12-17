import { Event } from '@ingressohub/entities';
import { User } from '@ingressohub/entities';
import { Ticket } from '@ingressohub/entities';
import { Payment, PaymentStatus } from '../types/payment';

/**
 * Cria um evento mock para testes
 */
export function createMockEvent(overrides?: Partial<Event>): Event {
  return {
    id: 'event_123',
    name: 'Test Event',
    date: new Date().toISOString(),
    location: 'Test Location',
    producer_id: 'producer_123',
    price: 100,
    max_tickets: 100,
    sold_tickets: 0,
    status: 'active',
    description: 'Test description',
    ...overrides,
  };
}

/**
 * Cria um usuário mock para testes
 */
export function createMockUser(overrides?: Partial<User>): User {
  return {
    id: 'user_123',
    email: 'test@example.com',
    full_name: 'Test User',
    created_at: new Date().toISOString(),
    email_verified: true,
    user_type: 'client',
    ...overrides,
  };
}

/**
 * Cria um ticket mock para testes
 */
export function createMockTicket(overrides?: Partial<Ticket>): Ticket {
  return {
    id: 'ticket_123',
    event_id: 'event_123',
    buyer_name: 'Test Buyer',
    buyer_cpf: '12345678900',
    buyer_email: 'buyer@example.com',
    quantity: 1,
    total_price: 100,
    qr_code: 'QR_TEST_123',
    status: 'valid',
    created_at: new Date().toISOString(),
    ...overrides,
  };
}

/**
 * Cria um pagamento mock para testes
 */
export function createMockPayment(overrides?: Partial<Payment>): Payment {
  return {
    id: 'payment_123',
    userId: 'user_123',
    ticketId: 'ticket_123',
    eventId: 'event_123',
    amount: 100,
    status: PaymentStatus.PENDING,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    metadata: {
      eventName: 'Test Event',
      customerName: 'Test Customer',
      customerEmail: 'customer@example.com',
      customerDocument: '12345678900',
    },
    ...overrides,
  };
}

/**
 * Aguarda um tempo específico (útil para testes assíncronos)
 */
export function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

