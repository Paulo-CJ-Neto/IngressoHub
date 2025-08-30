#!/usr/bin/env ts-node

/**
 * Teste Rápido da API
 * 
 * Teste simples para verificar se a API está funcionando
 */

import 'dotenv/config';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

async function quickTest() {
  console.log('🚀 Teste Rápido da API');
  console.log('======================');

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

    // Teste 3: Listar usuários
    console.log('\n3️⃣ Testando listagem de usuários...');
    const usersResponse = await axios.get(`${API_BASE_URL}/users`);
    console.log(`✅ Usuários encontrados: ${usersResponse.data.length}`);

    // Teste 4: Listar tickets
    console.log('\n4️⃣ Testando listagem de tickets...');
    const ticketsResponse = await axios.get(`${API_BASE_URL}/tickets`);
    console.log(`✅ Tickets encontrados: ${ticketsResponse.data.length}`);

    console.log('\n🎉 API funcionando perfeitamente!');
    console.log('📱 Frontend mobile pode se conectar!');

  } catch (error: any) {
    console.error('❌ Erro no teste:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Dica: Certifique-se de que a API está rodando:');
      console.log('   npm run dev');
    }
  }
}

quickTest().catch(console.error);
