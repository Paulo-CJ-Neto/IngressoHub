"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
// Dados mockados para demonstração
let currentUser = null;
class UserService {
    static async me() {
        // Simula uma chamada de API
        await new Promise(resolve => setTimeout(resolve, 500));
        if (!currentUser) {
            throw new Error('User not logged in');
        }
        return currentUser;
    }
    static async loginWithRedirect(redirectUrl) {
        // Simula login com Google
        await new Promise(resolve => setTimeout(resolve, 1000));
        // Mock user data
        currentUser = {
            id: 'user_1',
            email: 'usuario@exemplo.com',
            full_name: 'João Silva',
            avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
            created_at: new Date().toISOString()
        };
        // Em um app real, aqui você redirecionaria para a URL de retorno
        console.log('User logged in successfully');
    }
    static async logout() {
        await new Promise(resolve => setTimeout(resolve, 300));
        currentUser = null;
    }
    static isLoggedIn() {
        return currentUser !== null;
    }
}
exports.UserService = UserService;
