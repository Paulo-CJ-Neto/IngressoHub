import { docClient, TABLE_NAMES } from '../index';
import { UserRepository } from '../repositories/UserRepository';
import { TicketRepository } from '../repositories/TicketRepository';
import { 
  GetCommand, 
  PutCommand, 
  UpdateCommand, 
  DeleteCommand, 
  QueryCommand,
  ScanCommand 
} from '@aws-sdk/lib-dynamodb';

/**
 * Exemplos de uso do cliente DynamoDB
 * Este arquivo demonstra como usar as operações básicas do DynamoDB
 */

// 1. Inserir um novo evento
export async function createEventExample() {
  const event = {
    id: `event_${Date.now()}`,
    name: 'Show de Rock',
    date: new Date('2024-12-25T20:00:00').toISOString(),
    location: 'Arena Show',
    price: 150.00,
    max_tickets: 1000,
    sold_tickets: 0,
    status: 'active' as const,
    description: 'Uma noite incrível de rock!',
    image_url: 'https://example.com/image.jpg'
  };

  try {
    const command = new PutCommand({
      TableName: TABLE_NAMES.EVENTS,
      Item: event
    });

    await docClient.send(command);
    console.log('✅ Evento criado com sucesso:', event.id);
    return event;
  } catch (error) {
    console.error('❌ Erro ao criar evento:', error);
    throw error;
  }
}

// 2. Buscar um evento por ID
export async function getEventExample(eventId: string) {
  try {
    const command = new GetCommand({
      TableName: TABLE_NAMES.EVENTS,
      Key: { id: eventId }
    });

    const response = await docClient.send(command);
    if (response.Item) {
      console.log('✅ Evento encontrado:', response.Item);
      return response.Item;
    } else {
      console.log('❌ Evento não encontrado');
      return null;
    }
  } catch (error) {
    console.error('❌ Erro ao buscar evento:', error);
    throw error;
  }
}

