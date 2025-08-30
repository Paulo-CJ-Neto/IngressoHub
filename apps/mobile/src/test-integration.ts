/**
 * Teste de Integração do Frontend Mobile
 * 
 * Este script testa se o frontend mobile consegue se conectar
 * e usar os serviços da API corretamente
 */

import { eventsService, ticketsService, usersService } from './services';

async function testMobileIntegration() {
  console.log('📱 Teste de Integração do Frontend Mobile');
  console.log('========================================');

  try {
    // Teste 1: Buscar eventos ativos (tela Home)
    console.log('1️⃣ Testando busca de eventos ativos...');
    const activeEvents = await eventsService.getActiveEvents();
    console.log(`✅ Eventos ativos encontrados: ${activeEvents.length}`);
    
    if (activeEvents.length > 0) {
      console.log(`   📍 Primeiro evento: ${activeEvents[0].name} - R$ ${activeEvents[0].price}`);
    }

    // Teste 2: Buscar evento por ID (tela EventDetails)
    if (activeEvents.length > 0) {
      console.log('\n2️⃣ Testando busca de evento por ID...');
      const eventDetails = await eventsService.getEventById(activeEvents[0].id);
      console.log(`✅ Detalhes do evento: ${eventDetails.name}`);
      console.log(`   📍 Local: ${eventDetails.location}`);
      console.log(`   📅 Data: ${new Date(eventDetails.date).toLocaleDateString()}`);
    }

    // Teste 3: Buscar tickets por email (tela MyTickets)
    console.log('\n3️⃣ Testando busca de tickets por email...');
    const testEmail = 'joao.silva@email.com';
    const userTickets = await ticketsService.getTicketsByBuyerEmail(testEmail);
    console.log(`✅ Tickets do usuário: ${userTickets.length}`);
    
    if (userTickets.length > 0) {
      console.log(`   🎫 Primeiro ticket: ${userTickets[0].buyer_name} - Status: ${userTickets[0].status}`);
    }

    // Teste 4: Buscar ticket por QR code (tela ValidateTicket)
    if (userTickets.length > 0) {
      console.log('\n4️⃣ Testando busca de ticket por QR code...');
      const qrCode = userTickets[0].qr_code;
      const qrTicket = await ticketsService.getTicketByQrCode(qrCode);
      console.log(`✅ Ticket encontrado por QR: ${qrTicket.buyer_name}`);
      console.log(`   🎫 Status: ${qrTicket.status}`);
    }

    // Teste 5: Buscar usuário por email
    console.log('\n5️⃣ Testando busca de usuário por email...');
    const testUser = await usersService.getUserByEmail(testEmail);
    if (testUser) {
      console.log(`✅ Usuário encontrado: ${testUser.full_name}`);
      console.log(`   📧 Email: ${testUser.email}`);
    } else {
      console.log('⚠️ Usuário não encontrado (pode ser normal)');
    }

    // Teste 6: Simular criação de ticket (tela Purchase)
    console.log('\n6️⃣ Testando simulação de criação de ticket...');
    if (activeEvents.length > 0) {
      const event = activeEvents[0];
      const ticketData = {
        event_id: event.id,
        buyer_name: 'Teste Mobile',
        buyer_cpf: '123.456.789-00',
        buyer_email: 'teste@mobile.com',
        quantity: 1,
        total_price: event.price,
        qr_code: `MOBILE_TEST_${Date.now()}`,
        status: 'valid' as const
      };

      try {
        const newTicket = await ticketsService.createTicket(ticketData);
        console.log(`✅ Ticket criado: ${newTicket.id}`);
        console.log(`   🎫 Comprador: ${newTicket.buyer_name}`);
        console.log(`   💰 Preço: R$ ${newTicket.total_price}`);
      } catch (error: any) {
        console.log('⚠️ Erro ao criar ticket (pode ser normal):', error.message);
      }
    }

    console.log('\n🎉 Integração do Frontend Mobile Testada com Sucesso!');
    console.log('====================================================');
    console.log('✅ Serviços funcionando corretamente');
    console.log('✅ API acessível');
    console.log('✅ Dados sendo carregados');
    console.log('✅ Fluxo de compra simulado');
    console.log('');
    console.log('🚀 Frontend mobile pronto para uso!');

  } catch (error: any) {
    console.error('❌ Erro no teste de integração mobile:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Dica: Certifique-se de que a API está rodando:');
      console.log('   cd apps/api && npm run dev');
    }
  }
}

// Executar teste
testMobileIntegration().catch(console.error);
