import { Router, Request, Response } from 'express';
import { PaymentService } from '../services/PaymentService';
import { CreatePixPaymentRequest, AbacatePayWebhookPayload, PaymentStatus } from '../types/payment';

const router = Router();
const paymentService = new PaymentService();

/**
 * POST /payments/pix
 * Cria um novo pagamento PIX
 */
router.post('/pix', async (req: Request, res: Response) => {
  try {
    // Verificar se o AbacatePay está configurado
    if (!paymentService.isAbacatePayConfigured()) {
      return res.status(503).json({
        success: false,
        error: 'Serviço de pagamento não configurado',
        message: 'As credenciais do AbacatePay não estão configuradas'
      });
    }

    const request: CreatePixPaymentRequest = req.body;

    // Validar dados obrigatórios
    if (!request.userId || !request.ticketId || !request.eventId || !request.amount) {
      return res.status(400).json({
        success: false,
        error: 'Dados inválidos',
        message: 'userId, ticketId, eventId e amount são obrigatórios'
      });
    }

    // Criar pagamento PIX
    const result = await paymentService.createPixPayment(request);

    console.log(`Pagamento PIX criado com sucesso: ${result.payment.id}`);

    res.status(201).json(result);

  } catch (error) {
    console.error('Erro ao criar pagamento PIX:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Erro interno do servidor';
    
    res.status(500).json({
      success: false,
      error: 'Falha ao criar pagamento PIX',
      message: errorMessage
    });
  }
});

/**
 * POST /payments/webhook
 * Webhook do AbacatePay para notificações de status
 */
router.post('/webhook', async (req: Request, res: Response) => {
  try {
    const webhookPayload: AbacatePayWebhookPayload = req.body;

    // Log do webhook recebido
    console.log('Webhook recebido do AbacatePay:', {
      type: webhookPayload.type,
      billingId: webhookPayload.billing?.id,
      timestamp: new Date().toISOString(),
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    // Validar se é um webhook válido do AbacatePay
    if (!webhookPayload.type || !webhookPayload.billing) {
      console.warn('Webhook inválido recebido:', webhookPayload);
      return res.status(400).json({
        success: false,
        error: 'Webhook inválido',
        message: 'Formato do webhook não reconhecido'
      });
    }

    // Processar webhook
    await paymentService.processWebhook(webhookPayload);

    // Responder com sucesso
    res.status(200).json({
      success: true,
      message: 'Webhook processado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao processar webhook:', error);
    
    // Sempre retornar 200 para o AbacatePay, mesmo em caso de erro
    // O AbacatePay tentará reenviar o webhook se receber erro
    res.status(200).json({
      success: false,
      error: 'Erro interno ao processar webhook',
      message: 'Webhook será processado posteriormente'
    });
  }
});

/**
 * GET /payments/:id/status
 * Consulta status de um pagamento
 */
router.get('/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'ID do pagamento é obrigatório'
      });
    }

    const result = await paymentService.getPaymentStatus(id);

    res.status(200).json(result);

  } catch (error) {
    console.error('Erro ao consultar status do pagamento:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Erro interno do servidor';
    
    if (errorMessage.includes('não encontrado')) {
      return res.status(404).json({
        success: false,
        error: 'Pagamento não encontrado',
        message: errorMessage
      });
    }

    res.status(500).json({
      success: false,
      error: 'Falha ao consultar status do pagamento',
      message: errorMessage
    });
  }
});

/**
 * GET /payments/user/:userId
 * Lista pagamentos de um usuário
 */
router.get('/user/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'ID do usuário é obrigatório'
      });
    }

    const payments = await paymentService.getUserPayments(userId);

    res.status(200).json({
      success: true,
      payments,
      count: payments.length
    });

  } catch (error) {
    console.error('Erro ao buscar pagamentos do usuário:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Erro interno do servidor';
    
    res.status(500).json({
      success: false,
      error: 'Falha ao buscar pagamentos do usuário',
      message: errorMessage
    });
  }
});

/**
 * DELETE /payments/:id
 * Cancela um pagamento
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'ID do pagamento é obrigatório'
      });
    }

    const cancelledPayment = await paymentService.cancelPayment(id);

    console.log(`Pagamento cancelado com sucesso: ${id}`);

    res.status(200).json({
      success: true,
      message: 'Pagamento cancelado com sucesso',
      payment: cancelledPayment
    });

  } catch (error) {
    console.error('Erro ao cancelar pagamento:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Erro interno do servidor';
    
    if (errorMessage.includes('não encontrado')) {
      return res.status(404).json({
        success: false,
        error: 'Pagamento não encontrado',
        message: errorMessage
      });
    }

    if (errorMessage.includes('já foi cancelado') || errorMessage.includes('já aprovado')) {
      return res.status(400).json({
        success: false,
        error: 'Operação não permitida',
        message: errorMessage
      });
    }

    res.status(500).json({
      success: false,
      error: 'Falha ao cancelar pagamento',
      message: errorMessage
    });
  }
});

/**
 * POST /payments/:id/confirm
 * Endpoint para confirmar manualmente um pagamento (útil para desenvolvimento/testes)
 * ATENÇÃO: Em produção, isso deve ser feito apenas via webhook do AbacatePay
 */
router.post('/:id/confirm', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'ID do pagamento é obrigatório'
      });
    }

    // Apenas permitir em desenvolvimento
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({
        success: false,
        error: 'Operação não permitida em produção',
        message: 'Use webhooks do AbacatePay para confirmar pagamentos em produção'
      });
    }

    const payment = await paymentService.getPaymentStatus(id);
    
    if (payment.payment.status === PaymentStatus.PAID) {
      return res.status(200).json({
        success: true,
        message: 'Pagamento já está confirmado',
        payment: payment.payment
      });
    }

    // Atualizar status para pago manualmente
    const updatedPayment = await paymentService.updatePaymentStatusManually(id, PaymentStatus.PAID);

    console.log(`⚠️ Pagamento ${id} confirmado manualmente (apenas para desenvolvimento)`);

    res.status(200).json({
      success: true,
      message: 'Pagamento confirmado manualmente',
      payment: updatedPayment,
      warning: 'Esta é uma confirmação manual. Em produção, use webhooks.'
    });

  } catch (error) {
    console.error('Erro ao confirmar pagamento manualmente:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Erro interno do servidor';
    
    if (errorMessage.includes('não encontrado')) {
      return res.status(404).json({
        success: false,
        error: 'Pagamento não encontrado',
        message: errorMessage
      });
    }

    res.status(500).json({
      success: false,
      error: 'Falha ao confirmar pagamento',
      message: errorMessage
    });
  }
});

/**
 * GET /payments/health
 * Verifica saúde do serviço de pagamento
 */
router.get('/health', (req: Request, res: Response) => {
  const isConfigured = paymentService.isAbacatePayConfigured();
  
  res.status(200).json({
    success: true,
    service: 'Payment Service',
    status: isConfigured ? 'configured' : 'not_configured',
    abacatePay: {
      configured: isConfigured,
      apiKeySet: !!process.env.ABACATEPAY_API_KEY
    },
    timestamp: new Date().toISOString()
  });
});

export default router;
