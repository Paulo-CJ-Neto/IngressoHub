import { User } from '@ingressohub/entities';
import api from './api';
import { usersService } from './usersService';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AuthService {
  signInWithEmail(email: string, password: string): Promise<User>;
  registerWithEmail(email: string, password: string, full_name?: string): Promise<User>;
  signOut(): Promise<void>;
}

class AuthServiceImpl implements AuthService {
  async signInWithEmail(email: string, password: string): Promise<User> {
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token, user } = res.data as { token: string; user: User };
      await AsyncStorage.setItem('auth:token', token);
      return user;
    } catch (err) {
      throw new Error('Credenciais inválidas');
    }
  }

  async registerWithEmail(email: string, password: string, full_name?: string): Promise<User> {
    try {
      const res = await api.post('/auth/register', { email, password, full_name });
      const { token, user } = res.data as { token: string; user: User };
      await AsyncStorage.setItem('auth:token', token);
      return user;
    } catch (err) {
      throw new Error('Erro ao cadastrar usuário');
    }
  }

  async signOut(): Promise<void> {
    await AsyncStorage.removeItem('auth:token');
    return;
  }
}

export const authService: AuthService = new AuthServiceImpl();


