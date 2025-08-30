import jwt from 'jsonwebtoken';
import QRCode from 'qrcode';
import { randomUUID } from 'crypto';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAMES } from '../db';
import { EventRepository } from '../db/repositories/EventRepository';
import fs from 'fs';
import path from 'path';

type CreateTicketInput = {
  eventId: string;
  userId: string;
};

type CreateTicketResult = {
  ticketId: string;
  jwt: string;
  qrCodeBase64: string;
};

export class TicketService {
  private static loadKey(possiblePaths: string[]): string {
    for (const candidate of possiblePaths) {
      try {
        if (fs.existsSync(candidate)) {
          return fs.readFileSync(candidate, 'utf8');
        }
      } catch {}
    }
    throw new Error('Não foi possível carregar a chave RSA em nenhum dos caminhos conhecidos');
  }

  // Tentar múltiplos caminhos para funcionar em dev (ts-node) e build (dist)
  private static readonly PRIVATE_KEY: string = TicketService.loadKey([
    // Quando executando via ts-node a partir de src
    path.resolve(__dirname, '../secrets/private.key'),
    // Quando executando build em dist (dist/services -> subir um nível e apontar para src/secrets)
    path.resolve(__dirname, '../../src/secrets/private.key'),
    // CWD monorepo (raiz): apps/api/src/secrets
    path.resolve(process.cwd(), 'apps/api/src/secrets/private.key'),
    // CWD dentro de apps/api
    path.resolve(process.cwd(), 'src/secrets/private.key'),
  ]);

  // Opcional: manter pública para futuras validações/verificações
  private static readonly PUBLIC_KEY: string = TicketService.loadKey([
    path.resolve(__dirname, '../secrets/public.key'),
    path.resolve(__dirname, '../../src/secrets/public.key'),
    path.resolve(process.cwd(), 'apps/api/src/secrets/public.key'),
    path.resolve(process.cwd(), 'src/secrets/public.key'),
  ]);

  static async createTicket(input: CreateTicketInput): Promise<CreateTicketResult> {
    const { eventId, userId } = input;

    const event = await EventRepository.findById(eventId);
    if (!event) {
      throw new Error('Evento não encontrado');
    }

    const ticketId = randomUUID();

    const token = await this.generateJWT({
      ticketId,
      eventId,
      userId,
      exp: Math.floor(new Date(event.date).getTime() / 1000),
    });

    const qrCodeBase64 = await this.generateQRCode(token);

    await this.persistTicket({
      ticketId,
      eventId,
      userId,
      jwt: token,
      status: 'valid',
      createdAt: new Date().toISOString(),
    });

    return { ticketId, jwt: token, qrCodeBase64 };
  }

  static async generateJWT(payload: {
    ticketId: string;
    eventId: string;
    userId: string;
    exp: number;
  }): Promise<string> {
    return jwt.sign(
      {
        ticketId: payload.ticketId,
        eventId: payload.eventId,
        userId: payload.userId,
        exp: payload.exp,
      },
      TicketService.PRIVATE_KEY,
      { algorithm: 'RS256' }
    );
  }

  static async generateQRCode(token: string): Promise<string> {
    const dataUrl = await QRCode.toDataURL(token, { errorCorrectionLevel: 'M' });
    // Strip prefix and return only base64 content to match spec
    const base64 = dataUrl.replace(/^data:image\/png;base64,/, '');
    return base64;
  }

  private static async persistTicket(item: {
    ticketId: string;
    eventId: string;
    userId: string;
    jwt: string;
    status: 'valid' | 'used' | 'cancelled';
    createdAt: string;
  }): Promise<void> {
    const command = new PutCommand({
      TableName: TABLE_NAMES.TICKETS,
      Item: item,
    });
    await docClient.send(command);
  }
}


