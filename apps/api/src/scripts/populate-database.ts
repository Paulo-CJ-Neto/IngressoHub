#!/usr/bin/env ts-node

/**
 * Script para Popular o Banco de Dados
 * 
 * Este script cria dados de exemplo para as tabelas:
 * - Events (Eventos)
 * - Users (Usuários) 
 * - Tickets (Ingressos)
 */

import 'dotenv/config';
import { EventRepository } from '../db/repositories/EventRepository';
import { UserRepository } from '../db/repositories/UserRepository';
import { TicketRepository } from '../db/repositories/TicketRepository';
import { validateEnvironment } from '../db';
import { Event, User, Ticket } from '@ingressohub/entities';

// Dados de exemplo para eventos
const sampleEvents: Omit<Event, 'id'>[] = [
  {
    name: 'Show de Rock In Rio 2024',
    date: new Date('2024-12-15T20:00:00').toISOString(),
    location: 'Parque Olímpico, Rio de Janeiro',
    price: 150.00,
    max_tickets: 1000,
    sold_tickets: 850,
    image_url: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=600&h=300&fit=crop',
    description: 'O maior festival de rock do Brasil! Uma experiência única com as melhores bandas nacionais e internacionais. Prepare-se para uma noite inesquecível de música, energia e diversão.',
    status: 'active'
  },
  {
    name: 'Festival de Música Eletrônica Tomorrowland Brasil',
    date: new Date('2024-11-20T22:00:00').toISOString(),
    location: 'Autódromo de Interlagos, São Paulo',
    price: 200.00,
    max_tickets: 500,
    sold_tickets: 490,
    image_url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=300&fit=crop',
    description: 'Uma noite de pura energia eletrônica! DJs internacionais e nacionais, efeitos visuais impressionantes e uma experiência sensorial completa.',
    status: 'active'
  },
  {
    name: 'Teatro: Romeu e Julieta - Shakespeare',
    date: new Date('2024-10-25T19:30:00').toISOString(),
    location: 'Teatro Municipal, São Paulo',
    price: 80.00,
    max_tickets: 200,
    sold_tickets: 120,
    image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=300&fit=crop',
    description: 'A clássica história de amor de Shakespeare como você nunca viu antes. Uma produção moderna e emocionante que vai te fazer rir, chorar e se apaixonar.',
    status: 'active'
  },
  {
    name: 'Stand-up Comedy Night - Comédia Nacional',
    date: new Date('2024-11-10T21:00:00').toISOString(),
    location: 'Casa de Comédia, Rio de Janeiro',
    price: 60.00,
    max_tickets: 150,
    sold_tickets: 150,
    image_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=300&fit=crop',
    description: 'Uma noite de muito riso com os melhores comediantes do Brasil. Humor inteligente e irreverente que vai fazer você esquecer dos problemas.',
    status: 'active'
  },
  {
    name: 'Show de MPB - Caetano Veloso',
    date: new Date('2024-12-05T20:30:00').toISOString(),
    location: 'Teatro Ibirapuera, São Paulo',
    price: 120.00,
    max_tickets: 300,
    sold_tickets: 250,
    image_url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=300&fit=crop',
    description: 'Uma noite especial com Caetano Veloso interpretando seus maiores sucessos. MPB de qualidade em um ambiente intimista e acústico.',
    status: 'active'
  },
  {
    name: 'Festival de Jazz Internacional',
    date: new Date('2024-11-30T19:00:00').toISOString(),
    location: 'Centro Cultural Banco do Brasil, Rio de Janeiro',
    price: 90.00,
    max_tickets: 400,
    sold_tickets: 180,
    image_url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=300&fit=crop',
    description: 'O melhor do jazz internacional em um festival de 3 dias. Artistas consagrados e novas revelações do cenário jazzístico mundial.',
    status: 'active'
  },
  {
    name: 'Balé Clássico - O Lago dos Cisnes',
    date: new Date('2024-12-20T20:00:00').toISOString(),
    location: 'Teatro Municipal, Rio de Janeiro',
    price: 110.00,
    max_tickets: 250,
    sold_tickets: 200,
    image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=300&fit=crop',
    description: 'A clássica obra de Tchaikovsky interpretada pela companhia de balé mais renomada do Brasil. Uma experiência cultural única.',
    status: 'active'
  },
  {
    name: 'Show de Rock - Iron Maiden',
    date: new Date('2024-12-10T21:00:00').toISOString(),
    location: 'Arena Corinthians, São Paulo',
    price: 180.00,
    max_tickets: 800,
    sold_tickets: 750,
    image_url: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=600&h=300&fit=crop',
    description: 'A lendária banda Iron Maiden em turnê mundial. Prepare-se para uma noite de heavy metal puro com os maiores clássicos do rock.',
    status: 'active'
  }
];

