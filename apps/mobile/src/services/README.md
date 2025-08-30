Auth service is a thin placeholder that uses usersService. Replace with real backend auth for password verification and token handling.

# Serviços de API - IngressoHub Mobile

Este diretório contém os serviços que integram o aplicativo mobile com a API backend usando Axios.

## Estrutura

```
services/
├── api.ts              # Configuração base do Axios
├── eventsService.ts    # Serviços para eventos
├── ticketsService.ts   # Serviços para tickets
├── usersService.ts     # Serviços para usuários
├── index.ts           # Exportações centralizadas
└── README.md          # Esta documentação
```

## Configuração

### API Base
A configuração da API está em `../config/api.ts` e inclui:
- URL base da API
- Timeout das requisições
- Headers padrão
- Configurações de retry

### Interceptors
O Axios está configurado com interceptors para:
- Log de requisições e respostas
- Tratamento de erros
- Headers de autenticação (quando implementado)

## Serviços Disponíveis

### EventsService
Gerencia operações relacionadas a eventos:

```typescript
// Buscar todos os eventos
const events = await eventsService.getAllEvents();

// Buscar eventos ativos
const activeEvents = await eventsService.getActiveEvents();

// Buscar evento por ID
const event = await eventsService.getEventById('event_id');

// Criar novo evento
const newEvent = await eventsService.createEvent(eventData);

// Atualizar evento
const updatedEvent = await eventsService.updateEvent('event_id', updates);

// Deletar evento
await eventsService.deleteEvent('event_id');

// Incrementar ingressos vendidos
const event = await eventsService.incrementSoldTickets('event_id', quantity);
```

### TicketsService
Gerencia operações relacionadas a tickets:

```typescript
// Buscar todos os tickets
const tickets = await ticketsService.getAllTickets();

// Buscar tickets por evento
const eventTickets = await ticketsService.getTicketsByEvent('event_id');

// Buscar tickets por comprador
const userTickets = await ticketsService.getTicketsByBuyerEmail('email@exemplo.com');

// Buscar ticket por QR Code
const ticket = await ticketsService.getTicketByQrCode('qr_code');

// Criar novo ticket
const newTicket = await ticketsService.createTicket(ticketData);

// Validar ticket
const validatedTicket = await ticketsService.validateTicket('ticket_id');

// Cancelar ticket
const cancelledTicket = await ticketsService.cancelTicket('ticket_id');
```

### UsersService
Gerencia operações relacionadas a usuários:

```typescript
// Buscar todos os usuários
const users = await usersService.getAllUsers();

// Buscar usuário por email
const user = await usersService.getUserByEmail('email@exemplo.com');

// Buscar usuário por ID
const user = await usersService.getUserById('user_id');

// Criar novo usuário
const newUser = await usersService.createUser(userData);

// Atualizar usuário
const updatedUser = await usersService.updateUser('user_id', updates);
```

## Uso nas Telas

### Exemplo de uso na tela Home:

```typescript
import { eventsService } from '../services';

const loadEvents = async () => {
  try {
    const data = await eventsService.getActiveEvents();
    setEvents(data);
  } catch (error) {
    console.error('Erro ao carregar eventos:', error);
    Alert.alert('Erro', 'Não foi possível carregar os eventos.');
  }
};
```

### Exemplo de uso na tela Purchase:

```typescript
import { ticketsService } from '../services';

const handlePurchase = async () => {
  try {
    const ticket = await ticketsService.createTicket(ticketData);
    navigation.navigate('TicketSuccess', { qrCode: ticket.qr_code });
  } catch (error) {
    Alert.alert('Erro', 'Erro ao processar compra.');
  }
};
```

## Tratamento de Erros

Todos os serviços incluem tratamento de erros consistente:

1. **Log de erros**: Todos os erros são logados no console
2. **Re-throw**: Erros são re-lançados para tratamento nas telas
3. **Mensagens amigáveis**: As telas exibem mensagens de erro apropriadas

## Configuração de Ambiente

Para alterar a URL da API para diferentes ambientes, edite o arquivo `../config/api.ts`:

```typescript
export const API_CONFIG = {
  BASE_URL: 'https://api.ingressohub.com/api', // Produção
  // BASE_URL: 'http://localhost:3000/api',    // Desenvolvimento
};
```

## Próximos Passos

1. **Autenticação**: Implementar sistema de autenticação com tokens
2. **Cache**: Adicionar cache local para melhor performance
3. **Offline**: Implementar funcionalidade offline
4. **Retry**: Implementar retry automático para falhas de rede
5. **Loading States**: Melhorar estados de carregamento
6. **Error Boundaries**: Implementar error boundaries para melhor UX
