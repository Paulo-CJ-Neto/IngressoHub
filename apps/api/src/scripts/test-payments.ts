import { PaymentService } from '../services/PaymentService';
import { validateEnvironment } from '../db';

/**
 * Script de teste para a integração de pagamentos
 * Execute com: npm run test:payments
 */

async function testPayments() {
  try {
    console.log('🧪 Iniciando testes da integração de pagamentos...\n');

    // Validar ambiente
    console.log('1️⃣ Validando variáveis de ambiente...');
    validateEnvironment();
    console.log('✅ Variáveis de ambiente validadas\n');

    // Testar serviço de pagamento
    console.log('2️⃣ Testando serviço de pagamento...');
    const paymentService = new PaymentService();
    
    // Verificar configuração do Pagar.me
    const isConfigured = paymentService.isPagarmeConfigured();
    console.log(`   Pagar.me configurado: ${isConfigured ? '✅ Sim' : '❌ Não'}`);
    
    if (!isConfigured) {
      console.log('   ⚠️  Configure as variáveis do Pagar.me para testes completos');
      console.log('   📝 Adicione ao .env: PAGARME_API_KEY, PAGARME_ENCRYPTION_KEY, PAGARME_WEBHOOK_SECRET');
    }

    // Testar criação de pagamento (simulado)
    console.log('\n3️⃣ Testando criação de pagamento (simulado)...');
    
    const mockRequest = {
      userId: 'test-user-123',
      ticketId: 'test-ticket-456',
      eventId: 'test-event-789',
      amount: 5000, // R$ 50,00
      customerName: 'Usuário Teste',
      customerEmail: 'teste@email.com',
      customerDocument: '12345678901',
      eventName: 'Evento de Teste'
    };

    console.log('   Dados de teste:', JSON.stringify(mockRequest, null, 2));

    if (isConfigured) {
      try {
        console.log('\n   🔄 Tentando criar pagamento real...');
        const result = await paymentService.createPixPayment(mockRequest);
        console.log('   ✅ Pagamento criado com sucesso!');
        console.log('   📊 ID do pagamento:', result.payment.id);
        console.log('   💰 Valor:', result.payment.amount);
        console.log('   📱 QR Code gerado:', result.pixQrCode ? '✅ Sim' : '❌ Não');
        console.log('   📋 Código copia e cola:', result.pixCopyPaste ? '✅ Sim' : '❌ Não');
        console.log('   ⏰ Expira em:', result.expiresAt);
        
        // Testar consulta de status
        console.log('\n   🔍 Testando consulta de status...');
        const statusResult = await paymentService.getPaymentStatus(result.payment.id);
        console.log('   ✅ Status consultado:', statusResult.payment.status);
        
        // Testar busca por usuário
        console.log('\n   👤 Testando busca por usuário...');
        const userPayments = await paymentService.getUserPayments(mockRequest.userId);
        console.log('   ✅ Pagamentos do usuário encontrados:', userPayments.length);
        
      } catch (error) {
        console.log('   ❌ Erro ao criar pagamento real:', error instanceof Error ? error.message : 'Erro desconhecido');
        console.log('   💡 Verifique as credenciais do Pagar.me');
      }
    } else {
      console.log('   ⏭️  Pulando teste real (Pagar.me não configurado)');
    }

    // Testar validações
    console.log('\n4️⃣ Testando validações...');
    
    const invalidRequests = [
      {
        name: 'Sem userId',
        data: { ...mockRequest, userId: '' }
      },
      {
        name: 'Sem amount',
        data: { ...mockRequest, amount: 0 }
      },
      {
        name: 'Email inválido',
        data: { ...mockRequest, customerEmail: 'email-invalido' }
      },
      {
        name: 'Documento inválido',
        data: { ...mockRequest, customerDocument: '123' }
      }
    ];

    for (const test of invalidRequests) {
      try {
        await paymentService.createPixPayment(test.data as any);
        console.log(`   ❌ ${test.name}: Deveria ter falhado`);
      } catch (error) {
        console.log(`   ✅ ${test.name}: Validação funcionou (${error instanceof Error ? error.message : 'Erro'})`);
      }
    }

    console.log('\n🎉 Testes concluídos!');
    
    if (isConfigured) {
      console.log('\n📱 Para testar no aplicativo:');
      console.log('   1. Use o endpoint POST /api/payments/pix');
      console.log('   2. Exiba o QR Code (pixQrCodeBase64)');
      console.log('   3. Use o endpoint GET /api/payments/:id/status para verificar');
      console.log('   4. Configure o webhook no Pagar.me para /api/payments/webhook');
    } else {
      console.log('\n⚙️  Para configurar o Pagar.me:');
      console.log('   1. Crie uma conta em https://sandbox.pagar.me/');
      console.log('   2. Obtenha suas credenciais de sandbox');
      console.log('   3. Adicione ao arquivo .env');
      console.log('   4. Execute este teste novamente');
    }

  } catch (error) {
    console.error('❌ Erro durante os testes:', error);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  testPayments();
}

export { testPayments };
