// Configurações OAuth para autenticação social
// IMPORTANTE: Em produção, essas configurações devem vir de variáveis de ambiente

export const OAUTH_CONFIG = {
  GOOGLE: {
    CLIENT_ID: '587615146792-odopgobv6ve37bgqt941gte85isusiht.apps.googleusercontent.com',
    REDIRECT_URI: 'ingressohub://auth',
    SCOPES: ['openid', 'profile', 'email'],
  },
  APPLE: {
    CLIENT_ID: process.env.EXPO_PUBLIC_APPLE_CLIENT_ID || 'YOUR_APPLE_CLIENT_ID',
    REDIRECT_URI: 'ingressohub://auth',
    SCOPES: ['name', 'email'],
  },
};

// URLs de autorização
export const AUTH_URLS = {
  GOOGLE: 'https://accounts.google.com/o/oauth2/v2/auth',
  APPLE: 'https://appleid.apple.com/auth/authorize',
};

// URLs de troca de token
export const TOKEN_URLS = {
  GOOGLE: 'https://oauth2.googleapis.com/token',
  APPLE: 'https://appleid.apple.com/auth/token',
};

// URLs de informações do usuário
export const USER_INFO_URLS = {
  GOOGLE: 'https://www.googleapis.com/oauth2/v2/userinfo',
  APPLE: null, // Apple não fornece endpoint para informações do usuário
};
