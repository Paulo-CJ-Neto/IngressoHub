import { Router, Request, Response } from 'express';
import { EventRepository } from '../db/repositories/EventRepository';
import { Event } from '@ingressohub/entities';
import { uploadEventImages } from '../middleware/upload';
import { S3Service } from '../services/S3Service';

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

// POST /api/events - Criar novo evento com upload de imagens
router.post('/', uploadEventImages, async (req: Request, res: Response) => {
  try {
    const eventData: Partial<Event> = req.body;
    const files = req.files as any[];
    
    // Parse ticket_types se vier como JSON string (quando enviado via FormData)
    const ticketTypesRaw: unknown = (req.body as any).ticket_types;
    if (ticketTypesRaw !== undefined && ticketTypesRaw !== null) {
      if (typeof ticketTypesRaw === 'string') {
        try {
          // Limpar a string caso tenha espaços ou caracteres extras
          const cleaned = ticketTypesRaw.trim();
          const parsed = JSON.parse(cleaned);
          eventData.ticket_types = Array.isArray(parsed) ? parsed : [parsed];
        } catch (e: any) {
          console.error('Erro ao fazer parse de ticket_types:', e.message);
          console.error('Tipo recebido:', typeof ticketTypesRaw);
          console.error('Valor recebido:', ticketTypesRaw);
          console.error('Primeiros 100 caracteres:', String(ticketTypesRaw).substring(0, 100));
          return res.status(400).json({ 
            error: 'ticket_types inválido',
            details: e.message 
          });
        }
      } else if (Array.isArray(ticketTypesRaw)) {
        eventData.ticket_types = ticketTypesRaw;
      } else {
        // Se não é string nem array, não é um formato válido
        console.error('ticket_types em formato inválido:', typeof ticketTypesRaw, ticketTypesRaw);
        return res.status(400).json({ 
          error: 'ticket_types deve ser um array ou uma string JSON válida' 
        });
      }
    }
    
    // Validar dados obrigatórios
    if (!eventData.name || !eventData.date || !eventData.location || eventData.price === undefined || eventData.price === null) {
      return res.status(400).json({ 
        error: 'Nome, data, local e preço são obrigatórios' 
      });
    }

    // Validar produtor
    if (!eventData.producer_id) {
      return res.status(400).json({ error: 'producer_id é obrigatório' });
    }

    // Normalizar e validar data
    const dateValue = typeof eventData.date === 'string' ? eventData.date : String(eventData.date);
    const dateMs = Date.parse(dateValue);
    if (Number.isNaN(dateMs)) {
      return res.status(400).json({ error: 'Data inválida. Use ISO 8601 (ex.: 2024-12-31T20:00:00.000Z)' });
    }
    eventData.date = new Date(dateMs).toISOString();

    // Normalizar e validar price
    const priceNum = typeof eventData.price === 'string' 
      ? Number((eventData.price as string).replace(/[^0-9.,-]/g, '').replace(',', '.'))
      : Number(eventData.price);
    if (!Number.isFinite(priceNum) || priceNum < 0) {
      return res.status(400).json({ error: 'Preço inválido' });
    }
    eventData.price = priceNum;

    // Normalizar max_tickets (opcional, mas se vier deve ser válido)
    if (eventData.max_tickets !== undefined && eventData.max_tickets !== null) {
      const maxTicketsNum = typeof eventData.max_tickets === 'string' 
        ? parseInt(eventData.max_tickets as unknown as string, 10) 
        : Number(eventData.max_tickets);
      if (!Number.isInteger(maxTicketsNum) || maxTicketsNum <= 0) {
        return res.status(400).json({ error: 'max_tickets deve ser um inteiro positivo' });
      }
      eventData.max_tickets = maxTicketsNum;
    }
    
    // Gerar ID se não fornecido
    if (!eventData.id) {
      eventData.id = `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    // Upload de imagens para S3
    let imageUrls: string[] = [];
    if (files && files.length > 0) {
      try {
        imageUrls = await S3Service.uploadMultipleFiles(files, eventData.id);
        eventData.image_urls = imageUrls;
        eventData.image_url = imageUrls[0]; // Primeira imagem como principal
      } catch (uploadError: any) {
        console.error('Erro no upload das imagens:', uploadError);
        return res.status(500).json({ 
          error: 'Erro ao fazer upload das imagens',
          details: uploadError.message 
        });
      }
    } else {
      // Se não há imagens, usar URLs fornecidas no body (compatibilidade)
      const imageUrlsInput = (req.body as any).image_urls;
      if (Array.isArray(imageUrlsInput)) {
        eventData.image_urls = imageUrlsInput.filter((u: unknown) => typeof u === 'string' && u.trim().length > 0);
        if (!eventData.image_url && eventData.image_urls.length > 0) {
          eventData.image_url = eventData.image_urls[0];
        }
      } else if (typeof (req.body as any).image_url === 'string' && (req.body as any).image_url.trim().length > 0) {
        eventData.image_urls = [String((req.body as any).image_url)];
      } else {
        eventData.image_urls = [];
      }
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

// POST /api/events/:id/images - Adicionar imagens a um evento existente
router.post('/:id/images', uploadEventImages, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const files = req.files as any[];

    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'Nenhuma imagem fornecida' });
    }

    // Buscar evento existente
    const existingEvent = await EventRepository.findById(id);
    if (!existingEvent) {
      return res.status(404).json({ error: 'Evento não encontrado' });
    }

    // Upload das novas imagens
    const newImageUrls = await S3Service.uploadMultipleFiles(files, id);
    
    // Atualizar evento com novas imagens
    const updatedImageUrls = [...(existingEvent.image_urls || []), ...newImageUrls];
    
    const updatedEvent = await EventRepository.createOrUpdate({
      ...existingEvent,
      image_urls: updatedImageUrls,
      image_url: existingEvent.image_url || newImageUrls[0],
    });

    res.json({
      message: 'Imagens adicionadas com sucesso',
      event: updatedEvent,
      newImages: newImageUrls
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/events/:id/images - Remover imagem de um evento
router.delete('/:id/images', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ error: 'URL da imagem é obrigatória' });
    }

    // Buscar evento existente
    const existingEvent = await EventRepository.findById(id);
    if (!existingEvent) {
      return res.status(404).json({ error: 'Evento não encontrado' });
    }

    // Verificar se a imagem pertence ao evento
    if (!existingEvent.image_urls?.includes(imageUrl)) {
      return res.status(400).json({ error: 'Imagem não pertence a este evento' });
    }

    // Deletar imagem do S3
    await S3Service.deleteFile(imageUrl);

    // Atualizar evento removendo a imagem
    const updatedImageUrls = existingEvent.image_urls.filter(url => url !== imageUrl);
    const updatedImageUrl = updatedImageUrls.length > 0 ? updatedImageUrls[0] : '';

    const updatedEvent = await EventRepository.createOrUpdate({
      ...existingEvent,
      image_urls: updatedImageUrls,
      image_url: updatedImageUrl,
    });

    res.json({
      message: 'Imagem removida com sucesso',
      event: updatedEvent
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/events/:id - Deletar evento
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Buscar evento para deletar imagens do S3
    const existingEvent = await EventRepository.findById(id);
    if (existingEvent && existingEvent.image_urls) {
      // Deletar todas as imagens do S3
      const deletePromises = existingEvent.image_urls.map(url => S3Service.deleteFile(url));
      await Promise.all(deletePromises);
    }
    
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
