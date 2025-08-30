// Exemplo de configuração OAuth para autenticação social
// Copie este arquivo para oauth.ts e configure com suas credenciais

export const OAUTH_CONFIG = {
  GOOGLE: {
    CLIENT_ID: '587615146792-odopgobv6ve37bgqt941gte85isusiht.apps.googleusercontent.com', // Client ID real configurado
    REDIRECT_URI: 'ingressohub://auth',
    SCOPES: ['openid', 'profile', 'email'],
  },
  APPLE: {
    CLIENT_ID: 'com.ingressohub.mobile.service', // Substitua pelo seu Client ID da Apple
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
