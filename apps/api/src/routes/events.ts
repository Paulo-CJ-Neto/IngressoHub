import { Router, Request, Response } from 'express';
import { EventRepository } from '../db/repositories/EventRepository';
import { Event } from '@ingressohub/entities';

const router = Router();

// GET /api/events - Listar todos os eventos
router.get('/', async (req: Request, res: Response) => {
  try {
    const events = await EventRepository.findAll();
    res.json(events);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/events/active - Listar eventos ativos
router.get('/active', async (req: Request, res: Response) => {
  try {
    const events = await EventRepository.findActive();
    res.json(events);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/events/:id - Buscar evento por ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const event = await EventRepository.findById(id);
    
    if (!event) {
      return res.status(404).json({ error: 'Evento não encontrado' });
    }
    
    res.json(event);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/events - Criar novo evento
router.post('/', async (req: Request, res: Response) => {
  try {
    const eventData: Partial<Event> = req.body;
    
    // Validar dados obrigatórios
    if (!eventData.name || !eventData.date || !eventData.location || !eventData.price) {
      return res.status(400).json({ 
        error: 'Nome, data, local e preço são obrigatórios' 
      });
    }
    
    // Gerar ID se não fornecido
    if (!eventData.id) {
      eventData.id = `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    // Definir valores padrão
    eventData.status = eventData.status || 'active';
    eventData.sold_tickets = eventData.sold_tickets || 0;
    eventData.max_tickets = eventData.max_tickets || 1000;
    eventData.description = eventData.description || '';
    eventData.image_url = eventData.image_url || '';
    
    const event = await EventRepository.createOrUpdate(eventData as Event);
    res.status(201).json(event);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/events/:id - Atualizar evento
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const event = await EventRepository.update(id, updates);
    
    if (!event) {
      return res.status(404).json({ error: 'Evento não encontrado' });
    }
    
    res.json(event);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/events/:id - Atualizar evento parcialmente
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const event = await EventRepository.update(id, updates);
    
    if (!event) {
      return res.status(404).json({ error: 'Evento não encontrado' });
    }
    
    res.json(event);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/events/:id/sold-tickets - Incrementar ingressos vendidos
router.patch('/:id/sold-tickets', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    
    if (!quantity || quantity <= 0) {
      return res.status(400).json({ 
        error: 'Quantidade deve ser um número positivo' 
      });
    }
    
    const event = await EventRepository.incrementSoldTickets(id, quantity);
    
    if (!event) {
      return res.status(404).json({ error: 'Evento não encontrado' });
    }
    
    res.json(event);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/events/:id - Deletar evento
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await EventRepository.delete(id);
    
    if (!deleted) {
      return res.status(404).json({ error: 'Evento não encontrado' });
    }
    
    res.json({ message: 'Evento deletado com sucesso' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
