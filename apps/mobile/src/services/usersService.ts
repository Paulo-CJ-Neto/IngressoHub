import api from './api';
import { User } from '@ingressohub/entities';

export interface UsersService {
  // Buscar todos os usuários
  getAllUsers(): Promise<User[]>;
  
  // Buscar usuários por nome
  searchUsersByName(name: string): Promise<User[]>;
  
  // Buscar usuário por email
  getUserByEmail(email: string): Promise<User>;
  
  // Buscar usuário por ID
  getUserById(id: string): Promise<User>;
  
  // Criar novo usuário
  createUser(userData: Partial<User>): Promise<User>;
  
  // Atualizar usuário
  updateUser(id: string, updates: Partial<User>): Promise<User>;
  
  // Deletar usuário
  deleteUser(id: string): Promise<void>;
}

class UsersServiceImpl implements UsersService {
  async getAllUsers(): Promise<User[]> {
    try {
      const response = await api.get('/users');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      throw error;
    }
  }

  async searchUsersByName(name: string): Promise<User[]> {
    try {
      const response = await api.get('/users/search', {
        params: { name }
      });
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar usuários por nome "${name}":`, error);
      throw error;
    }
  }

  async getUserByEmail(email: string): Promise<User> {
    try {
      const response = await api.get(`/users/email/${encodeURIComponent(email)}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar usuário por email ${email}:`, error);
      throw error;
    }
  }

  async getUserById(id: string): Promise<User> {
    try {
      const response = await api.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar usuário ${id}:`, error);
      throw error;
    }
  }

  async createUser(userData: Partial<User>): Promise<User> {
    try {
      const response = await api.post('/users', userData);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      throw error;
    }
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    try {
      const response = await api.put(`/users/${id}`, updates);
      return response.data;
    } catch (error) {
      console.error(`Erro ao atualizar usuário ${id}:`, error);
      throw error;
    }
  }

  async deleteUser(id: string): Promise<void> {
    try {
      await api.delete(`/users/${id}`);
    } catch (error) {
      console.error(`Erro ao deletar usuário ${id}:`, error);
      throw error;
    }
  }
}

export const usersService = new UsersServiceImpl();
