#!/usr/bin/env ts-node

/**
 * Script para Limpar o Banco de Dados
 * 
 * ⚠️ ATENÇÃO: Este script remove TODOS os dados das tabelas!
 * Use apenas em ambiente de desenvolvimento.
 */

import 'dotenv/config';
import { EventRepository } from '../db/repositories/EventRepository';
import { UserRepository } from '../db/repositories/UserRepository';
import { TicketRepository } from '../db/repositories/TicketRepository';
import { validateEnvironment } from '../db';

// Função para limpar eventos
async function clearEvents(): Promise<number> {
  console.log('🗑️ Limpando eventos...');
  let deletedCount = 0;

  try {
    const events = await EventRepository.findAll();
    
    for (const event of events) {
      await EventRepository.delete(event.id);
      deletedCount++;
      console.log(`✅ Evento deletado: ${event.name}`);
    }

    console.log(`🎉 ${deletedCount} eventos removidos!`);
    return deletedCount;
  } catch (error) {
    console.error('❌ Erro ao limpar eventos:', error);
    return 0;
  }
}

// Função para limpar usuários
async function clearUsers(): Promise<number> {
  console.log('🗑️ Limpando usuários...');
  let deletedCount = 0;

  try {
    const users = await UserRepository.findAll();
    
    for (const user of users) {
      await UserRepository.delete(user.id);
      deletedCount++;
      console.log(`✅ Usuário deletado: ${user.full_name}`);
    }

    console.log(`🎉 ${deletedCount} usuários removidos!`);
    return deletedCount;
  } catch (error) {
    console.error('❌ Erro ao limpar usuários:', error);
    return 0;
  }
}

// Função para limpar tickets
async function clearTickets(): Promise<number> {
  console.log('🗑️ Limpando tickets...');
  let deletedCount = 0;

  try {
    const tickets = await TicketRepository.findAll();
    
    for (const ticket of tickets) {
      await TicketRepository.delete(ticket.id);
      deletedCount++;
      console.log(`✅ Ticket deletado: ${ticket.buyer_name} - ${ticket.id}`);
    }

    console.log(`🎉 ${deletedCount} tickets removidos!`);
    return deletedCount;
  } catch (error) {
    console.error('❌ Erro ao limpar tickets:', error);
    return 0;
  }
}

// Função para verificar se o banco está vazio
async function verifyEmptyDatabase(): Promise<void> {
  console.log('\n🔍 Verificando se o banco está vazio...');

  try {
    const events = await EventRepository.findAll();
    const users = await UserRepository.findAll();
    const tickets = await TicketRepository.findAll();

    console.log(`📊 Status do banco:`);
    console.log(`   - Eventos: ${events.length}`);
    console.log(`   - Usuários: ${users.length}`);
    console.log(`   - Tickets: ${tickets.length}`);

    if (events.length === 0 && users.length === 0 && tickets.length === 0) {
      console.log('✅ Banco de dados limpo com sucesso!');
    } else {
      console.log('⚠️ Ainda existem dados no banco.');
    }

  } catch (error) {
    console.error('❌ Erro ao verificar banco:', error);
  }
}

// Função principal
async function main() {
  console.log('🚨 LIMPEZA DO BANCO DE DADOS');
  console.log('=============================');
  console.log('⚠️  ATENÇÃO: Isso vai remover TODOS os dados!');
  console.log('');

  // Verificar ambiente
  const environment = process.env.NODE_ENV || 'development';
  if (environment === 'production') {
    console.log('🚫 Limpeza não permitida em produção!');
    console.log('Para forçar a limpeza, defina NODE_ENV=development');
    process.exit(1);
  }

  console.log(`🌍 Ambiente: ${environment}`);
  console.log('');

  // Confirmação do usuário
  console.log('⏰ Aguardando 10 segundos para cancelar (Ctrl+C)...');
  console.log('');

  try {
    // Aguardar 10 segundos para dar chance de cancelar
    await new Promise(resolve => setTimeout(resolve, 10000));
  } catch (error) {
    console.log('❌ Operação cancelada pelo usuário');
    process.exit(0);
  }

  console.log('🚀 Iniciando limpeza...');
  console.log('');

  try {
    // Validar ambiente
    console.log('🔧 Validando configurações...');
    validateEnvironment();
    console.log('✅ Configurações validadas!');

    // Limpar dados (na ordem correta para evitar problemas de FK)
    const ticketsDeleted = await clearTickets();
    const usersDeleted = await clearUsers();
    const eventsDeleted = await clearEvents();

    // Verificar resultado
    await verifyEmptyDatabase();

    console.log('\n🎉 Limpeza concluída com sucesso!');
    console.log(`📈 Total de dados removidos:`);
    console.log(`   - ${eventsDeleted} eventos`);
    console.log(`   - ${usersDeleted} usuários`);
    console.log(`   - ${ticketsDeleted} tickets`);

  } catch (error) {
    console.error('\n❌ Erro durante a limpeza:', error);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main().catch(console.error);
}

export {
  clearEvents,
  clearUsers,
  clearTickets,
  verifyEmptyDatabase
};
