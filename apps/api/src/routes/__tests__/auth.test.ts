import request from 'supertest';
import express from 'express';
import authRouter from '../auth';
import { UserRepository } from '../../db/repositories/UserRepository';
import { EmailService } from '../../services/EmailService';
import { createMockUser } from '../../test-utils/helpers';
import bcrypt from 'bcrypt';

jest.mock('../../db/repositories/UserRepository');
jest.mock('../../services/EmailService');
jest.mock('bcrypt');

const app = express();
app.use(express.json());
app.use('/api/auth', authRouter);

describe('Auth Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/login', () => {
    it('deve fazer login com credenciais válidas', async () => {
      const mockUser = createMockUser({
        email: 'test@example.com',
        password_hash: 'hashed_password',
        email_verified: true,
      });

      (UserRepository.findByEmail as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'password123' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
    });

    it('deve retornar erro se email não fornecido', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ password: 'password123' });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('obrigatórios');
    });

    it('deve retornar erro se credenciais inválidas', async () => {
      (UserRepository.findByEmail as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'invalid@example.com', password: 'password123' });

      expect(response.status).toBe(401);
    });

    it('deve retornar erro se email não verificado', async () => {
      const mockUser = createMockUser({
        email: 'test@example.com',
        password_hash: 'hashed_password',
        email_verified: false,
      });

      (UserRepository.findByEmail as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'password123' });

      expect(response.status).toBe(403);
      expect(response.body.requiresEmailVerification).toBe(true);
    });
  });

  describe('POST /api/auth/register', () => {
    it('deve registrar novo usuário com sucesso', async () => {
      (UserRepository.emailExists as jest.Mock).mockResolvedValue(false);
      (UserRepository.createOrUpdate as jest.Mock).mockResolvedValue(
        createMockUser({ email: 'new@example.com' })
      );
      (EmailService.sendVerificationEmail as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'new@example.com',
          password: 'password123',
          full_name: 'New User',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('user');
      expect(response.body.requiresEmailVerification).toBe(true);
    });

    it('deve retornar erro se email já existe', async () => {
      (UserRepository.emailExists as jest.Mock).mockResolvedValue(true);

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'existing@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(409);
    });

    it('deve retornar erro se senha muito curta', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: '12345',
        });

      expect(response.status).toBe(400);
    });
  });
});

