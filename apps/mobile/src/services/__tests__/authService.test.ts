import { authService } from '../authService';
import api from '../api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '@ingressohub/entities';

jest.mock('../api');
jest.mock('@react-native-async-storage/async-storage');

describe('authService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('signInWithEmail', () => {
    it('deve fazer login com sucesso', async () => {
      const mockUser: User = {
        id: 'user_123',
        email: 'test@example.com',
        full_name: 'Test User',
        created_at: new Date().toISOString(),
        email_verified: true,
        user_type: 'client',
      };

      (api.post as jest.Mock).mockResolvedValue({
        data: { token: 'jwt_token', user: mockUser },
      });
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      const result = await authService.signInWithEmail('test@example.com', 'password123');

      expect(result).toEqual(mockUser);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('auth:token', 'jwt_token');
    });

    it('deve lançar erro se email não verificado', async () => {
      (api.post as jest.Mock).mockRejectedValue({
        response: {
          status: 403,
          data: { requiresEmailVerification: true },
        },
      });

      await expect(
        authService.signInWithEmail('test@example.com', 'password123')
      ).rejects.toThrow('EMAIL_NOT_VERIFIED');
    });

    it('deve lançar erro se credenciais inválidas', async () => {
      (api.post as jest.Mock).mockRejectedValue({
        response: { status: 401 },
      });

      await expect(
        authService.signInWithEmail('test@example.com', 'wrong_password')
      ).rejects.toThrow('Credenciais inválidas');
    });
  });

  describe('registerWithEmail', () => {
    it('deve registrar usuário com sucesso', async () => {
      const mockUser: User = {
        id: 'user_123',
        email: 'new@example.com',
        full_name: 'New User',
        created_at: new Date().toISOString(),
        email_verified: false,
        user_type: 'client',
      };

      (api.post as jest.Mock).mockResolvedValue({
        data: {
          user: mockUser,
          requiresEmailVerification: true,
          message: 'User created',
        },
      });

      const result = await authService.registerWithEmail(
        'new@example.com',
        'password123',
        'New User'
      );

      expect(result.user).toEqual(mockUser);
      expect(result.requiresEmailVerification).toBe(true);
    });

    it('deve salvar token se não precisar verificação', async () => {
      const mockUser: User = {
        id: 'user_123',
        email: 'new@example.com',
        full_name: 'New User',
        created_at: new Date().toISOString(),
        email_verified: true,
        user_type: 'client',
      };

      (api.post as jest.Mock).mockResolvedValue({
        data: {
          user: mockUser,
          requiresEmailVerification: false,
          token: 'jwt_token',
        },
      });
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      await authService.registerWithEmail('new@example.com', 'password123', 'New User');

      expect(AsyncStorage.setItem).toHaveBeenCalledWith('auth:token', 'jwt_token');
    });
  });

  describe('verifyEmail', () => {
    it('deve verificar email com sucesso', async () => {
      const mockUser: User = {
        id: 'user_123',
        email: 'test@example.com',
        full_name: 'Test User',
        created_at: new Date().toISOString(),
        email_verified: true,
        user_type: 'client',
      };

      (api.get as jest.Mock).mockResolvedValue({
        data: {
          token: 'jwt_token',
          user: mockUser,
          message: 'Email verified',
        },
      });
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      const result = await authService.verifyEmail('verification_token');

      expect(result.token).toBe('jwt_token');
      expect(result.user).toEqual(mockUser);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('auth:token', 'jwt_token');
    });
  });

  describe('signOut', () => {
    it('deve remover token do AsyncStorage', async () => {
      (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);

      await authService.signOut();

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('auth:token');
    });
  });
});

