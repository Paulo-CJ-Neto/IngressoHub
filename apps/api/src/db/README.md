# Configuração do DynamoDB

Este diretório contém a configuração e clientes para conectar com o DynamoDB da AWS.

## Arquivos

- `config.ts` - Configuração básica do cliente DynamoDB e validação de variáveis de ambiente
- `client.ts` - Cliente DocumentClient para operações CRUD simplificadas
- `index.ts` - Exportações principais do módulo
- `repositories/` - Repositórios para cada entidade:
  - `EventRepository.ts` - Operações CRUD para Event
  - `UserRepository.ts` - Operações CRUD para User
  - `TicketRepository.ts` - Operações CRUD para Ticket

## Configuração

### 1. Variáveis de Ambiente

Crie um arquivo `.env` na raiz da API com suas credenciais AWS:

```bash
AWS_ACCESS_KEY_ID=sua_access_key_aqui
AWS_SECRET_ACCESS_KEY=sua_secret_key_aqui
AWS_REGION=sua_regiao_aqui
```

### 2. Nomes das Tabelas (Opcional)

Se suas tabelas tiverem nomes diferentes dos padrões, configure:

```bash
EVENTS_TABLE_NAME=MeusEventos
TICKETS_TABLE_NAME=MeusTickets
USERS_TABLE_NAME=MeusUsuarios
```

## Uso

### Importação básica

```typescript
import { docClient, TABLE_NAMES } from '../db';

// Exemplo de operação
const result = await docClient.get({
  TableName: TABLE_NAMES.USERS,
  Key: { id: 'user123' }
});
```

### Usando os Repositórios

```typescript
import { EventRepository, UserRepository, TicketRepository } from '../db/repositories';

// EventRepository
const event = await EventRepository.findById('event123');
const activeEvents = await EventRepository.findActive();

// UserRepository
const user = await UserRepository.findByEmail('user@example.com');
const usersByName = await UserRepository.searchByName('João');

// TicketRepository
const ticket = await TicketRepository.findByQrCode('QR_123456');
const eventTickets = await TicketRepository.findByEventId('event123');
```

### Validação de ambiente

```typescript
import { validateEnvironment } from '../db';

// No início da aplicação
validateEnvironment();
```

## Operações Comuns

### Inserir item

```typescript
await docClient.put({
  TableName: TABLE_NAMES.EVENTS,
  Item: {
    id: 'event123',
    name: 'Show de Rock',
    date: '2024-12-25',
    // ... outros campos
  }
});
```

### Buscar item

```typescript
const result = await docClient.get({
  TableName: TABLE_NAMES.TICKETS,
  Key: { id: 'ticket123' }
});
```

### Atualizar item

```typescript
await docClient.update({
  TableName: TABLE_NAMES.USERS,
  Key: { id: 'user123' },
  UpdateExpression: 'SET #name = :name',
  ExpressionAttributeNames: { '#name': 'name' },
  ExpressionAttributeValues: { ':name': 'Novo Nome' }
});
```

### Deletar item

```typescript
await docClient.delete({
  TableName: TABLE_NAMES.TICKETS,
  Key: { id: 'ticket123' }
});
```

## Desenvolvimento Local

Para desenvolvimento local com DynamoDB Local, adicione:

```bash
DYNAMODB_ENDPOINT=http://localhost:8000
```

## Segurança

⚠️ **IMPORTANTE**: Nunca commite suas credenciais AWS no repositório. Use sempre variáveis de ambiente ou arquivos `.env` que estejam no `.gitignore`.
