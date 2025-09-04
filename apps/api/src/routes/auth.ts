import { Router } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { User } from '@ingressohub/entities';
import { UserRepository } from '../db/repositories/UserRepository';
import { requireAuth } from '../middleware/auth';
import { EmailService } from '../services/EmailService';

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
    
    // Verificar se o email foi confirmado
    if (!user.email_verified) {
      return res.status(403).json({ 
        message: 'Email não verificado. Verifique sua caixa de entrada e confirme seu email.',
        requiresEmailVerification: true,
        email: user.email
      });
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
    const { email, password, full_name, user_type = 'client' } = req.body as { 
      email: string; 
      password: string; 
      full_name?: string;
      user_type?: 'client' | 'producer' | 'admin';
    };
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email e senha são obrigatórios.' });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ message: 'A senha deve ter pelo menos 6 caracteres.' });
    }
    
    // Validar user_type
    if (!['client', 'producer', 'admin'].includes(user_type)) {
      return res.status(400).json({ message: 'Tipo de usuário inválido.' });
    }
    
    const exists = await UserRepository.emailExists(email);
    if (exists) {
      return res.status(409).json({ message: 'Email já cadastrado.' });
    }
    
    // Hash da senha
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    // Gerar token de verificação
    const verificationToken = uuidv4();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 horas
    
    const newUser: User = {
      id: `user_${Date.now()}`,
      email,
      full_name: full_name || email.split('@')[0],
      password_hash: passwordHash,
      avatar_url: '',
      created_at: new Date().toISOString(),
      email_verified: false,
      email_verification_token: verificationToken,
      email_verification_expires: verificationExpires,
      user_type,
    };
    
    await UserRepository.createOrUpdate(newUser);
    
    // Enviar email de verificação
    try {
      await EmailService.sendVerificationEmail(email, verificationToken, newUser.full_name);
    } catch (emailError) {
      console.warn('⚠️ Erro ao enviar email de verificação, mas usuário foi criado:', emailError);
    }
    
    // Não retornar o hash da senha nem o token de verificação
    const { password_hash, email_verification_token, email_verification_expires, ...userWithoutSensitive } = newUser;
    
    return res.status(201).json({ 
      message: 'Usuário criado com sucesso! Verifique seu email para confirmar a conta.',
      user: userWithoutSensitive,
      requiresEmailVerification: true
    });
  } catch (e) {
    console.error('Auth register error', e);
    return res.status(500).json({ message: 'Erro ao cadastrar.' });
  }
});

// Endpoint para verificar email
router.get('/verify-email', async (req, res) => {
  try {
    const token = req.query.token as string;
    
    if (!token) {
      return res.status(400).json({ message: 'Token de verificação é obrigatório.' });
    }
    
    // Buscar usuário pelo token
    const allUsers = await UserRepository.findAll();
    const user = allUsers.find(u => u.email_verification_token === token);
    
    if (!user) {
      return res.status(400).json({ message: 'Token de verificação inválido.' });
    }
    
    // Verificar se o token expirou
    if (user.email_verification_expires && new Date(user.email_verification_expires) < new Date()) {
      return res.status(400).json({ message: 'Token de verificação expirou. Solicite um novo.' });
    }
    
    // Marcar email como verificado
    const updatedUser = await UserRepository.update(user.id, {
      email_verified: true,
      email_verification_token: undefined,
      email_verification_expires: undefined
    });
    
    if (!updatedUser) {
      return res.status(500).json({ message: 'Erro ao atualizar usuário.' });
    }
    
    // Enviar email de boas-vindas
    try {
      await EmailService.sendWelcomeEmail(user.email, user.full_name);
    } catch (emailError) {
      console.warn('⚠️ Erro ao enviar email de boas-vindas:', emailError);
    }
    
    // Gerar token JWT
    const jwtToken = signToken(updatedUser);
    
    // Não retornar dados sensíveis
    const { password_hash, email_verification_token, email_verification_expires, ...userWithoutSensitive } = updatedUser;
    
    return res.json({ 
      message: 'Email verificado com sucesso! Bem-vindo ao IngressoHub!',
      token: jwtToken,
      user: userWithoutSensitive
    });
  } catch (e) {
    console.error('Email verification error', e);
    return res.status(500).json({ message: 'Erro ao verificar email.' });
  }
});

// Endpoint para reenviar email de verificação
router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body as { email: string };
    
    if (!email) {
      return res.status(400).json({ message: 'Email é obrigatório.' });
    }
    
    const user = await UserRepository.findByEmail(email);
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }
    
    if (user.email_verified) {
      return res.status(400).json({ message: 'Email já foi verificado.' });
    }
    
    // Gerar novo token de verificação
    const verificationToken = uuidv4();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 horas
    
    await UserRepository.update(user.id, {
      email_verification_token: verificationToken,
      email_verification_expires: verificationExpires
    });
    
    // Enviar novo email de verificação
    try {
      await EmailService.sendVerificationEmail(email, verificationToken, user.full_name);
      return res.json({ message: 'Email de verificação reenviado com sucesso!' });
    } catch (emailError) {
      console.error('❌ Erro ao reenviar email de verificação:', emailError);
      return res.status(500).json({ message: 'Erro ao reenviar email de verificação.' });
    }
  } catch (e) {
    console.error('Resend verification error', e);
    return res.status(500).json({ message: 'Erro ao reenviar verificação.' });
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
        email_verified: true, // Usuários sociais já são verificados
        user_type: 'client', // Por padrão, usuários sociais são clientes
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

export default router;


