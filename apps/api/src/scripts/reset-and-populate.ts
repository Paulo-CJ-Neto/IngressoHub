#!/usr/bin/env ts-node

/**
 * Script para Resetar e Popular o Banco de Dados
 * 
 * Este script:
 * 1. Limpa todos os dados existentes
 * 2. Popula com dados de exemplo
 * 
 * ⚠️ ATENÇÃO: Remove TODOS os dados existentes!
 * Use apenas em ambiente de desenvolvimento.
 */

import 'dotenv/config';
import { clearEvents, clearUsers, clearTickets, verifyEmptyDatabase } from './clear-database';
import { populateEvents, populateUsers, populateTickets, verifyData } from './populate-database';
import { validateEnvironment } from '../db';

// Função para resetar o banco
async function resetDatabase(): Promise<void> {
  console.log('🗑️ Resetando banco de dados...');
  
  try {
    // Limpar dados na ordem correta
    const ticketsDeleted = await clearTickets();
    const usersDeleted = await clearUsers();
    const eventsDeleted = await clearEvents();

    console.log(`✅ Reset concluído: ${eventsDeleted} eventos, ${usersDeleted} usuários, ${ticketsDeleted} tickets removidos`);
    
    // Verificar se está vazio
    await verifyEmptyDatabase();
  } catch (error) {
    console.error('❌ Erro durante o reset:', error);
    throw error;
  }
}

// Função para popular o banco
async function populateDatabase(): Promise<void> {
  console.log('🌱 Populando banco de dados...');
  
  try {
    const events = await populateEvents();
    const users = await populateUsers();
    const tickets = await populateTickets(events, users);

    console.log(`✅ População concluída: ${events.length} eventos, ${users.length} usuários, ${tickets.length} tickets criados`);
    
    // Verificar dados criados
    await verifyData();
  } catch (error) {
    console.error('❌ Erro durante a população:', error);
    throw error;
  }
}

// Função principal
async function main() {
  console.log('🔄 RESET E POPULAÇÃO DO BANCO DE DADOS');
  console.log('========================================');
  console.log('⚠️  ATENÇÃO: Isso vai remover TODOS os dados existentes!');
  console.log('');

  // Verificar ambiente
  const environment = process.env.NODE_ENV || 'development';
  if (environment === 'production') {
    console.log('🚫 Operação não permitida em produção!');
    console.log('Para forçar, defina NODE_ENV=development');
    process.exit(1);
  }

  console.log(`🌍 Ambiente: ${environment}`);
  console.log('');

  // Confirmação do usuário
  console.log('⏰ Aguardando 15 segundos para cancelar (Ctrl+C)...');
  console.log('');

  try {
    // Aguardar 15 segundos para dar chance de cancelar
    await new Promise(resolve => setTimeout(resolve, 15000));
  } catch (error) {
    console.log('❌ Operação cancelada pelo usuário');
    process.exit(0);
  }

  console.log('🚀 Iniciando reset e população...');
  console.log('');

  try {
    // Validar ambiente
    console.log('🔧 Validando configurações...');
    validateEnvironment();
    console.log('✅ Configurações validadas!');

    // Resetar banco
    await resetDatabase();

    console.log('\n' + '='.repeat(50) + '\n');

    // Popular banco
    await populateDatabase();

    console.log('\n🎉 Reset e população concluídos com sucesso!');
    console.log('✨ Seu banco de dados está pronto para uso!');

  } catch (error) {
    console.error('\n❌ Erro durante a operação:', error);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main().catch(console.error);
}

export {
  resetDatabase,
  populateDatabase
};
