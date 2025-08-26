# IngressoHub API

API backend para o sistema de gerenciamento de eventos e ingressos IngressoHub.

## 🚀 Tecnologias

- **Node.js** com TypeScript
- **Express.js** para o servidor web
- **AWS DynamoDB** como banco de dados
- **AWS SDK v3** para integração com AWS

## 📋 Pré-requisitos

- Node.js 18+ 
- Conta AWS com acesso ao DynamoDB
- Credenciais AWS configuradas

## 🔧 Configuração

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

Crie um arquivo `.env` na raiz da API:

```bash
# Configurações AWS
AWS_ACCESS_KEY_ID=sua_access_key_aqui
AWS_SECRET_ACCESS_KEY=sua_secret_key_aqui
AWS_REGION=sua_regiao_aqui

# Nomes das tabelas DynamoDB (opcional)
EVENTS_TABLE_NAME=Events
TICKETS_TABLE_NAME=Tickets
USERS_TABLE_NAME=Users

# Configurações de ambiente
NODE_ENV=development
PORT=3000
```

### 3. Verificar tabelas no DynamoDB

Certifique-se de que as seguintes tabelas existem no seu DynamoDB:
- `Events` (ou o nome configurado em `EVENTS_TABLE_NAME`)
- `Tickets` (ou o nome configurado em `TICKETS_TABLE_NAME`)
- `Users` (ou o nome configurado em `USERS_TABLE_NAME`)

## 🏃‍♂️ Executando a API

### Desenvolvimento

```bash
npm run dev
```

### Produção

```bash
npm run build
npm start
```

## 🧪 Testando

### Testar conexão com DynamoDB

```bash
npm run db:test
```

### Executar exemplos de uso

```bash
# Exemplos gerais (Event, User, Ticket)
npm run db:examples

# Exemplos específicos de User e Ticket
npm run db:user-ticket

# Testar funcionalidades das rotas
npm run test:routes
```

## 📚 Estrutura do Projeto

```
src/
├── db/                    # Configuração e clientes do banco
│   ├── config.ts         # Configuração do DynamoDB
│   ├── client.ts         # Cliente DynamoDB DocumentClient
│   ├── repositories/     # Repositórios para cada entidade
│   │   ├── EventRepository.ts    # Operações CRUD para Event
│   │   ├── UserRepository.ts     # Operações CRUD para User
│   │   └── TicketRepository.ts   # Operações CRUD para Ticket
│   ├── examples/         # Exemplos de uso
│   │   ├── usage-examples.ts     # Exemplos gerais
│   │   └── user-ticket-examples.ts # Exemplos específicos
│   └── test-connection.ts # Teste de conexão
├── routes/               # Rotas da API
│   ├── events.ts         # Rotas para eventos
│   ├── tickets.ts        # Rotas para ingressos
│   └── users.ts          # Rotas para usuários
└── index.ts              # Arquivo principal da aplicação
```

## 🔌 Endpoints da API

### 🎫 Eventos (`/api/events`)
- `GET /api/events` - Listar todos os eventos
- `GET /api/events/active` - Listar eventos ativos
- `GET /api/events/:id` - Buscar evento por ID
- `POST /api/events` - Criar novo evento
- `PUT /api/events/:id` - Atualizar evento completo
- `PATCH /api/events/:id` - Atualizar evento parcialmente
- `PATCH /api/events/:id/sold-tickets` - Incrementar ingressos vendidos
- `DELETE /api/events/:id` - Deletar evento

### 🎟️ Ingressos (`/api/tickets`)
- `GET /api/tickets` - Listar todos os ingressos
- `GET /api/tickets/event/:eventId` - Buscar ingressos por evento
- `GET /api/tickets/buyer/:email` - Buscar ingressos por comprador
- `GET /api/tickets/cpf/:cpf` - Buscar ingressos por CPF
- `GET /api/tickets/status/:status` - Buscar ingressos por status
- `GET /api/tickets/qr/:qrCode` - Buscar ingresso por QR Code
- `GET /api/tickets/stats/event/:eventId` - Estatísticas de ingressos por evento
- `GET /api/tickets/:id` - Buscar ingresso por ID
- `POST /api/tickets` - Criar novo ingresso
- `PUT /api/tickets/:id` - Atualizar ingresso completo
- `PATCH /api/tickets/:id/validate` - Validar ingresso
- `PATCH /api/tickets/:id/cancel` - Cancelar ingresso
- `DELETE /api/tickets/:id` - Deletar ingresso

