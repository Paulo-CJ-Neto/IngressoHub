import { UserRepository } from '../repositories/UserRepository';
import { TicketRepository } from '../repositories/TicketRepository';
import { EventRepository } from '../repositories/EventRepository';

/**
 * Exemplos específicos para User e Ticket
 * Este arquivo demonstra operações específicas dos novos repositórios
 */

// ===== EXEMPLOS DE USUÁRIO =====

export async function userExamples() {
  console.log('\n👤 === EXEMPLOS DE USUÁRIO ===\n');

  try {
    // 1. Criar usuário
    const user = {
      id: `user_${Date.now()}`,
      email: `usuario${Date.now()}@exemplo.com`,
      full_name: 'Ana Paula Santos',
      avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      created_at: new Date().toISOString(),
      user_type: 'client' as const
    };

    const createdUser = await UserRepository.createOrUpdate(user);
    console.log('✅ Usuário criado:', createdUser);

    // 2. Buscar por email
    const foundUser = await UserRepository.findByEmail(createdUser.email);
    console.log('✅ Usuário encontrado por email:', foundUser);

    // 3. Atualizar usuário
    const updatedUser = await UserRepository.update(createdUser.id, {
      full_name: 'Ana Paula Santos Silva',
      avatar_url: 'https://example.com/new-avatar.jpg'
    });
    console.log('✅ Usuário atualizado:', updatedUser);

    // 4. Verificar se email existe
    const emailExists = await UserRepository.emailExists(createdUser.email);
    console.log('✅ Email existe:', emailExists);

    // 5. Buscar por nome
    const usersByName = await UserRepository.searchByName('Ana');
    console.log('✅ Usuários encontrados por nome:', usersByName);

    // 6. Deletar usuário
    const deleted = await UserRepository.delete(createdUser.id);
    console.log('✅ Usuário deletado:', deleted);

    return createdUser;
  } catch (error) {
    console.error('❌ Erro nos exemplos de usuário:', error);
    throw error;
  }
}

// ===== EXEMPLOS DE INGRESSO =====

export async function ticketExamples() {
  console.log('\n🎟️ === EXEMPLOS DE INGRESSO ===\n');

  try {
    // 1. Criar um evento primeiro (necessário para o ingresso)
    const event = {
      id: `event_${Date.now()}`,
      name: 'Show de Teste para Ingressos',
      date: new Date('2024-12-30T20:00:00').toISOString(),
      location: 'Arena de Teste',
      producer_id: 'producer_example',
      price: 100.00,
      max_tickets: 500,
      sold_tickets: 0,
      status: 'active' as const,
      description: 'Evento para testar o sistema de ingressos'
    };

    const createdEvent = await EventRepository.createOrUpdate(event);
    console.log('✅ Evento criado para teste:', createdEvent);

    // 2. Criar ingresso
    const ticket = {
      id: `ticket_${Date.now()}`,
      event_id: createdEvent.id,
      buyer_name: 'Carlos Eduardo',
      buyer_cpf: '987.654.321-00',
      buyer_email: 'carlos@exemplo.com',
      quantity: 3,
      total_price: 300.00,
      qr_code: await TicketRepository.generateUniqueQrCode(),
      status: 'valid' as const,
      created_at: new Date().toISOString()
    };

    const createdTicket = await TicketRepository.createOrUpdate(ticket);
    console.log('✅ Ingresso criado:', createdTicket);

    // 3. Buscar por QR Code
    const ticketByQr = await TicketRepository.findByQrCode(createdTicket.qr_code);
    console.log('✅ Ingresso encontrado por QR Code:', ticketByQr);

    // 4. Buscar por evento
    const ticketsByEvent = await TicketRepository.findByEventId(createdEvent.id);
    console.log('✅ Ingressos do evento:', ticketsByEvent);

    // 5. Buscar por comprador
    const ticketsByBuyer = await TicketRepository.findByBuyerEmail(createdTicket.buyer_email);
    console.log('✅ Ingressos do comprador:', ticketsByBuyer);

    // 6. Buscar por status
    const validTickets = await TicketRepository.findByStatus('valid');
    console.log('✅ Ingressos válidos:', validTickets);

    // 7. Validar ingresso
    const validatedTicket = await TicketRepository.validateTicket(createdTicket.id);
    console.log('✅ Ingresso validado:', validatedTicket);

    // 8. Estatísticas do evento
    const stats = await TicketRepository.getEventTicketStats(createdEvent.id);
    console.log('✅ Estatísticas do evento:', stats);

    // 9. Buscar por CPF
    const ticketsByCpf = await TicketRepository.findByBuyerCpf(createdTicket.buyer_cpf);
    console.log('✅ Ingressos por CPF:', ticketsByCpf);

    // 10. Deletar ingresso
    const deletedTicket = await TicketRepository.delete(createdTicket.id);
    console.log('✅ Ingresso deletado:', deletedTicket);

    // 11. Deletar evento
    const deletedEvent = await EventRepository.delete(createdEvent.id);
    console.log('✅ Evento deletado:', deletedEvent);

    return createdTicket;
  } catch (error) {
    console.error('❌ Erro nos exemplos de ingresso:', error);
    throw error;
  }
}

