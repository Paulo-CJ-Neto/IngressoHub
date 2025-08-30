// Exemplos de uso dos serviços de API
// Este arquivo pode ser usado para testar a integração

import { eventsService, ticketsService, usersService } from './index';

export const testApiIntegration = async () => {
  console.log('🧪 Testando integração com a API...');

  try {
    // Teste 1: Buscar eventos ativos
    console.log('📅 Buscando eventos ativos...');
    const events = await eventsService.getActiveEvents();
    console.log(`✅ Encontrados ${events.length} eventos ativos`);

    if (events.length > 0) {
      const firstEvent = events[0];
      console.log(`📋 Primeiro evento: ${firstEvent.name}`);

      // Teste 2: Buscar detalhes do evento
      console.log('🔍 Buscando detalhes do evento...');
      const eventDetails = await eventsService.getEventById(firstEvent.id);
      console.log(`✅ Evento encontrado: ${eventDetails.name}`);

      // Teste 3: Buscar tickets do evento
      console.log('🎫 Buscando tickets do evento...');
      const eventTickets = await ticketsService.getTicketsByEvent(firstEvent.id);
      console.log(`✅ Encontrados ${eventTickets.length} tickets para o evento`);

      // Teste 4: Buscar usuários
      console.log('👥 Buscando usuários...');
      const users = await usersService.getAllUsers();
      console.log(`✅ Encontrados ${users.length} usuários`);

      if (users.length > 0) {
        const firstUser = users[0];
        
        // Teste 5: Buscar tickets do usuário
        console.log('🎫 Buscando tickets do usuário...');
        const userTickets = await ticketsService.getTicketsByBuyerEmail(firstUser.email);
        console.log(`✅ Encontrados ${userTickets.length} tickets do usuário`);

        if (userTickets.length > 0) {
          const firstTicket = userTickets[0];
          
          // Teste 6: Buscar ticket por QR Code
          console.log('🔍 Buscando ticket por QR Code...');
          const ticketByQr = await ticketsService.getTicketByQrCode(firstTicket.qr_code);
          console.log(`✅ Ticket encontrado: ${ticketByQr.id}`);
        }
      }
    }

    console.log('🎉 Todos os testes passaram!');
    return true;
  } catch (error) {
    console.error('❌ Erro nos testes:', error);
    return false;
  }
};

// Exemplo de criação de dados de teste
export const createTestData = async () => {
  console.log('🛠️ Criando dados de teste...');

  try {
    // Criar evento de teste
    const testEvent = await eventsService.createEvent({
      name: 'Show de Teste',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 dias no futuro
      location: 'Arena de Teste',
      price: 50.00,
      description: 'Evento criado para testes da API',
      max_tickets: 100,
      status: 'active'
    });
    console.log(`✅ Evento criado: ${testEvent.name}`);

    // Criar usuário de teste
    const testUser = await usersService.createUser({
      email: 'teste@exemplo.com',
      full_name: 'Usuário de Teste'
    });
    console.log(`✅ Usuário criado: ${testUser.full_name}`);

    // Criar ticket de teste
    const testTicket = await ticketsService.createTicket({
      event_id: testEvent.id,
      buyer_name: testUser.full_name,
      buyer_email: testUser.email,
      buyer_cpf: '12345678901',
      quantity: 1,
      total_price: testEvent.price,
      status: 'valid'
    });
    console.log(`✅ Ticket criado: ${testTicket.id}`);

    console.log('🎉 Dados de teste criados com sucesso!');
    return { event: testEvent, user: testUser, ticket: testTicket };
  } catch (error) {
    console.error('❌ Erro ao criar dados de teste:', error);
    throw error;
  }
};

// Exemplo de limpeza de dados de teste
export const cleanupTestData = async (testData: any) => {
  console.log('🧹 Limpando dados de teste...');

  try {
    if (testData.ticket) {
      await ticketsService.deleteTicket(testData.ticket.id);
      console.log('✅ Ticket de teste removido');
    }

    if (testData.user) {
      await usersService.deleteUser(testData.user.id);
      console.log('✅ Usuário de teste removido');
    }

    if (testData.event) {
      await eventsService.deleteEvent(testData.event.id);
      console.log('✅ Evento de teste removido');
    }

    console.log('🎉 Dados de teste limpos com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao limpar dados de teste:', error);
  }
};

// Exemplo de uso completo
export const runFullTest = async () => {
  console.log('🚀 Iniciando teste completo da API...');

  let testData = null;

  try {
    // Teste 1: Verificar integração básica
    const integrationOk = await testApiIntegration();
    if (!integrationOk) {
      throw new Error('Falha na integração básica');
    }

    // Teste 2: Criar dados de teste
    testData = await createTestData();

    // Teste 3: Verificar se os dados foram criados
    const createdEvent = await eventsService.getEventById(testData.event.id);
    const createdUser = await usersService.getUserByEmail(testData.user.email);
    const createdTicket = await ticketsService.getTicketById(testData.ticket.id);

    console.log('✅ Todos os dados foram criados corretamente');

    // Teste 4: Testar validação de ticket
    const validatedTicket = await ticketsService.validateTicket(createdTicket.id);
    console.log(`✅ Ticket validado: ${validatedTicket.status}`);

    console.log('🎉 Teste completo executado com sucesso!');
    return true;
  } catch (error) {
    console.error('❌ Erro no teste completo:', error);
    return false;
  } finally {
    // Limpar dados de teste
    if (testData) {
      await cleanupTestData(testData);
    }
  }
};
