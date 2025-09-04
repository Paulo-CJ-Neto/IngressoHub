// Configurações OAuth para DESENVOLVIMENTO
// Este arquivo deve ser usado apenas em desenvolvimento

export const OAUTH_CONFIG_DEV = {
  GOOGLE: {
    CLIENT_ID: '587615146792-odopgobv6ve37bgqt941gte85isusiht.apps.googleusercontent.com',
    // URLs de redirecionamento para desenvolvimento
    REDIRECT_URIS: [
      'exp://192.168.1.101:8081/--/auth',  // Seu IP local
      'exp://localhost:8081/--/auth',       // Localhost
      'exp://localhost:19000/--/auth',      // Expo padrão
      'http://localhost:19006/auth',        // Web
      'ingressohub://auth'                  // Scheme personalizado
    ],
    SCOPES: ['openid', 'profile', 'email'],
  },
  APPLE: {
    CLIENT_ID: process.env.EXPO_PUBLIC_APPLE_CLIENT_ID || 'YOUR_APPLE_CLIENT_ID',
    REDIRECT_URIS: [
      'exp://192.168.1.101:8081/--/auth',
      'exp://localhost:8081/--/auth',
      'exp://localhost:19000/--/auth',
      'http://localhost:19006/auth',
      'ingressohub://auth'
    ],
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
  APPLE: null,
};