### 👥 Usuários (`/api/users`)
- `GET /api/users` - Listar todos os usuários
- `GET /api/users/search` - Buscar usuários por nome
- `GET /api/users/email/:email` - Buscar usuário por email
- `GET /api/users/:id` - Buscar usuário por ID
- `POST /api/users` - Criar novo usuário
- `PUT /api/users/:id` - Atualizar usuário completo
- `PATCH /api/users/:id` - Atualizar usuário parcialmente
- `DELETE /api/users/:id` - Deletar usuário

> 📖 **Documentação completa das rotas:** [Ver detalhes](./src/routes/README.md)

## 🗄️ Operações do DynamoDB

A API utiliza o AWS SDK v3 para operações no DynamoDB:

- **GetCommand** - Buscar item por chave primária
- **PutCommand** - Inserir ou sobrescrever item
- **UpdateCommand** - Atualizar item existente
- **DeleteCommand** - Deletar item
- **QueryCommand** - Consultar usando índices
- **ScanCommand** - Listar todos os itens

### 📚 Repositórios Implementados

#### EventRepository
- `findById()` - Buscar evento por ID
- `findAll()` - Listar todos os eventos
- `findActive()` - Buscar eventos ativos
- `createOrUpdate()` - Criar/atualizar evento
- `update()` - Atualizar evento parcialmente
- `delete()` - Deletar evento
- `incrementSoldTickets()` - Incrementar ingressos vendidos

#### UserRepository
- `findById()` - Buscar usuário por ID
- `findByEmail()` - Buscar usuário por email
- `findAll()` - Listar todos os usuários
- `createOrUpdate()` - Criar/atualizar usuário
- `update()` - Atualizar usuário parcialmente
- `delete()` - Deletar usuário
- `searchByName()` - Buscar usuários por nome
- `emailExists()` - Verificar se email já existe

#### TicketRepository
- `findById()` - Buscar ingresso por ID
- `findByQrCode()` - Buscar ingresso por QR Code
- `findByEventId()` - Buscar ingressos por evento
- `findByBuyerEmail()` - Buscar ingressos por comprador
- `findByStatus()` - Buscar ingressos por status
- `findAll()` - Listar todos os ingressos
- `createOrUpdate()` - Criar/atualizar ingresso
- `update()` - Atualizar ingresso parcialmente
- `delete()` - Deletar ingresso
- `validateTicket()` - Validar ingresso (mudar para 'used')
- `cancelTicket()` - Cancelar ingresso
- `generateUniqueQrCode()` - Gerar QR Code único
- `findByBuyerCpf()` - Buscar ingressos por CPF
- `getEventTicketStats()` - Estatísticas de ingressos por evento

## 🔒 Segurança e Validações

### Segurança
- **Helmet.js** para headers de segurança
- **CORS** configurado para controle de acesso
- Validação de variáveis de ambiente
- Tratamento de erros centralizado

### Validações Automáticas
- **Email único**: Não é possível criar usuários com emails duplicados
- **Evento existente**: Ingressos só podem ser criados para eventos existentes
- **Disponibilidade**: Verificação automática de disponibilidade de ingressos
- **Dados obrigatórios**: Validação de campos obrigatórios em todas as rotas
- **Status válidos**: Validação de status para ingressos (valid/used/cancelled)

### Tratamento de Erros
- **404**: Recurso não encontrado
- **400**: Dados inválidos ou parâmetros incorretos
- **409**: Conflito (ex: email já existe)
- **500**: Erro interno do servidor

## 🐛 Troubleshooting

### Erro de conexão com DynamoDB

1. Verifique suas credenciais AWS
2. Confirme se a região está correta
3. Teste a conexão: `npm run db:test`

### Tabela não encontrada

1. Verifique se as tabelas existem no DynamoDB
2. Confirme os nomes das tabelas no arquivo `.env`
3. Verifique as permissões da sua conta AWS

### Erro de permissão

1. Verifique se sua conta AWS tem permissões para:
   - `dynamodb:GetItem`
   - `dynamodb:PutItem`
   - `dynamodb:UpdateItem`
   - `dynamodb:DeleteItem`
   - `dynamodb:Query`
   - `dynamodb:Scan`

## 📖 Documentação Adicional

- [Configuração do DynamoDB](./src/db/README.md)
- [Exemplos de uso](./src/db/examples/usage-examples.ts)
- [AWS SDK v3 Documentation](https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/)
- [DynamoDB Best Practices](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/best-practices.html)
