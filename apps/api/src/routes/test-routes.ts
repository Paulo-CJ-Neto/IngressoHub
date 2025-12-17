import { EventRepository } from '../db/repositories/EventRepository';
import { UserRepository } from '../db/repositories/UserRepository';
import { TicketRepository } from '../db/repositories/TicketRepository';

/**
 * Script para testar as rotas da API
 * Este arquivo demonstra como usar os repositórios que as rotas utilizam
 */

export async function testRoutes() {
  console.log('🧪 Testando funcionalidades das rotas...\n');

  try {
    // 1. Testar criação de usuário
    console.log('👤 1. Testando criação de usuário...');
    const user = {
      id: `user_test_${Date.now()}`,
      email: `teste${Date.now()}@exemplo.com`,
      full_name: 'Usuário de Teste',
      avatar_url: 'https://example.com/avatar.jpg',
      created_at: new Date().toISOString(),
      user_type: 'client' as const
    };

    const createdUser = await UserRepository.createOrUpdate(user);
    console.log('✅ Usuário criado:', createdUser.id);

    // 2. Testar criação de evento
    console.log('\n🎫 2. Testando criação de evento...');
    const event = {
      id: `event_test_${Date.now()}`,
      name: 'Evento de Teste',
      date: new Date('2024-12-31T20:00:00').toISOString(),
      location: 'Local de Teste',
      producer_id: 'producer_example',
      price: 100.00,
      max_tickets: 500,
      sold_tickets: 0,
      status: 'active' as const,
      description: 'Evento para testar as rotas'
    };

    const createdEvent = await EventRepository.createOrUpdate(event);
    console.log('✅ Evento criado:', createdEvent.id);

    // 3. Testar criação de ingresso
    console.log('\n🎟️ 3. Testando criação de ingresso...');
    const ticket = {
      id: `ticket_test_${Date.now()}`,
      event_id: createdEvent.id,
      buyer_name: createdUser.full_name,
      buyer_cpf: '123.456.789-00',
      buyer_email: createdUser.email,
      quantity: 2,
      total_price: 200.00,
      qr_code: await TicketRepository.generateUniqueQrCode(),
      status: 'valid' as const,
      created_at: new Date().toISOString()
    };

    const createdTicket = await TicketRepository.createOrUpdate(ticket);
    console.log('✅ Ingresso criado:', createdTicket.id);

    // 4. Testar operações de busca
    console.log('\n🔍 4. Testando operações de busca...');
    
    // Buscar usuário por email
    const foundUser = await UserRepository.findByEmail(createdUser.email);
    console.log('✅ Usuário encontrado por email:', foundUser?.id);

    // Buscar evento por ID
    const foundEvent = await EventRepository.findById(createdEvent.id);
    console.log('✅ Evento encontrado por ID:', foundEvent?.id);

    // Buscar ingresso por QR Code
    const foundTicket = await TicketRepository.findByQrCode(createdTicket.qr_code);
    console.log('✅ Ingresso encontrado por QR Code:', foundTicket?.id);

    // 5. Testar operações de atualização
    console.log('\n✏️ 5. Testando operações de atualização...');
    
    // Atualizar usuário
    const updatedUser = await UserRepository.update(createdUser.id, {
      full_name: 'Usuário de Teste Atualizado'
    });
    console.log('✅ Usuário atualizado:', updatedUser?.full_name);

    // Atualizar evento
    const updatedEvent = await EventRepository.update(createdEvent.id, {
      price: 150.00
    });
    console.log('✅ Evento atualizado, novo preço:', updatedEvent?.price);

    // 6. Testar operações específicas
    console.log('\n🎯 6. Testando operações específicas...');
    
    // Buscar ingressos por evento
    const eventTickets = await TicketRepository.findByEventId(createdEvent.id);
    console.log('✅ Ingressos do evento:', eventTickets.length);

    // Buscar ingressos por comprador
    const buyerTickets = await TicketRepository.findByBuyerEmail(createdUser.email);
    console.log('✅ Ingressos do comprador:', buyerTickets.length);

    // Estatísticas do evento
    const eventStats = await TicketRepository.getEventTicketStats(createdEvent.id);
    console.log('✅ Estatísticas do evento:', eventStats);

    // 7. Testar operações de negócio
    console.log('\n💼 7. Testando operações de negócio...');
    
    // Validar ingresso
    const validatedTicket = await TicketRepository.validateTicket(createdTicket.id);
    console.log('✅ Ingresso validado, status:', validatedTicket?.status);

    // Incrementar ingressos vendidos no evento
    const updatedEventWithSales = await EventRepository.incrementSoldTickets(createdEvent.id, 1);
    console.log('✅ Evento com vendas atualizado:', updatedEventWithSales?.sold_tickets);

    // 8. Limpeza
    console.log('\n🧹 8. Fazendo limpeza...');
    
    await TicketRepository.delete(createdTicket.id);
    console.log('✅ Ingresso deletado');
    
    await EventRepository.delete(createdEvent.id);
    console.log('✅ Evento deletado');
    
    await UserRepository.delete(createdUser.id);
    console.log('✅ Usuário deletado');

    console.log('\n🎉 Todos os testes das rotas passaram com sucesso!');
    
  } catch (error) {
    console.error('\n💥 Erro durante os testes:', error);
    throw error;
  }
}

// Executar se o arquivo for executado diretamente
if (require.main === module) {
  testRoutes()
    .then(() => {
      console.log('🎯 Testes concluídos!');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Falha nos testes:', error);
      process.exit(1);
    });
}
