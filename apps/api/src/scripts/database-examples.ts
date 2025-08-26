#!/usr/bin/env ts-node

/**
 * Script de Exemplo - Uso do Banco de Dados
 * 
 * Este arquivo demonstra como usar as diferentes funções
 * do sistema de banco de dados em diferentes cenários
 */

import 'dotenv/config';
import { 
  initDatabase,
  setupDatabase,
  validateDatabase,
  forceCreateTables,
  getDatabaseStatus,
  resetDatabase
} from '../db';

// Exemplo 1: Inicialização padrão (recomendado)
async function exemploInicializacao() {
  console.log('\n🚀 Exemplo 1: Inicialização Padrão');
  console.log('=====================================');
  
  try {
    await initDatabase();
    console.log('✅ Banco inicializado com sucesso!');
  } catch (error) {
    console.error('❌ Falha na inicialização:', error);
  }
}

// Exemplo 2: Verificar status do banco
async function exemploStatus() {
  console.log('\n📊 Exemplo 2: Verificar Status');
  console.log('================================');
  
  try {
    const status = await getDatabaseStatus();
    console.log('Status do banco:', status);
    
    if (status.status === 'healthy') {
      console.log('🎉 Banco está saudável!');
    } else if (status.status === 'degraded') {
      console.log('⚠️ Banco está degradado');
    } else {
      console.log('🚨 Banco está com problemas');
    }
  } catch (error) {
    console.error('❌ Erro ao verificar status:', error);
  }
}

// Exemplo 3: Validação manual
async function exemploValidacao() {
  console.log('\n🔍 Exemplo 3: Validação Manual');
  console.log('================================');
  
  try {
    const isValid = await validateDatabase();
    if (isValid) {
      console.log('✅ Banco está válido');
    } else {
      console.log('❌ Banco tem problemas');
    }
  } catch (error) {
    console.error('❌ Erro na validação:', error);
  }
}

// Exemplo 4: Setup completo
async function exemploSetup() {
  console.log('\n⚙️ Exemplo 4: Setup Completo');
  console.log('==============================');
  
  try {
    await setupDatabase();
    console.log('✅ Setup completo realizado!');
  } catch (error) {
    console.error('❌ Falha no setup:', error);
  }
}

// Exemplo 5: Forçar criação (desenvolvimento)
async function exemploForcarCriacao() {
  console.log('\n🔧 Exemplo 5: Forçar Criação');
  console.log('==============================');
  
  const environment = process.env.NODE_ENV || 'development';
  
  if (environment === 'production') {
    console.log('⚠️ Não é possível forçar criação em produção');
    return;
  }
  
  try {
    await forceCreateTables();
    console.log('✅ Tabelas forçadas com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao forçar criação:', error);
  }
}

// Exemplo 6: Reset (APENAS desenvolvimento)
async function exemploReset() {
  console.log('\n🗑️ Exemplo 6: Reset do Banco');
  console.log('=============================');
  
  const environment = process.env.NODE_ENV || 'development';
  
  if (environment === 'production') {
    console.log('🚫 Reset não permitido em produção!');
    return;
  }
  
  try {
    console.log('⚠️ ATENÇÃO: Isso vai deletar todas as tabelas!');
    console.log('Pressione Ctrl+C para cancelar ou aguarde 5 segundos...');
    
    // Aguardar 5 segundos para dar chance de cancelar
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    await resetDatabase();
    console.log('✅ Banco resetado com sucesso!');
  } catch (error) {
    console.error('❌ Erro no reset:', error);
  }
}

// Função principal
async function main() {
  console.log('🎯 Exemplos de Uso do Banco de Dados');
  console.log('=====================================');
  console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🗄️ Database: DynamoDB`);
  
  try {
    // Executar exemplos em sequência
    await exemploInicializacao();
    await exemploStatus();
    await exemploValidacao();
    await exemploSetup();
    await exemploForcarCriacao();
    
    // Comentar a linha abaixo para evitar reset acidental
    // await exemploReset();
    
    console.log('\n🎉 Todos os exemplos executados com sucesso!');
  } catch (error) {
    console.error('\n❌ Erro durante execução dos exemplos:', error);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main().catch(console.error);
}

export {
  exemploInicializacao,
  exemploStatus,
  exemploValidacao,
  exemploSetup,
  exemploForcarCriacao,
  exemploReset
};
