import { Router } from 'express';
import eventsRouter from './events';
import ticketsRouter from './tickets';
import usersRouter from './users';
import authRouter from './auth';

const router = Router();

// Prefixo para todas as rotas da API
const API_PREFIX = '/api';

// Rotas de eventos
router.use(`${API_PREFIX}/events`, eventsRouter);

// Rotas de tickets
router.use(`${API_PREFIX}/tickets`, ticketsRouter);

// Rotas de usuários
router.use(`${API_PREFIX}/users`, usersRouter);

// Rotas de autenticação
router.use(`${API_PREFIX}/auth`, authRouter);

export default router;
