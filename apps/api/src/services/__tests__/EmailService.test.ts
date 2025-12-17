import { EmailService } from '../EmailService';
import nodemailer from 'nodemailer';
import { mockSendMail, mockVerify } from '../../__mocks__/nodemailer';

jest.mock('nodemailer');
jest.mock('../../config/email', () => ({
  EMAIL_CONFIG: {
    GMAIL: {
      from: 'test@ingressohub.com',
      service: 'gmail',
      user: 'test@example.com',
      pass: 'test-pass',
    },
    FRONTEND_URL: 'http://localhost:3000',
    TEMPLATES: {
      VERIFICATION: {
        subject: 'Verifique seu email',
      },
      WELCOME: {
        subject: 'Bem-vindo ao IngressoHub',
      },
    },
  },
  getEmailProvider: () => 'GMAIL',
}));

describe('EmailService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (EmailService as any).transporter = undefined;
  });

  describe('sendVerificationEmail', () => {
    it('deve enviar email de verificação com sucesso', async () => {
      mockSendMail.mockResolvedValue({
        messageId: 'test-message-id',
        accepted: ['user@example.com'],
      });

      const result = await EmailService.sendVerificationEmail(
        'user@example.com',
        'token_123',
        'Test User'
      );

      expect(result).toBe(true);
      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'user@example.com',
          subject: 'Verifique seu email',
        })
      );
    });

    it('deve inicializar transporter se não existir', async () => {
      (EmailService as any).transporter = undefined;
      mockSendMail.mockResolvedValue({
        messageId: 'test-message-id',
        accepted: ['user@example.com'],
      });

      await EmailService.sendVerificationEmail('user@example.com', 'token_123', 'Test User');

      expect(nodemailer.createTransport).toHaveBeenCalled();
    });

    it('deve retornar false em caso de erro', async () => {
      mockSendMail.mockRejectedValue(new Error('SMTP Error'));

      const result = await EmailService.sendVerificationEmail(
        'user@example.com',
        'token_123',
        'Test User'
      );

      expect(result).toBe(false);
    });
  });

  describe('sendWelcomeEmail', () => {
    it('deve enviar email de boas-vindas com sucesso', async () => {
      mockSendMail.mockResolvedValue({
        messageId: 'test-message-id',
        accepted: ['user@example.com'],
      });

      const result = await EmailService.sendWelcomeEmail('user@example.com', 'Test User');

      expect(result).toBe(true);
      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'user@example.com',
          subject: 'Bem-vindo ao IngressoHub',
        })
      );
    });
  });

  describe('testConnection', () => {
    it('deve testar conexão com sucesso', async () => {
      mockVerify.mockResolvedValue(true);

      const result = await EmailService.testConnection();

      expect(result).toBe(true);
      expect(mockVerify).toHaveBeenCalled();
    });

    it('deve retornar false em caso de erro na conexão', async () => {
      mockVerify.mockRejectedValue(new Error('Connection failed'));

      const result = await EmailService.testConnection();

      expect(result).toBe(false);
    });
  });
});