// 3. Atualizar um evento
export async function updateEventExample(eventId: string, updates: any) {
  try {
    const updateExpression: string[] = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, any> = {};

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined && key !== 'id') {
        updateExpression.push(`#${key} = :${key}`);
        expressionAttributeNames[`#${key}`] = key;
        expressionAttributeValues[`:${key}`] = value;
      }
    });

    const command = new UpdateCommand({
      TableName: TABLE_NAMES.EVENTS,
      Key: { id: eventId },
      UpdateExpression: `SET ${updateExpression.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW'
    });

    const response = await docClient.send(command);
    console.log('✅ Evento atualizado:', response.Attributes);
    return response.Attributes;
  } catch (error) {
    console.error('❌ Erro ao atualizar evento:', error);
    throw error;
  }
}

// 4. Listar todos os eventos
export async function listEventsExample() {
  try {
    const command = new ScanCommand({
      TableName: TABLE_NAMES.EVENTS,
      Limit: 10 // Limitar a 10 resultados para exemplo
    });

    const response = await docClient.send(command);
    console.log(`✅ ${response.Items?.length || 0} eventos encontrados`);
    return response.Items || [];
  } catch (error) {
    console.error('❌ Erro ao listar eventos:', error);
    throw error;
  }
}

// 5. Buscar eventos por status usando GSI
export async function queryEventsByStatusExample(status: string) {
  try {
    const command = new QueryCommand({
      TableName: TABLE_NAMES.EVENTS,
      IndexName: 'status-index', // Assumindo que existe um GSI para status
      KeyConditionExpression: '#status = :status',
      ExpressionAttributeNames: {
        '#status': 'status'
      },
      ExpressionAttributeValues: {
        ':status': status
      }
    });

    const response = await docClient.send(command);
    console.log(`✅ ${response.Items?.length || 0} eventos com status '${status}' encontrados`);
    return response.Items || [];
  } catch (error) {
    console.error('❌ Erro ao buscar eventos por status:', error);
    // Fallback para scan se o índice não existir
    console.log('🔄 Tentando fallback com scan...');
    const allEvents = await listEventsExample();
    return allEvents.filter(event => event.status === status);
  }
}

// 6. Deletar um evento
export async function deleteEventExample(eventId: string) {
  try {
    const command = new DeleteCommand({
      TableName: TABLE_NAMES.EVENTS,
      Key: { id: eventId }
    });

    await docClient.send(command);
    console.log('✅ Evento deletado com sucesso:', eventId);
    return true;
  } catch (error) {
    console.error('❌ Erro ao deletar evento:', error);
    throw error;
  }
}

// 7. Operação de transação (exemplo de compra de ingresso)
export async function purchaseTicketExample(eventId: string, quantity: number) {
  try {
    // Primeiro, buscar o evento para verificar disponibilidade
    const event = await getEventExample(eventId);
    if (!event) {
      throw new Error('Evento não encontrado');
    }

    if (event.sold_tickets + quantity > event.max_tickets) {
      throw new Error('Ingressos insuficientes disponíveis');
    }

    // Atualizar o número de ingressos vendidos
    const command = new UpdateCommand({
      TableName: TABLE_NAMES.EVENTS,
      Key: { id: eventId },
      UpdateExpression: 'SET #sold_tickets = #sold_tickets + :quantity',
      ExpressionAttributeNames: {
        '#sold_tickets': 'sold_tickets'
      },
      ExpressionAttributeValues: {
        ':quantity': quantity
      },
      ReturnValues: 'ALL_NEW'
    });

    const response = await docClient.send(command);
    console.log('✅ Ingressos comprados com sucesso!');
    console.log(`📊 Novos ingressos vendidos: ${response.Attributes?.sold_tickets}`);
    
    return response.Attributes;
  } catch (error) {
    console.error('❌ Erro ao comprar ingressos:', error);
    throw error;
  }
}

// ===== EXEMPLOS PARA USER =====

// 8. Criar usuário
export async function createUserExample() {
  const user = {
    id: `user_${Date.now()}`,
    email: `usuario${Date.now()}@exemplo.com`,
    full_name: 'João Silva',
    avatar_url: 'https://example.com/avatar.jpg',
    created_at: new Date().toISOString()
  };

  try {
    await UserRepository.createOrUpdate(user);
    console.log('✅ Usuário criado com sucesso:', user.id);
    return user;
  } catch (error) {
    console.error('❌ Erro ao criar usuário:', error);
    throw error;
  }
}

// 9. Buscar usuário por email
export async function findUserByEmailExample(email: string) {
  try {
    const user = await UserRepository.findByEmail(email);
    if (user) {
      console.log('✅ Usuário encontrado:', user);
      return user;
    } else {
      console.log('❌ Usuário não encontrado');
      return null;
    }
  } catch (error) {
    console.error('❌ Erro ao buscar usuário:', error);
    throw error;
  }
}

// 10. Atualizar usuário
export async function updateUserExample(userId: string, updates: any) {
  try {
    const user = await UserRepository.update(userId, updates);
    if (user) {
      console.log('✅ Usuário atualizado:', user);
      return user;
    } else {
      console.log('❌ Usuário não encontrado');
      return null;
    }
  } catch (error) {
    console.error('❌ Erro ao atualizar usuário:', error);
    throw error;
  }
}

// ===== EXEMPLOS PARA TICKET =====

// 11. Criar ingresso
export async function createTicketExample(eventId: string) {
  const ticket = {
    id: `ticket_${Date.now()}`,
    event_id: eventId,
    buyer_name: 'Maria Santos',
    buyer_cpf: '123.456.789-00',
    buyer_email: 'maria@exemplo.com',
    quantity: 2,
    total_price: 300.00,
    qr_code: await TicketRepository.generateUniqueQrCode(),
    status: 'valid' as const,
    created_at: new Date().toISOString()
  };

  try {
    await TicketRepository.createOrUpdate(ticket);
    console.log('✅ Ingresso criado com sucesso:', ticket.id);
    return ticket;
  } catch (error) {
    console.error('❌ Erro ao criar ingresso:', error);
    throw error;
  }
}

// 12. Buscar ingressos por evento
export async function findTicketsByEventExample(eventId: string) {
  try {
    const tickets = await TicketRepository.findByEventId(eventId);
    console.log(`✅ ${tickets.length} ingressos encontrados para o evento`);
    return tickets;
  } catch (error) {
    console.error('❌ Erro ao buscar ingressos:', error);
    throw error;
  }
}

// 13. Validar ingresso
export async function validateTicketExample(ticketId: string) {
  try {
    const ticket = await TicketRepository.validateTicket(ticketId);
    if (ticket) {
      console.log('✅ Ingresso validado com sucesso:', ticket);
      return ticket;
    } else {
      console.log('❌ Ingresso não encontrado');
      return null;
    }
  } catch (error) {
    console.error('❌ Erro ao validar ingresso:', error);
    throw error;
  }
}

// 14. Estatísticas de ingressos
export async function getTicketStatsExample(eventId: string) {
  try {
    const stats = await TicketRepository.getEventTicketStats(eventId);
    console.log('📊 Estatísticas do evento:', stats);
    return stats;
  } catch (error) {
    console.error('❌ Erro ao obter estatísticas:', error);
    throw error;
  }
}

// Função para executar todos os exemplos
export async function runAllExamples() {
  console.log('🚀 Executando exemplos do DynamoDB...\n');

  try {
    // 1. Criar evento
    const newEvent = await createEventExample();
    
    // 2. Buscar evento criado
    await getEventExample(newEvent.id);
    
    // 3. Atualizar evento
    await updateEventExample(newEvent.id, { 
      price: 200.00, 
      description: 'Preço atualizado!' 
    });
    
    // 4. Listar eventos
    await listEventsExample();
    
    // 5. Buscar eventos ativos
    await queryEventsByStatusExample('active');
    
    // 6. Comprar ingressos
    await purchaseTicketExample(newEvent.id, 5);
    
    // 7. Criar usuário
    const newUser = await createUserExample();
    
    // 8. Buscar usuário por email
    await findUserByEmailExample(newUser.email);
    
    // 9. Atualizar usuário
    await updateUserExample(newUser.id, { 
      full_name: 'João Silva Atualizado' 
    });
    
    // 10. Criar ingresso
    const newTicket = await createTicketExample(newEvent.id);
    
    // 11. Buscar ingressos por evento
    await findTicketsByEventExample(newEvent.id);
    
    // 12. Validar ingresso
    await validateTicketExample(newTicket.id);
    
    // 13. Estatísticas de ingressos
    await getTicketStatsExample(newEvent.id);
    
    // 14. Deletar evento (limpeza)
    await deleteEventExample(newEvent.id);
    
    console.log('\n🎉 Todos os exemplos executados com sucesso!');
  } catch (error) {
    console.error('\n💥 Erro durante execução dos exemplos:', error);
  }
}
