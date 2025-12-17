import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '@ingressohub/entities';
import { authService } from '@/services';
import { SocialAuthService } from '@/services/socialAuthService';
import api from '@/services/api';

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  isClient: boolean;
  isProducer: boolean;
  isAdmin: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (email: string, password: string, full_name?: string, user_type?: 'client' | 'producer' | 'admin') => Promise<{ user: User; requiresEmailVerification: boolean }>;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const raw = await AsyncStorage.getItem('auth:user');
        const token = await AsyncStorage.getItem('auth:token');
        
        if (token) {
          try {
            const res = await api.get('/auth/me');
            const fresh = (res.data as { user: User }).user;
            setUser(fresh);
            await AsyncStorage.setItem('auth:user', JSON.stringify(fresh));
          } catch (error) {
            // Token inválido ou erro de rede - limpar dados
            console.log('Token inválido ou erro de rede, limpando dados de auth');
            await AsyncStorage.removeItem('auth:token');
            await AsyncStorage.removeItem('auth:user');
            setUser(null);
          }
        } else if (raw) {
          // Usar dados salvos localmente se não houver token
          try {
            const parsed = JSON.parse(raw) as User;
            setUser(parsed);
          } catch (error) {
            console.log('Erro ao parsear dados de usuário salvos');
            await AsyncStorage.removeItem('auth:user');
            setUser(null);
          }
        }
      } catch (error) {
        console.log('Erro geral no carregamento de auth:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const signInWithEmail = async (email: string, password: string) => {
    const logged = await authService.signInWithEmail(email, password);
    setUser(logged);
    await AsyncStorage.setItem('auth:user', JSON.stringify(logged));
  };

  const registerWithEmail = async (email: string, password: string, full_name?: string, user_type?: 'client' | 'producer' | 'admin') => {
    const result = await authService.registerWithEmail(email, password, full_name, user_type);
    
    // Se não precisar de verificação, salvar usuário e token
    if (!result.requiresEmailVerification) {
      setUser(result.user);
      await AsyncStorage.setItem('auth:user', JSON.stringify(result.user));
    }
    
    return result;
  };

  const signInWithGoogle = async () => {
    const result = await SocialAuthService.signInWithGoogle();
    if (result.success && result.user && result.token) {
      setUser(result.user);
      await AsyncStorage.setItem('auth:user', JSON.stringify(result.user));
      await AsyncStorage.setItem('auth:token', result.token);
    } else {
      throw new Error(result.error || 'Falha na autenticação com Google');
    }
  };

  const signInWithApple = async () => {
    const result = await SocialAuthService.signInWithApple();
    if (result.success && result.user && result.token) {
      setUser(result.user);
      await AsyncStorage.setItem('auth:user', JSON.stringify(result.user));
      await AsyncStorage.setItem('auth:token', result.token);
    } else {
      throw new Error(result.error || 'Falha na autenticação com Apple');
    }
  };

  const signOut = async () => {
    await authService.signOut();
    setUser(null);
    await AsyncStorage.removeItem('auth:user');
  };

  // Calcular tipos de usuário
  const isClient = user?.user_type === 'client';
  const isProducer = user?.user_type === 'producer';
  const isAdmin = user?.user_type === 'admin';

  const value = useMemo(
    () => ({ 
      user, 
      loading, 
      isClient, 
      isProducer, 
      isAdmin,
      signInWithEmail, 
      registerWithEmail, 
      signInWithGoogle, 
      signInWithApple, 
      signOut 
    }),
    [user, loading, isClient, isProducer, isAdmin]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}


