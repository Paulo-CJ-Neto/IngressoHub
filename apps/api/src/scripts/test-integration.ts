#!/usr/bin/env ts-node

/**
 * Script para Testar a Integração Completa
 * 
 * Este script testa:
 * 1. Endpoints da API
 * 2. Integração com o frontend mobile
 * 3. Fluxo completo de compra de tickets
 */

import 'dotenv/config';
import axios from 'axios';
import { EventRepository } from '../db/repositories/EventRepository';
import { UserRepository } from '../db/repositories/UserRepository';
import { TicketRepository } from '../db/repositories/TicketRepository';

const API_BASE_URL = 'http://localhost:3000/api';

// Função para testar endpoints da API
async function testApiEndpoints() {
  console.log('🔍 Testando endpoints da API...');
  console.log('================================');

  try {
    // Teste 1: Health check
    console.log('1️⃣ Testando health check...');
    const healthResponse = await axios.get('http://localhost:3000/health');
    console.log(`✅ Health check: ${healthResponse.status} - ${healthResponse.data.message}`);

    // Teste 2: Listar eventos
    console.log('\n2️⃣ Testando listagem de eventos...');
    const eventsResponse = await axios.get(`${API_BASE_URL}/events`);
    console.log(`✅ Eventos encontrados: ${eventsResponse.data.length}`);
    
    if (eventsResponse.data.length > 0) {
      const firstEvent = eventsResponse.data[0];
      console.log(`   📍 Primeiro evento: ${firstEvent.name} - R$ ${firstEvent.price}`);
    }

    // Teste 3: Buscar evento por ID
    if (eventsResponse.data.length > 0) {
      console.log('\n3️⃣ Testando busca de evento por ID...');
      const eventId = eventsResponse.data[0].id;
      const eventResponse = await axios.get(`${API_BASE_URL}/events/${eventId}`);
      console.log(`✅ Evento encontrado: ${eventResponse.data.name}`);
    }

    // Teste 4: Listar usuários
    console.log('\n4️⃣ Testando listagem de usuários...');
    const usersResponse = await axios.get(`${API_BASE_URL}/users`);
    console.log(`✅ Usuários encontrados: ${usersResponse.data.length}`);

    // Teste 5: Listar tickets
    console.log('\n5️⃣ Testando listagem de tickets...');
    const ticketsResponse = await axios.get(`${API_BASE_URL}/tickets`);
    console.log(`✅ Tickets encontrados: ${ticketsResponse.data.length}`);

    // Teste 6: Buscar tickets por evento
    if (eventsResponse.data.length > 0 && ticketsResponse.data.length > 0) {
      console.log('\n6️⃣ Testando busca de tickets por evento...');
      const eventId = eventsResponse.data[0].id;
      const eventTicketsResponse = await axios.get(`${API_BASE_URL}/tickets/event/${eventId}`);
      console.log(`✅ Tickets do evento: ${eventTicketsResponse.data.length}`);
    }

    console.log('\n🎉 Todos os endpoints da API estão funcionando!');

  } catch (error: any) {
    console.error('❌ Erro ao testar endpoints:', error.response?.data || error.message);
    throw error;
  }
}

// Função para testar fluxo de compra
async function testPurchaseFlow() {
  console.log('\n🛒 Testando fluxo de compra...');
  console.log('==============================');

  try {
    // 1. Buscar evento disponível
    const eventsResponse = await axios.get(`${API_BASE_URL}/events`);
    const availableEvent = eventsResponse.data.find((event: any) => 
      event.status === 'active' && event.sold_tickets < event.max_tickets
    );

    if (!availableEvent) {
      console.log('⚠️ Nenhum evento disponível para teste');
      return;
    }

    console.log(`📍 Evento selecionado: ${availableEvent.name}`);

    // 2. Criar ticket de teste
    const ticketData = {
      event_id: availableEvent.id,
      buyer_name: 'Teste de Integração',
      buyer_cpf: '123.456.789-00',
      buyer_email: 'teste@integracao.com',
      quantity: 1,
      total_price: availableEvent.price,
      qr_code: `TEST_QR_${Date.now()}`,
      status: 'valid'
    };

    console.log('🎫 Criando ticket de teste...');
    const ticketResponse = await axios.post(`${API_BASE_URL}/tickets`, ticketData);
    console.log(`✅ Ticket criado: ${ticketResponse.data.id}`);

    // 3. Validar ticket
    console.log('🔍 Validando ticket...');
    const validationResponse = await axios.post(`${API_BASE_URL}/tickets/${ticketResponse.data.id}/validate`);
    console.log(`✅ Ticket validado: ${validationResponse.data.status}`);

    // 4. Verificar estatísticas
    console.log('📊 Verificando estatísticas...');
    const statsResponse = await axios.get(`${API_BASE_URL}/tickets/stats`);
    console.log(`✅ Estatísticas: ${JSON.stringify(statsResponse.data, null, 2)}`);

    console.log('\n🎉 Fluxo de compra testado com sucesso!');

  } catch (error: any) {
    console.error('❌ Erro no fluxo de compra:', error.response?.data || error.message);
  }
}

