import { Router } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { User } from '@ingressohub/entities';
import { UserRepository } from '../db/repositories/UserRepository';
import { requireAuth } from '../middleware/auth';

// Configurações para autenticação social
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'your-google-client-id';
const APPLE_CLIENT_ID = process.env.APPLE_CLIENT_ID || 'your-apple-client-id';

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const JWT_EXPIRES_IN = '7d';

function signToken(user: User) {
  return jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body as { email: string; password: string };
    if (!email || !password) {
      return res.status(400).json({ message: 'Email e senha são obrigatórios.' });
    }
    
    const user = await UserRepository.findByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }
    
    // Verificar se o usuário tem senha hash (usuários antigos podem não ter)
    if (!user.password_hash) {
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }
    
    // Validar senha
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }
    
    const token = signToken(user);
    return res.json({ token, user });
  } catch (e) {
    console.error('Auth login error', e);
    return res.status(500).json({ message: 'Erro ao autenticar.' });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { email, password, full_name } = req.body as { email: string; password: string; full_name?: string };
    if (!email || !password) {
      return res.status(400).json({ message: 'Email e senha são obrigatórios.' });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ message: 'A senha deve ter pelo menos 6 caracteres.' });
    }
    
    const exists = await UserRepository.emailExists(email);
    if (exists) {
      return res.status(409).json({ message: 'Email já cadastrado.' });
    }
    
    // Hash da senha
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    const newUser: User = {
      id: `user_${Date.now()}`,
      email,
      full_name: full_name || email.split('@')[0],
      password_hash: passwordHash,
      avatar_url: '',
      created_at: new Date().toISOString(),
    };
    
    await UserRepository.createOrUpdate(newUser);
    
    // Não retornar o hash da senha
    const { password_hash, ...userWithoutPassword } = newUser;
    const token = signToken(newUser);
    
    return res.status(201).json({ token, user: userWithoutPassword });
  } catch (e) {
    console.error('Auth register error', e);
    return res.status(500).json({ message: 'Erro ao cadastrar.' });
  }
});

// Login social
router.post('/social-login', async (req, res) => {
  try {
    const { provider, auth_data } = req.body as { 
      provider: 'google' | 'apple'; 
      auth_data: any 
    };

    if (!provider || !auth_data) {
      return res.status(400).json({ message: 'Provider e auth_data são obrigatórios.' });
    }

    let userInfo: any;
    let email: string;
    let fullName: string = '';

    if (provider === 'google') {
      // Verificar token do Google
      const googleResponse = await fetch(`https://oauth2.googleapis.com/tokeninfo?access_token=${auth_data.access_token}`);
      if (!googleResponse.ok) {
        return res.status(401).json({ message: 'Token do Google inválido.' });
      }

      const googleUserInfo = auth_data.user_info;
      email = googleUserInfo.email;
      fullName = googleUserInfo.name || googleUserInfo.given_name + ' ' + googleUserInfo.family_name;
    } else if (provider === 'apple') {
      // Para Apple, precisamos verificar o ID token
      // Em produção, você deve verificar a assinatura JWT da Apple
      email = auth_data.user_info.email || `apple_${Date.now()}@apple.com`;
      fullName = auth_data.user_info.name || 'Usuário Apple';
    } else {
      return res.status(400).json({ message: 'Provider não suportado.' });
    }

    if (!email) {
      return res.status(400).json({ message: 'Email não encontrado no provider.' });
    }

    // Verificar se o usuário já existe
    let user = await UserRepository.findByEmail(email);
    
    if (!user) {
      // Criar novo usuário
      const newUser: User = {
        id: `user_${Date.now()}`,
        email,
        full_name: fullName,
        password_hash: '', // Usuários sociais não têm senha
        avatar_url: provider === 'google' ? auth_data.user_info.picture : '',
        created_at: new Date().toISOString(),
      };
      
      await UserRepository.createOrUpdate(newUser);
      user = newUser;
    }

    // Gerar token JWT
    const token = signToken(user);
    
    // Não retornar o hash da senha
    const { password_hash, ...userWithoutPassword } = user;
    
    return res.json({ token, user: userWithoutPassword });
  } catch (e) {
    console.error('Social login error', e);
    return res.status(500).json({ message: 'Erro ao fazer login social.' });
  }
});

export default router;

// Perfil autenticado
router.get('/me', requireAuth, async (req, res) => {
  try {
    const auth = (req as any).auth as { sub: string; email: string };
    const user = await UserRepository.findByEmail(auth.email);
    if (!user) return res.status(404).json({ message: 'Usuário não encontrado.' });
    console.log(user)
    return res.json({ user });
  } catch (e) {
    return res.status(500).json({ message: 'Erro ao carregar perfil.' });
  }
});


