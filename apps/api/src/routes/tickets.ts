import { Router, Request, Response } from 'express';
import { TicketRepository } from '../db/repositories/TicketRepository';
import { EventRepository } from '../db/repositories/EventRepository';
import { Ticket } from '@ingressohub/entities';
import { TicketService } from '../services/TicketService';

const router = Router();

// GET /api/tickets - Listar todos os tickets
router.get('/', async (req: Request, res: Response) => {
  try {
    const tickets = await TicketRepository.findAll();
    res.json(tickets);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/tickets/event/:eventId - Buscar tickets por evento
router.get('/event/:eventId', async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;
    const tickets = await TicketRepository.findByEventId(eventId);
    res.json(tickets);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/tickets/buyer/:email - Buscar tickets por comprador (email)
router.get('/buyer/:email', async (req: Request, res: Response) => {
  try {
    const { email } = req.params;
    const tickets = await TicketRepository.findByBuyerEmail(email);
    res.json(tickets);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/tickets/cpf/:cpf - Buscar tickets por CPF do comprador
router.get('/cpf/:cpf', async (req: Request, res: Response) => {
  try {
    const { cpf } = req.params;
    const tickets = await TicketRepository.findByBuyerCpf(cpf);
    res.json(tickets);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/tickets/status/:status - Buscar tickets por status
router.get('/status/:status', async (req: Request, res: Response) => {
  try {
    const { status } = req.params;
    
    if (!['valid', 'used', 'cancelled'].includes(status)) {
      return res.status(400).json({ 
        error: 'Status deve ser: valid, used ou cancelled' 
      });
    }
    
    const tickets = await TicketRepository.findByStatus(status as Ticket['status']);
    res.json(tickets);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/tickets/qr/:qrCode - Buscar ticket por QR Code
router.get('/qr/:qrCode', async (req: Request, res: Response) => {
  try {
    const { qrCode } = req.params;
    const ticket = await TicketRepository.findByQrCode(qrCode);
    
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket não encontrado' });
    }
    
    res.json(ticket);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/tickets/:id - Buscar ticket por ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const ticket = await TicketRepository.findById(id);
    
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket não encontrado' });
    }
    
    res.json(ticket);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/tickets - Criar novo ticket (JWT + QRCode)
router.post('/', async (req: Request, res: Response) => {
  try {
    const { eventId, userId } = req.body as { eventId?: string; userId?: string };
    if (!eventId || !userId) {
      return res.status(400).json({ error: 'eventId e userId são obrigatórios' });
    }

    const result = await TicketService.createTicket({ eventId, userId });
    res.status(201).json(result);
  } catch (error: any) {
    if (error?.message?.includes('não configurada') || error?.message?.includes('Chave privada')) {
      return res.status(500).json({ error: 'Falha na configuração da assinatura do JWT' });
    }
    if (error?.message?.includes('Evento não encontrado')) {
      return res.status(404).json({ error: 'Evento não encontrado' });
    }
    res.status(500).json({ error: 'Falha na criação do ticket' });
  }
});

// PUT /api/tickets/:id - Atualizar ticket
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const ticket = await TicketRepository.update(id, updates);
    
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket não encontrado' });
    }
    
    res.json(ticket);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/tickets/:id/validate - Validar ticket
router.patch('/:id/validate', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const ticket = await TicketRepository.validateTicket(id);
    
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket não encontrado' });
    }
    
    res.json({ 
      message: 'Ticket validado com sucesso',
      ticket 
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/tickets/:id/cancel - Cancelar ticket
router.patch('/:id/cancel', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const ticket = await TicketRepository.cancelTicket(id);
    
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket não encontrado' });
    }
    
    res.json({ 
      message: 'Ticket cancelado com sucesso',
      ticket 
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/tickets/stats/event/:eventId - Estatísticas de tickets por evento
router.get('/stats/event/:eventId', async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;
    const stats = await TicketRepository.getEventTicketStats(eventId);
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/tickets/:id - Deletar ticket
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await TicketRepository.delete(id);
    
    if (!deleted) {
      return res.status(404).json({ error: 'Ticket não encontrado' });
    }
    
    res.json({ message: 'Ticket deletado com sucesso' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