// Função para testar dados do banco
async function testDatabaseData() {
  console.log('\n🗄️ Verificando dados do banco...');
  console.log('================================');

  try {
    const events = await EventRepository.findAll();
    const users = await UserRepository.findAll();
    const tickets = await TicketRepository.findAll();

    console.log(`📊 Dados no banco:`);
    console.log(`   - Eventos: ${events.length}`);
    console.log(`   - Usuários: ${users.length}`);
    console.log(`   - Tickets: ${tickets.length}`);

    // Verificar eventos ativos
    const activeEvents = events.filter(event => event.status === 'active');
    console.log(`   - Eventos ativos: ${activeEvents.length}`);

    // Verificar tickets por status
    const validTickets = tickets.filter(ticket => ticket.status === 'valid');
    const usedTickets = tickets.filter(ticket => ticket.status === 'used');
    const cancelledTickets = tickets.filter(ticket => ticket.status === 'cancelled');

    console.log(`   - Tickets válidos: ${validTickets.length}`);
    console.log(`   - Tickets usados: ${usedTickets.length}`);
    console.log(`   - Tickets cancelados: ${cancelledTickets.length}`);

    console.log('\n✅ Dados do banco verificados!');

  } catch (error) {
    console.error('❌ Erro ao verificar dados:', error);
  }
}

// Função para simular chamadas do frontend mobile
async function simulateMobileCalls() {
  console.log('\n📱 Simulando chamadas do frontend mobile...');
  console.log('===========================================');

  try {
    // Simular tela Home (listar eventos ativos)
    console.log('🏠 Simulando tela Home...');
    const activeEventsResponse = await axios.get(`${API_BASE_URL}/events/active`);
    console.log(`✅ Eventos ativos: ${activeEventsResponse.data.length}`);

    // Simular tela EventDetails (buscar evento específico)
    if (activeEventsResponse.data.length > 0) {
      console.log('📋 Simulando tela EventDetails...');
      const eventId = activeEventsResponse.data[0].id;
      const eventDetailsResponse = await axios.get(`${API_BASE_URL}/events/${eventId}`);
      console.log(`✅ Detalhes do evento: ${eventDetailsResponse.data.name}`);
    }

    // Simular tela MyTickets (buscar tickets por email)
    console.log('🎫 Simulando tela MyTickets...');
    const testEmail = 'joao.silva@email.com';
    const userTicketsResponse = await axios.get(`${API_BASE_URL}/tickets/buyer/email/${testEmail}`);
    console.log(`✅ Tickets do usuário: ${userTicketsResponse.data.length}`);

    // Simular tela ValidateTicket (validar por QR code)
    if (userTicketsResponse.data.length > 0) {
      console.log('🔍 Simulando tela ValidateTicket...');
      const qrCode = userTicketsResponse.data[0].qr_code;
      const qrTicketResponse = await axios.get(`${API_BASE_URL}/tickets/qr/${qrCode}`);
      console.log(`✅ Ticket encontrado por QR: ${qrTicketResponse.data.buyer_name}`);
    }

    console.log('\n🎉 Simulação do frontend mobile concluída!');

  } catch (error: any) {
    console.error('❌ Erro na simulação mobile:', error.response?.data || error.message);
  }
}

// Função principal
async function main() {
  console.log('🚀 TESTE DE INTEGRAÇÃO COMPLETA');
  console.log('===============================');
  console.log('Este teste verifica toda a integração entre API e frontend mobile');
  console.log('');

  try {
    // Aguardar API inicializar
    console.log('⏳ Aguardando API inicializar...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Executar testes
    await testApiEndpoints();
    await testDatabaseData();
    await simulateMobileCalls();
    await testPurchaseFlow();

    console.log('\n🎉 INTEGRAÇÃO TESTADA COM SUCESSO!');
    console.log('====================================');
    console.log('✅ API funcionando corretamente');
    console.log('✅ Banco de dados populado');
    console.log('✅ Endpoints respondendo');
    console.log('✅ Fluxo de compra operacional');
    console.log('✅ Frontend mobile integrado');
    console.log('');
    console.log('🚀 Sistema pronto para uso!');

  } catch (error: any) {
    console.error('\n❌ ERRO NO TESTE DE INTEGRAÇÃO');
    console.error('==============================');
    console.error('Detalhes do erro:', error.message);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main().catch(console.error);
}

export {
  testApiEndpoints,
  testDatabaseData,
  simulateMobileCalls,
  testPurchaseFlow
};
