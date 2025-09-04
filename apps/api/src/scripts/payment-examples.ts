import { PaymentService } from '../services/PaymentService';
import { validateEnvironment } from '../db';

/**
 * Exemplos práticos de uso da API de pagamentos
 * Execute com: npm run db:payment-examples
 */

async function paymentExamples() {
  try {
    console.log('💳 Exemplos de uso da API de pagamentos\n');

    // Validar ambiente
    validateEnvironment();
    const paymentService = new PaymentService();

    if (!paymentService.isPagarmeConfigured()) {
      console.log('⚠️  Pagar.me não configurado. Execute os exemplos apenas para entender a estrutura.\n');
    }

    console.log('📋 Estrutura da API de Pagamentos:\n');

    // Exemplo 1: Criar pagamento PIX
    console.log('1️⃣ Criar Pagamento PIX');
    console.log('POST /api/payments/pix');
    console.log('Body:');
    console.log(JSON.stringify({
      userId: 'user-123',
      ticketId: 'ticket-456',
      eventId: 'event-789',
      amount: 5000, // R$ 50,00 (em centavos)
      customerName: 'João Silva',
      customerEmail: 'joao@email.com',
      customerDocument: '12345678901',
      eventName: 'Show de Rock'
    }, null, 2));
    console.log('\nResponse:');
    console.log(JSON.stringify({
      success: true,
      payment: {
        id: 'payment-uuid-123',
        status: 'waiting_payment',
        amount: 5000,
        pixQrCode: '00020126...',
        pixQrCodeBase64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...',
        expiresAt: '2024-01-15T10:00:00.000Z'
      },
      pixQrCode: '00020126...',
      pixQrCodeBase64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...',
      pixCopyPaste: '00020126...',
      expiresAt: '2024-01-15T10:00:00.000Z'
    }, null, 2));
    console.log('\n' + '='.repeat(80) + '\n');

    // Exemplo 2: Consultar status
    console.log('2️⃣ Consultar Status do Pagamento');
    console.log('GET /api/payments/payment-uuid-123/status');
    console.log('\nResponse:');
    console.log(JSON.stringify({
      success: true,
      payment: {
        id: 'payment-uuid-123',
        userId: 'user-123',
        ticketId: 'ticket-456',
        eventId: 'event-789',
        amount: 5000,
        status: 'paid',
        pixQrCode: '00020126...',
        pixQrCodeBase64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...',
        pixCopyPaste: '00020126...',
        pagarmeTransactionId: '12345',
        expiresAt: '2024-01-15T10:00:00.000Z',
        createdAt: '2024-01-15T09:00:00.000Z',
        updatedAt: '2024-01-15T09:30:00.000Z',
        metadata: {
          eventName: 'Show de Rock',
          customerName: 'João Silva',
          customerEmail: 'joao@email.com',
          customerDocument: '12345678901'
        }
      }
    }, null, 2));
    console.log('\n' + '='.repeat(80) + '\n');

    // Exemplo 3: Listar pagamentos do usuário
    console.log('3️⃣ Listar Pagamentos do Usuário');
    console.log('GET /api/payments/user/user-123');
    console.log('\nResponse:');
    console.log(JSON.stringify({
      success: true,
      payments: [
        {
          id: 'payment-uuid-123',
          status: 'paid',
          amount: 5000,
          eventName: 'Show de Rock',
          createdAt: '2024-01-15T09:00:00.000Z'
        },
        {
          id: 'payment-uuid-456',
          status: 'waiting_payment',
          amount: 3000,
          eventName: 'Teatro',
          createdAt: '2024-01-16T10:00:00.000Z'
        }
      ],
      count: 2
    }, null, 2));
    console.log('\n' + '='.repeat(80) + '\n');

    // Exemplo 4: Cancelar pagamento
    console.log('4️⃣ Cancelar Pagamento');
    console.log('DELETE /api/payments/payment-uuid-456');
    console.log('\nResponse:');
    console.log(JSON.stringify({
      success: true,
      message: 'Pagamento cancelado com sucesso',
      payment: {
        id: 'payment-uuid-456',
        status: 'cancelled',
        amount: 3000,
        updatedAt: '2024-01-16T11:00:00.000Z'
      }
    }, null, 2));
    console.log('\n' + '='.repeat(80) + '\n');

    // Exemplo 5: Health check
    console.log('5️⃣ Health Check do Serviço');
    console.log('GET /api/payments/health');
    console.log('\nResponse:');
    console.log(JSON.stringify({
      success: true,
      service: 'Payment Service',
      status: 'configured',
      pagarme: {
        configured: true,
        environment: 'sandbox'
      },
      timestamp: new Date().toISOString()
    }, null, 2));
    console.log('\n' + '='.repeat(80) + '\n');

    // Exemplo 6: Webhook (estrutura)
    console.log('6️⃣ Webhook do Pagar.me');
    console.log('POST /api/payments/webhook (chamado pelo Pagar.me)');
    console.log('\nPayload recebido:');
    console.log(JSON.stringify({
      type: 'order.paid',
      data: {
        id: 12345,
        status: 'paid',
        amount: 5000,
        payment_method: 'pix',
        created_at: '2024-01-15T09:30:00.000Z',
        updated_at: '2024-01-15T09:30:00.000Z',
        customer: {
          id: 67890,
          name: 'João Silva',
          email: 'joao@email.com',
          type: 'individual',
          document: '12345678901'
        },
        items: [
          {
            id: 'item-123',
            amount: 5000,
            description: 'Ingresso para Show de Rock',
            quantity: 1,
            code: 'ticket-456'
          }
        ],
        metadata: {
          paymentId: 'payment-uuid-123',
          ticketId: 'ticket-456',
          eventId: 'event-789',
          userId: 'user-123'
        }
      }
    }, null, 2));
    console.log('\n' + '='.repeat(80) + '\n');

    // Exemplo 7: Código de uso no aplicativo
    console.log('7️⃣ Código de Exemplo para o Aplicativo Mobile');
    console.log('\n// Criar pagamento');
    console.log('const createPayment = async (ticketData) => {');
    console.log('  try {');
    console.log('    const response = await fetch("/api/payments/pix", {');
    console.log('      method: "POST",');
    console.log('      headers: { "Content-Type": "application/json" },');
    console.log('      body: JSON.stringify(ticketData)');
    console.log('    });');
    console.log('    ');
    console.log('    const result = await response.json();');
    console.log('    ');
    console.log('    if (result.success) {');
    console.log('      // Exibir QR Code');
    console.log('      displayQRCode(result.pixQrCodeBase64);');
    console.log('      // Exibir código copia e cola');
    console.log('      displayCopyPaste(result.pixCopyPaste);');
    console.log('      // Iniciar verificação de status');
    console.log('      startStatusCheck(result.payment.id);');
    console.log('    }');
    console.log('  } catch (error) {');
    console.log('    console.error("Erro ao criar pagamento:", error);');
    console.log('  }');
    console.log('};');
    console.log('\n// Verificar status');
    console.log('const checkPaymentStatus = async (paymentId) => {');
    console.log('  try {');
    console.log('    const response = await fetch(`/api/payments/${paymentId}/status`);');
    console.log('    const result = await response.json();');
    console.log('    ');
    console.log('    if (result.success) {');
    console.log('      switch (result.payment.status) {');
    console.log('        case "paid":');
    console.log('          showSuccess("Pagamento aprovado! Ingresso liberado.");');
    console.log('          break;');
    console.log('        case "failed":');
    console.log('          showError("Pagamento falhou. Tente novamente.");');
    console.log('          break;');
    console.log('        case "waiting_payment":');
    console.log('          // Continuar aguardando');
    console.log('          break;');
    console.log('      }');
    console.log('    }');
    console.log('  } catch (error) {');
    console.log('    console.error("Erro ao verificar status:", error);');
    console.log('  }');
    console.log('};');

    console.log('\n🎉 Exemplos concluídos!');
    console.log('\n📚 Para mais informações, consulte o arquivo PAYMENTS_README.md');
    console.log('🧪 Para testar, execute: npm run test:payments');

  } catch (error) {
    console.error('❌ Erro durante os exemplos:', error);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  paymentExamples();
}

export { paymentExamples };
