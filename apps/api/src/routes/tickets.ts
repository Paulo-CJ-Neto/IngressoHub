import { Router, Request, Response } from 'express';
import { TicketRepository } from '../db/repositories/TicketRepository';
import { EventRepository } from '../db/repositories/EventRepository';
import { Ticket } from '@ingressohub/entities';

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

// POST /api/tickets - Criar novo ticket
router.post('/', async (req: Request, res: Response) => {
  try {
    const ticketData: Partial<Ticket> = req.body;
    
    // Validar dados obrigatórios
    if (!ticketData.event_id || !ticketData.buyer_name || !ticketData.buyer_email || !ticketData.buyer_cpf) {
      return res.status(400).json({ 
        error: 'ID do evento, nome, email e CPF do comprador são obrigatórios' 
      });
    }
    
    // Verificar se o evento existe
    const event = await EventRepository.findById(ticketData.event_id);
    if (!event) {
      return res.status(404).json({ error: 'Evento não encontrado' });
    }
    
    // Verificar disponibilidade de ingressos
    if (event.sold_tickets + (ticketData.quantity || 1) > event.max_tickets) {
      return res.status(400).json({ 
        error: 'Quantidade de ingressos não disponível' 
      });
    }
    
    // Gerar ID se não fornecido
    if (!ticketData.id) {
      ticketData.id = `ticket_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    // Gerar QR Code se não fornecido
    if (!ticketData.qr_code) {
      ticketData.qr_code = await TicketRepository.generateUniqueQrCode();
    }
    
    // Definir valores padrão
    ticketData.status = ticketData.status || 'valid';
    ticketData.created_at = ticketData.created_at || new Date().toISOString();
    ticketData.quantity = ticketData.quantity || 1;
    
    // Calcular preço total se não fornecido
    if (!ticketData.total_price) {
      ticketData.total_price = event.price * (ticketData.quantity || 1);
    }
    
    // Criar o ticket
    const ticket = await TicketRepository.createOrUpdate(ticketData as Ticket);
    
    // Incrementar contador de ingressos vendidos no evento
    await EventRepository.incrementSoldTickets(event.id, ticketData.quantity || 1);
    
    res.status(201).json(ticket);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
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
