import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '@ingressohub/entities';
import { authService } from '../services';
import { SocialAuthService } from '../services/socialAuthService';
import api from '../services/api';

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (email: string, password: string, full_name?: string) => Promise<void>;
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
          } catch {
            await AsyncStorage.removeItem('auth:token');
            await AsyncStorage.removeItem('auth:user');
            setUser(null);
          }
        } else if (raw) {
          const parsed = JSON.parse(raw) as User;
          setUser(parsed);
        }
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

  const registerWithEmail = async (email: string, password: string, full_name?: string) => {
    const created = await authService.registerWithEmail(email, password, full_name);
    setUser(created);
    await AsyncStorage.setItem('auth:user', JSON.stringify(created));
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

  const value = useMemo(
    () => ({ user, loading, signInWithEmail, registerWithEmail, signInWithGoogle, signInWithApple, signOut }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}