// Dados de exemplo para usuários
const sampleUsers: Omit<User, 'id'>[] = [
  {
    email: 'joao.silva@email.com',
    full_name: 'João Silva',
    avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    created_at: new Date('2024-01-15').toISOString()
  },
  {
    email: 'maria.santos@email.com',
    full_name: 'Maria Santos',
    avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    created_at: new Date('2024-02-20').toISOString()
  },
  {
    email: 'pedro.oliveira@email.com',
    full_name: 'Pedro Oliveira',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    created_at: new Date('2024-03-10').toISOString()
  },
  {
    email: 'ana.costa@email.com',
    full_name: 'Ana Costa',
    avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    created_at: new Date('2024-01-25').toISOString()
  },
  {
    email: 'carlos.ferreira@email.com',
    full_name: 'Carlos Ferreira',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    created_at: new Date('2024-02-05').toISOString()
  },
  {
    email: 'julia.rodrigues@email.com',
    full_name: 'Júlia Rodrigues',
    avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
    created_at: new Date('2024-03-15').toISOString()
  },
  {
    email: 'lucas.martins@email.com',
    full_name: 'Lucas Martins',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    created_at: new Date('2024-01-30').toISOString()
  },
  {
    email: 'fernanda.lima@email.com',
    full_name: 'Fernanda Lima',
    avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    created_at: new Date('2024-02-12').toISOString()
  }
];

// Função para gerar ID único
function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Função para gerar QR Code único
function generateQRCode(): string {
  return `QR_${Date.now()}_${Math.random().toString(36).substr(2, 12).toUpperCase()}`;
}

