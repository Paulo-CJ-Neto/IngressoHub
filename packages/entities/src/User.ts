export interface User {
  id: string;
  email: string;
  full_name: string;
  password_hash?: string;
  avatar_url?: string;
  created_at: string;
  email_verified?: boolean;
  email_verification_token?: string;
  email_verification_expires?: string;
  user_type: 'client' | 'producer' | 'admin';
}

// Dados mockados para demonstração
let currentUser: User | null = null;

export class UserService {
  static async me(): Promise<User> {
    // Simula uma chamada de API
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (!currentUser) {
      throw new Error('User not logged in');
    }
    
    return currentUser;
  }

  static async loginWithRedirect(redirectUrl?: string): Promise<void> {
    // Simula login com Google
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock user data
    currentUser = {
      id: 'user_1',
      email: 'usuario@exemplo.com',
      full_name: 'João Silva',
      avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      created_at: new Date().toISOString(),
      user_type: 'client' // Adicionado para mock
    };
    
    // Em um app real, aqui você redirecionaria para a URL de retorno
    console.log('User logged in successfully');
  }

  static async logout(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    currentUser = null;
  }

  static isLoggedIn(): boolean {
    return currentUser !== null;
  }
}
