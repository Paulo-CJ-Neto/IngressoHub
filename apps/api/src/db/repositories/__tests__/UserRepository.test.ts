import { UserRepository } from '../UserRepository';
import { docClient } from '../../client';
import { createMockUser } from '../../../test-utils/helpers';
import { GetCommand, PutCommand, UpdateCommand, QueryCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';

jest.mock('../../client');

describe('UserRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('deve buscar usuário por ID', async () => {
      const mockUser = createMockUser();
      (docClient.send as jest.Mock).mockResolvedValue({ Item: mockUser });

      const result = await UserRepository.findById('user_123');

      expect(result).toEqual(mockUser);
      expect(docClient.send).toHaveBeenCalledWith(expect.any(GetCommand));
    });
  });

  describe('findByEmail', () => {
    it('deve buscar usuário por email usando índice', async () => {
      const mockUser = createMockUser({ email: 'test@example.com' });
      (docClient.send as jest.Mock).mockResolvedValue({ Items: [mockUser] });

      const result = await UserRepository.findByEmail('test@example.com');

      expect(result).toEqual(mockUser);
      expect(docClient.send).toHaveBeenCalledWith(expect.any(QueryCommand));
    });

    it('deve fazer scan se índice não existir', async () => {
      const mockUser = createMockUser({ email: 'test@example.com' });
      (docClient.send as jest.Mock)
        .mockRejectedValueOnce(new Error('Index not found'))
        .mockResolvedValueOnce({ Items: [mockUser] });

      const result = await UserRepository.findByEmail('test@example.com');

      expect(result).toEqual(mockUser);
    });
  });

  describe('createOrUpdate', () => {
    it('deve criar ou atualizar usuário', async () => {
      const mockUser = createMockUser();
      (docClient.send as jest.Mock).mockResolvedValue({});

      const result = await UserRepository.createOrUpdate(mockUser);

      expect(result).toEqual(mockUser);
      expect(docClient.send).toHaveBeenCalledWith(expect.any(PutCommand));
    });
  });

  describe('update', () => {
    it('deve atualizar usuário existente', async () => {
      const mockUser = createMockUser();
      const updates = { full_name: 'Updated Name' };
      
      (docClient.send as jest.Mock)
        .mockResolvedValueOnce({ Item: mockUser })
        .mockResolvedValueOnce({ Attributes: { ...mockUser, ...updates } });

      const result = await UserRepository.update('user_123', updates);

      expect(result?.full_name).toBe('Updated Name');
    });

    it('deve retornar null se usuário não encontrado', async () => {
      (docClient.send as jest.Mock).mockResolvedValue({ Item: null });

      const result = await UserRepository.update('invalid_id', { full_name: 'Test' });

      expect(result).toBeNull();
    });
  });

  describe('emailExists', () => {
    it('deve retornar true se email existe', async () => {
      const mockUser = createMockUser();
      (docClient.send as jest.Mock).mockResolvedValue({ Items: [mockUser] });

      const result = await UserRepository.emailExists('test@example.com');

      expect(result).toBe(true);
    });

    it('deve retornar false se email não existe', async () => {
      (docClient.send as jest.Mock).mockResolvedValue({ Items: [] });

      const result = await UserRepository.emailExists('nonexistent@example.com');

      expect(result).toBe(false);
    });
  });

  describe('searchByName', () => {
    it('deve buscar usuários por nome', async () => {
      const mockUsers = [
        createMockUser({ full_name: 'John Doe' }),
        createMockUser({ full_name: 'Jane Doe' }),
        createMockUser({ full_name: 'Bob Smith' }),
      ];
      (docClient.send as jest.Mock).mockResolvedValue({ Items: mockUsers });

      const result = await UserRepository.searchByName('Doe');

      expect(result).toHaveLength(2);
      expect(result.every(u => u.full_name.includes('Doe'))).toBe(true);
    });
  });
});

