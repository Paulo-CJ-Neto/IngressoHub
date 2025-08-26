import { Router, Request, Response } from 'express';
import { UserRepository } from '../db/repositories/UserRepository';
import { User } from '@ingressohub/entities';

const router = Router();

// GET /api/users - Listar todos os usuários
router.get('/', async (req: Request, res: Response) => {
  try {
    const users = await UserRepository.findAll();
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/users/search - Buscar usuários por nome
router.get('/search', async (req: Request, res: Response) => {
  try {
    const { name } = req.query;
    
    if (!name || typeof name !== 'string') {
      return res.status(400).json({ 
        error: 'Parâmetro "name" é obrigatório' 
      });
    }
    
    const users = await UserRepository.searchByName(name);
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/users/email/:email - Buscar usuário por email
router.get('/email/:email', async (req: Request, res: Response) => {
  try {
    const { email } = req.params;
    const user = await UserRepository.findByEmail(email);
    
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/users/:id - Buscar usuário por ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await UserRepository.findById(id);
    
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/users - Criar novo usuário
router.post('/', async (req: Request, res: Response) => {
  try {
    const userData: Partial<User> = req.body;
    
    // Validar dados obrigatórios
    if (!userData.email || !userData.full_name) {
      return res.status(400).json({ 
        error: 'Email e nome completo são obrigatórios' 
      });
    }
    
    // Verificar se email já existe
    const emailExists = await UserRepository.emailExists(userData.email);
    if (emailExists) {
      return res.status(409).json({ 
        error: 'Email já está em uso' 
      });
    }
    
    // Gerar ID se não fornecido
    if (!userData.id) {
      userData.id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    // Definir valores padrão
    userData.created_at = userData.created_at || new Date().toISOString();
    userData.avatar_url = userData.avatar_url || '';
    
    const user = await UserRepository.createOrUpdate(userData as User);
    res.status(201).json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/users/:id - Atualizar usuário
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Não permitir alteração de email se já existir outro usuário com o mesmo
    if (updates.email) {
      const existingUser = await UserRepository.findByEmail(updates.email);
      if (existingUser && existingUser.id !== id) {
        return res.status(409).json({ 
          error: 'Email já está em uso por outro usuário' 
        });
      }
    }
    
    const user = await UserRepository.update(id, updates);
    
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/users/:id - Atualizar usuário parcialmente
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Não permitir alteração de email se já existir outro usuário com o mesmo
    if (updates.email) {
      const existingUser = await UserRepository.findByEmail(updates.email);
      if (existingUser && existingUser.id !== id) {
        return res.status(409).json({ 
          error: 'Email já está em uso por outro usuário' 
        });
      }
    }
    
    const user = await UserRepository.update(id, updates);
    
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/users/:id - Deletar usuário
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await UserRepository.delete(id);
    
    if (!deleted) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    res.json({ message: 'Usuário deletado com sucesso' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