// ===== EXEMPLOS DE INTEGRAÇÃO =====

export async function integrationExamples() {
  console.log('\n🔗 === EXEMPLOS DE INTEGRAÇÃO ===\n');

  try {
    // 1. Criar usuário
    const user = await userExamples();
    
    // 2. Criar evento
    const event = {
      id: `event_${Date.now()}`,
      name: 'Festival de Integração',
      date: new Date('2024-12-31T22:00:00').toISOString(),
      location: 'Parque de Integração',
      producer_id: 'producer_example',
      price: 150.00,
      max_tickets: 1000,
      sold_tickets: 0,
      status: 'active' as const,
      description: 'Evento para testar integração entre entidades'
    };

    const createdEvent = await EventRepository.createOrUpdate(event);
    console.log('✅ Evento criado para integração:', createdEvent);

    // 3. Criar múltiplos ingressos para o usuário
    const tickets = [];
    for (let i = 0; i < 3; i++) {
      const ticket = {
        id: `ticket_${Date.now()}_${i}`,
        event_id: createdEvent.id,
        buyer_name: user.full_name,
        buyer_cpf: '111.222.333-44',
        buyer_email: user.email,
        quantity: 1,
        total_price: event.price,
        qr_code: await TicketRepository.generateUniqueQrCode(),
        status: 'valid' as const,
        created_at: new Date().toISOString()
      };

      const createdTicket = await TicketRepository.createOrUpdate(ticket);
      tickets.push(createdTicket);
      console.log(`✅ Ingresso ${i + 1} criado:`, createdTicket.id);
    }

    // 4. Atualizar contador de ingressos vendidos no evento
    const updatedEvent = await EventRepository.incrementSoldTickets(createdEvent.id, tickets.length);
    console.log('✅ Evento atualizado com ingressos vendidos:', updatedEvent);

    // 5. Obter estatísticas completas
    const eventStats = await TicketRepository.getEventTicketStats(createdEvent.id);
    console.log('✅ Estatísticas finais do evento:', eventStats);

    // 6. Limpeza
    for (const ticket of tickets) {
      await TicketRepository.delete(ticket.id);
    }
    await EventRepository.delete(createdEvent.id);
    await UserRepository.delete(user.id);

    console.log('✅ Limpeza concluída');

    return { user, event, tickets };
  } catch (error) {
    console.error('❌ Erro nos exemplos de integração:', error);
    throw error;
  }
}

// Função principal para executar todos os exemplos
export async function runAllUserTicketExamples() {
  console.log('🚀 Executando exemplos de User e Ticket...\n');

  try {
    await userExamples();
    await ticketExamples();
    await integrationExamples();
    
    console.log('\n🎉 Todos os exemplos de User e Ticket executados com sucesso!');
  } catch (error) {
    console.error('\n💥 Erro durante execução dos exemplos:', error);
  }
}

// Executar se o arquivo for executado diretamente
if (require.main === module) {
  runAllUserTicketExamples()
    .then(() => {
      console.log('🎯 Exemplos concluídos!');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Falha nos exemplos:', error);
      process.exit(1);
    });
}
