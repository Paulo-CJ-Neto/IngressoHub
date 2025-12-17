import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';
import api from './api';
import { OAUTH_CONFIG, AUTH_URLS, TOKEN_URLS, USER_INFO_URLS } from '@/config/oauth';
import { OAUTH_CONFIG_DEV } from '@/config/oauth.dev';

// Configurar WebBrowser para autenticação
WebBrowser.maybeCompleteAuthSession();

export interface SocialAuthResult {
  success: boolean;
  user?: any;
  token?: string;
  error?: string;
}

export class SocialAuthService {
  // Autenticação com Google
  static async signInWithGoogle(): Promise<SocialAuthResult> {
    try {
      // Para desenvolvimento, usar URLs específicas do Expo
      const redirectUri = AuthSession.makeRedirectUri({
        scheme: 'ingressohub',
        path: 'auth'
      });

      console.log('Google OAuth Redirect URI:', redirectUri);

      const request = new AuthSession.AuthRequest({
        clientId: OAUTH_CONFIG_DEV.GOOGLE.CLIENT_ID,
        scopes: OAUTH_CONFIG_DEV.GOOGLE.SCOPES,
        redirectUri,
        responseType: AuthSession.ResponseType.Code,
        extraParams: {
          access_type: 'offline',
        },
      });

      const result = await request.promptAsync({
        authorizationEndpoint: AUTH_URLS.GOOGLE,
      });

      if (result.type === 'success' && result.params.code) {
        // Trocar o código de autorização por um token
        const tokenResponse = await this.exchangeGoogleCode(result.params.code);
        
        if (tokenResponse.access_token) {
          // Obter informações do usuário
          const userInfo = await this.getGoogleUserInfo(tokenResponse.access_token);
          
          // Fazer login na nossa API
          const apiResult = await this.socialLogin('google', {
            access_token: tokenResponse.access_token,
            id_token: tokenResponse.id_token,
            user_info: userInfo
          });

          return apiResult;
        }
      }

      return { success: false, error: 'Falha na autenticação com Google' };
    } catch (error) {
      console.error('Google sign in error:', error);
      return { success: false, error: 'Erro ao fazer login com Google' };
    }
  }

  // Autenticação com Apple
  static async signInWithApple(): Promise<SocialAuthResult> {
    try {
      const redirectUri = AuthSession.makeRedirectUri({
        scheme: 'ingressohub',
        path: 'auth'
      });

      const request = new AuthSession.AuthRequest({
        clientId: OAUTH_CONFIG.APPLE.CLIENT_ID,
        scopes: OAUTH_CONFIG.APPLE.SCOPES,
        redirectUri,
        responseType: AuthSession.ResponseType.Code,
        extraParams: {
          response_mode: 'form_post',
        },
      });

      const result = await request.promptAsync({
        authorizationEndpoint: AUTH_URLS.APPLE,
      });

      if (result.type === 'success' && result.params.code) {
        // Trocar o código de autorização por um token
        const tokenResponse = await this.exchangeAppleCode(result.params.code);
        
        if (tokenResponse.access_token) {
          // Obter informações do usuário
          const userInfo = await this.getAppleUserInfo(tokenResponse.access_token);
          
          // Fazer login na nossa API
          const apiResult = await this.socialLogin('apple', {
            access_token: tokenResponse.access_token,
            id_token: tokenResponse.id_token,
            user_info: userInfo
          });

          return apiResult;
        }
      }

      return { success: false, error: 'Falha na autenticação com Apple' };
    } catch (error) {
      console.error('Apple sign in error:', error);
      return { success: false, error: 'Erro ao fazer login com Apple' };
    }
  }

  // Trocar código de autorização por token (Google)
  private static async exchangeGoogleCode(code: string) {
    const redirectUri = AuthSession.makeRedirectUri({
      scheme: 'ingressohub',
      path: 'auth'
    });

    const response = await fetch(TOKEN_URLS.GOOGLE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
              body: new URLSearchParams({
          code,
          client_id: OAUTH_CONFIG_DEV.GOOGLE.CLIENT_ID,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
        }).toString(),
    });

    return response.json();
  }

  // Trocar código de autorização por token (Apple)
  private static async exchangeAppleCode(code: string) {
    const redirectUri = AuthSession.makeRedirectUri({
      scheme: 'ingressohub',
      path: 'auth'
    });

    const response = await fetch(TOKEN_URLS.APPLE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: OAUTH_CONFIG.APPLE.CLIENT_ID,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }).toString(),
    });

    return response.json();
  }

  // Obter informações do usuário do Google
  private static async getGoogleUserInfo(accessToken: string) {
    const response = await fetch(USER_INFO_URLS.GOOGLE!, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return response.json();
  }

  // Obter informações do usuário da Apple
  private static async getAppleUserInfo(accessToken: string) {
    // Apple não fornece endpoint para obter informações do usuário
    // Retornamos um objeto vazio, mas o id_token contém as informações básicas
    return {};
  }

  // Fazer login na nossa API usando autenticação social
  private static async socialLogin(provider: 'google' | 'apple', authData: any): Promise<SocialAuthResult> {
    try {
      const response = await api.post('/auth/social-login', {
        provider,
        auth_data: authData
      });

      return {
        success: true,
        user: response.data.user,
        token: response.data.token
      };
    } catch (error: any) {
      console.error('Social login API error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao fazer login social'
      };
    }
  }
}

export default SocialAuthService;
