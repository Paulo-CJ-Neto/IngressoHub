import { Router, Request, Response } from 'express';
import { TicketValidationService } from '../services';

const router = Router();

// POST /api/validate-ticket
router.post('/', async (req: Request, res: Response) => {
  try {
    const { ticket_id, event_id } = req.body as { ticket_id?: string; event_id?: string };

    if (!ticket_id || !event_id) {
      return res.status(400).json({ error: 'ticket_id e event_id são obrigatórios' });
    }

    const result = await TicketValidationService.validateByIds({ ticket_id, event_id });
    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({ error: error?.message || 'Erro ao validar ticket' });
  }
});

export default router;


