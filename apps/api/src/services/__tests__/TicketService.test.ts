import { TicketService } from '../TicketService';
import { EventRepository } from '../../db/repositories/EventRepository';
import { createMockEvent } from '../../test-utils/helpers';
import { docClient } from '../../db/client';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import jwt from 'jsonwebtoken';
import QRCode from 'qrcode';
import fs from 'fs';

jest.mock('../../db/repositories/EventRepository');
jest.mock('../../db/client');
jest.mock('jsonwebtoken');
jest.mock('qrcode');
jest.mock('fs');

describe('TicketService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock das chaves RSA
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.readFileSync as jest.Mock).mockReturnValue('-----BEGIN PRIVATE KEY-----\ntest\n-----END PRIVATE KEY-----');
  });

  describe('createTicket', () => {
    it('deve criar ingresso com sucesso', async () => {
      const mockEvent = createMockEvent({
        id: 'event_123',
        date: new Date(Date.now() + 86400000).toISOString(), // Amanhã
      });

      (EventRepository.findById as jest.Mock).mockResolvedValue(mockEvent);
      (jwt.sign as jest.Mock).mockReturnValue('mock-jwt-token');
      (QRCode.toDataURL as jest.Mock).mockResolvedValue('data:image/png;base64,mock-qr-code');
      (docClient.send as jest.Mock).mockResolvedValue({});

      const result = await TicketService.createTicket({
        eventId: 'event_123',
        userId: 'user_123',
      });

      expect(result.ticketId).toBeDefined();
      expect(result.jwt).toBe('mock-jwt-token');
      expect(result.qrCodeBase64).toBe('mock-qr-code');
      expect(EventRepository.findById).toHaveBeenCalledWith('event_123');
      expect(jwt.sign).toHaveBeenCalled();
      expect(QRCode.toDataURL).toHaveBeenCalled();
    });

    it('deve lançar erro se evento não encontrado', async () => {
      (EventRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(
        TicketService.createTicket({
          eventId: 'invalid_event',
          userId: 'user_123',
        })
      ).rejects.toThrow('Evento não encontrado');
    });
  });

  describe('generateJWT', () => {
    it('deve gerar JWT com payload correto', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue('-----BEGIN PRIVATE KEY-----\ntest\n-----END PRIVATE KEY-----');
      
      (jwt.sign as jest.Mock).mockReturnValue('mock-token');

      const payload = {
        ticketId: 'ticket_123',
        eventId: 'event_123',
        userId: 'user_123',
        exp: Math.floor(Date.now() / 1000) + 3600,
      };

      const result = await TicketService.generateJWT(payload);

      expect(result).toBe('mock-token');
      expect(jwt.sign).toHaveBeenCalledWith(
        payload,
        expect.any(String),
        { algorithm: 'RS256' }
      );
    });
  });

  describe('generateQRCode', () => {
    it('deve gerar QR code em base64', async () => {
      (QRCode.toDataURL as jest.Mock).mockResolvedValue('data:image/png;base64,test-base64');

      const result = await TicketService.generateQRCode('test-token');

      expect(result).toBe('test-base64');
      expect(QRCode.toDataURL).toHaveBeenCalledWith('test-token', { errorCorrectionLevel: 'M' });
    });
  });
});

