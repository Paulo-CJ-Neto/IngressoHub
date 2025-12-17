import { randomUUID } from 'crypto';
import QRCode from 'qrcode';
import { Ticket } from '@ingressohub/entities';
import { TicketRepository } from '../db/repositories/TicketRepository';
import { EventRepository } from '../db/repositories/EventRepository';

type IssueInput = {
  eventId: string;
  buyer?: { name?: string; cpf?: string; email?: string };
  quantity?: number;
  totalPrice?: number;
};

type IssueResult = {
  ticket: Ticket;
  qrPayload: string;
  qrCodeBase64: string; // PNG base64, sem prefixo data URL
};

export class TicketIssueService {
  static async createTicketWithQrJson(input: IssueInput): Promise<IssueResult> {
    const { eventId, buyer, quantity, totalPrice } = input;

    const event = await EventRepository.findById(eventId);
    if (!event) {
      throw new Error('Evento não encontrado');
    }

    const id = randomUUID();
    const qrPayload = JSON.stringify({ ticket_id: id, event_id: eventId });

    const ticket: Ticket = {
      id,
      event_id: eventId,
      buyer_name: buyer?.name ?? 'Cliente',
      buyer_cpf: buyer?.cpf ?? '',
      buyer_email: buyer?.email ?? '',
      quantity: quantity ?? 1,
      total_price: totalPrice ?? 0,
      qr_code: qrPayload,
      status: 'valid',
      created_at: new Date().toISOString(),
    };

    await TicketRepository.createOrUpdate(ticket);

    const dataUrl = await QRCode.toDataURL(qrPayload, { errorCorrectionLevel: 'M' });
    const qrCodeBase64 = dataUrl.replace(/^data:image\/png;base64,/, '');

    return { ticket, qrPayload, qrCodeBase64 };
  }
}


