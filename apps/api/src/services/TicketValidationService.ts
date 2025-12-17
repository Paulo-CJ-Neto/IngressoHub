import { Ticket } from '@ingressohub/entities';
import { TicketRepository } from '../db/repositories/TicketRepository';

export type TicketValidationStatus =
  | { status: 'invalid' }
  | { status: 'already_used'; usedAt: string }
  | { status: 'valid'; validatedAt: string };

export class TicketValidationService {
  static async validateByIds(params: { ticket_id: string; event_id: string }): Promise<TicketValidationStatus> {
    const { ticket_id, event_id } = params;

    const ticket = await TicketRepository.findById(ticket_id);
    if (!ticket) {
      return { status: 'invalid' };
    }

    if (ticket.event_id !== event_id) {
      return { status: 'invalid' };
    }

    if (ticket.status === 'used') {
      return { status: 'already_used', usedAt: ticket.used_at ?? new Date().toISOString() };
    }

    try {
      const updated = await TicketRepository.validateTicket(ticket_id);
      if (!updated) return { status: 'invalid' };
      return { status: 'valid', validatedAt: updated.used_at ?? new Date().toISOString() };
    } catch (err: any) {
      // Se a condição falhar (status diferente de 'valid'), considerar já usado
      return { status: 'already_used', usedAt: ticket.used_at ?? new Date().toISOString() };
    }
  }
}