// Função para gerar CPF válido (formato)
function generateCPF(): string {
  const numbers = Array.from({length: 11}, () => Math.floor(Math.random() * 10));
  return numbers.join('').replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

// Função para popular eventos
async function populateEvents(): Promise<Event[]> {
  console.log('🎭 Populando eventos...');
  const createdEvents: Event[] = [];

  for (const eventData of sampleEvents) {
    try {
      const event: Event = {
        id: generateId('event'),
        ...eventData
      };

      await EventRepository.createOrUpdate(event);
      createdEvents.push(event);
      console.log(`✅ Evento criado: ${event.name}`);
    } catch (error) {
      console.error(`❌ Erro ao criar evento ${eventData.name}:`, error);
    }
  }

  console.log(`🎉 ${createdEvents.length} eventos criados com sucesso!`);
  return createdEvents;
}

// Função para popular usuários
async function populateUsers(): Promise<User[]> {
  console.log('👥 Populando usuários...');
  const createdUsers: User[] = [];

  for (const userData of sampleUsers) {
    try {
      const user: User = {
        id: generateId('user'),
        ...userData
      };

      await UserRepository.createOrUpdate(user);
      createdUsers.push(user);
      console.log(`✅ Usuário criado: ${user.full_name}`);
    } catch (error) {
      console.error(`❌ Erro ao criar usuário ${userData.full_name}:`, error);
    }
  }

  console.log(`🎉 ${createdUsers.length} usuários criados com sucesso!`);
  return createdUsers;
}

// Função para popular tickets
async function populateTickets(events: Event[], users: User[]): Promise<Ticket[]> {
  console.log('🎫 Populando tickets...');
  const createdTickets: Ticket[] = [];

  // Criar tickets para diferentes eventos e usuários
  for (let i = 0; i < Math.min(events.length, users.length); i++) {
    const event = events[i];
    const user = users[i];

    // Criar 1-3 tickets por usuário/evento
    const ticketCount = Math.floor(Math.random() * 3) + 1;

    for (let j = 0; j < ticketCount; j++) {
      try {
        const quantity = Math.floor(Math.random() * 2) + 1; // 1 ou 2 ingressos
        const totalPrice = event.price * quantity;

        const ticket: Ticket = {
          id: generateId('ticket'),
          event_id: event.id,
          buyer_name: user.full_name,
          buyer_cpf: generateCPF(),
          buyer_email: user.email,
          quantity: quantity,
          total_price: totalPrice,
          qr_code: generateQRCode(),
          status: Math.random() > 0.8 ? 'used' : 'valid', // 20% chance de ser usado
          created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(), // Últimos 30 dias
          used_at: Math.random() > 0.8 ? new Date().toISOString() : undefined
        };

        await TicketRepository.createOrUpdate(ticket);
        createdTickets.push(ticket);
        console.log(`✅ Ticket criado: ${ticket.buyer_name} - ${event.name}`);
      } catch (error) {
        console.error(`❌ Erro ao criar ticket:`, error);
      }
    }
  }

  // Criar alguns tickets extras com diferentes status
  for (let i = 0; i < 5; i++) {
    const randomEvent = events[Math.floor(Math.random() * events.length)];
    const randomUser = users[Math.floor(Math.random() * users.length)];

    try {
      const ticket: Ticket = {
        id: generateId('ticket'),
        event_id: randomEvent.id,
        buyer_name: randomUser.full_name,
        buyer_cpf: generateCPF(),
        buyer_email: randomUser.email,
        quantity: 1,
        total_price: randomEvent.price,
        qr_code: generateQRCode(),
        status: 'cancelled',
        created_at: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(), // Últimos 60 dias
      };

      await TicketRepository.createOrUpdate(ticket);
      createdTickets.push(ticket);
      console.log(`✅ Ticket cancelado criado: ${ticket.buyer_name} - ${randomEvent.name}`);
    } catch (error) {
      console.error(`❌ Erro ao criar ticket cancelado:`, error);
    }
  }

  console.log(`🎉 ${createdTickets.length} tickets criados com sucesso!`);
  return createdTickets;
}

// Função para verificar dados criados
async function verifyData(): Promise<void> {
  console.log('\n🔍 Verificando dados criados...');

  try {
    const events = await EventRepository.findAll();
    const users = await UserRepository.findAll();
    const tickets = await TicketRepository.findAll();

    console.log(`📊 Resumo dos dados:`);
    console.log(`   - Eventos: ${events.length}`);
    console.log(`   - Usuários: ${users.length}`);
    console.log(`   - Tickets: ${tickets.length}`);

    // Mostrar alguns exemplos
    if (events.length > 0) {
      console.log(`\n🎭 Exemplo de evento: ${events[0].name} - R$ ${events[0].price}`);
    }
    if (users.length > 0) {
      console.log(`👤 Exemplo de usuário: ${users[0].full_name} (${users[0].email})`);
    }
    if (tickets.length > 0) {
      console.log(`🎫 Exemplo de ticket: ${tickets[0].buyer_name} - Status: ${tickets[0].status}`);
    }

  } catch (error) {
    console.error('❌ Erro ao verificar dados:', error);
  }
}

// Função principal
async function main() {
  console.log('🚀 Iniciando população do banco de dados...');
  console.log('============================================');

  try {
    // Validar ambiente
    console.log('🔧 Validando configurações...');
    validateEnvironment();
    console.log('✅ Configurações validadas com sucesso!');

    // Popular dados
    const events = await populateEvents();
    const users = await populateUsers();
    const tickets = await populateTickets(events, users);

    // Verificar dados
    await verifyData();

    console.log('\n🎉 População do banco concluída com sucesso!');
    console.log(`📈 Total de dados criados:`);
    console.log(`   - ${events.length} eventos`);
    console.log(`   - ${users.length} usuários`);
    console.log(`   - ${tickets.length} tickets`);

  } catch (error) {
    console.error('\n❌ Erro durante a população do banco:', error);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main().catch(console.error);
}

export {
  populateEvents,
  populateUsers,
  populateTickets,
  verifyData
};
