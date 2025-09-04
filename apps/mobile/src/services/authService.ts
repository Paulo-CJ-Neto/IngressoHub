import { User } from '@ingressohub/entities';
import api from './api';
import { usersService } from './usersService';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AuthService {
  signInWithEmail(email: string, password: string): Promise<User>;
  registerWithEmail(email: string, password: string, full_name?: string, user_type?: 'client' | 'producer' | 'admin'): Promise<{ user: User; requiresEmailVerification: boolean }>;
  verifyEmail(token: string): Promise<{ token: string; user: User }>;
  resendVerification(email: string): Promise<void>;
  signOut(): Promise<void>;
}

export interface RegisterResponse {
  user: User;
  requiresEmailVerification: boolean;
  message: string;
}

export interface VerificationResponse {
  token: string;
  user: User;
  message: string;
}

class AuthServiceImpl implements AuthService {
  async signInWithEmail(email: string, password: string): Promise<User> {
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token, user } = res.data as { token: string; user: User };
      await AsyncStorage.setItem('auth:token', token);
      return user;
    } catch (err: any) {
      if (err.response?.status === 403 && err.response?.data?.requiresEmailVerification) {
        throw new Error('EMAIL_NOT_VERIFIED');
      }
      throw new Error('Credenciais inválidas');
    }
  }

  async registerWithEmail(email: string, password: string, full_name?: string, user_type?: 'client' | 'producer' | 'admin'): Promise<{ user: User; requiresEmailVerification: boolean }> {
    try {
      const res = await api.post('/auth/register', { email, password, full_name, user_type });
      const { user, requiresEmailVerification, message } = res.data as RegisterResponse;
      
      // Se não precisar de verificação, salvar token
      if (!requiresEmailVerification) {
        const { token } = res.data as { token: string; user: User };
        await AsyncStorage.setItem('auth:token', token);
      }
      
      return { user, requiresEmailVerification };
    } catch (err: any) {
      if (err.response?.data?.message) {
        throw new Error(err.response.data.message);
      }
      throw new Error('Erro ao cadastrar usuário');
    }
  }

  async verifyEmail(token: string): Promise<{ token: string; user: User }> {
    try {
      const res = await api.get(`/auth/verify-email?token=${token}`);
      const { token: jwtToken, user } = res.data as VerificationResponse;
      await AsyncStorage.setItem('auth:token', jwtToken);
      return { token: jwtToken, user };
    } catch (err: any) {
      if (err.response?.data?.message) {
        throw new Error(err.response.data.message);
      }
      throw new Error('Erro ao verificar email');
    }
  }

  async resendVerification(email: string): Promise<void> {
    try {
      await api.post('/auth/resend-verification', { email });
    } catch (err: any) {
      if (err.response?.data?.message) {
        throw new Error(err.response.data.message);
      }
      throw new Error('Erro ao reenviar verificação');
    }
  }

  async signOut(): Promise<void> {
    await AsyncStorage.removeItem('auth:token');
    return;
  }
}

export const authService: AuthService = new AuthServiceImpl();


