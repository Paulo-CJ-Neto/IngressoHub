# 🚀 Rotas da API IngressoHub

Este diretório contém todas as rotas da API organizadas por entidade.

## 📁 Estrutura

```
routes/
├── index.ts          # Arquivo principal que agrupa todas as rotas
├── events.ts         # Rotas para gerenciamento de eventos
├── tickets.ts        # Rotas para gerenciamento de ingressos
├── users.ts          # Rotas para gerenciamento de usuários
└── README.md         # Esta documentação
```

## 🔌 Endpoints Disponíveis

### 🎫 Eventos (`/api/events`)

| Método | Endpoint | Descrição | Parâmetros |
|--------|----------|-----------|------------|
| `GET` | `/api/events` | Listar todos os eventos | - |
| `GET` | `/api/events/active` | Listar eventos ativos | - |
| `GET` | `/api/events/:id` | Buscar evento por ID | `id` |
| `POST` | `/api/events` | Criar novo evento (com upload de imagens) | Body: Event data + FormData |
| `POST` | `/api/events/:id/images` | Adicionar imagens a evento existente | `id`, FormData: images |
| `DELETE` | `/api/events/:id/images` | Remover imagem de evento | `id`, Body: `{imageUrl}` |
| `PUT` | `/api/events/:id` | Atualizar evento completo | `id`, Body: Event data |
| `PATCH` | `/api/events/:id` | Atualizar evento parcialmente | `id`, Body: Updates |
| `PATCH` | `/api/events/:id/sold-tickets` | Incrementar ingressos vendidos | `id`, Body: `{quantity}` |
| `DELETE` | `/api/events/:id` | Deletar evento (remove imagens do S3) | `id` |

**Dados obrigatórios para criar evento:**
```json
{
  "name": "Nome do Evento",
  "date": "2024-12-25T20:00:00.000Z",
  "location": "Local do Evento",
  "price": 150.00,
  "producer_id": "producer_123"
}
```

**Upload de imagens:**
- Use `FormData` para enviar imagens junto com os dados do evento
- Campo `images` para múltiplas imagens (máximo 5)
- Tipos permitidos: JPEG, JPG, PNG, WebP
- Tamanho máximo: 5MB por arquivo
- Imagens são salvas automaticamente no S3

### 🎟️ Ingressos (`/api/tickets`)

| Método | Endpoint | Descrição | Parâmetros |
|--------|----------|-----------|------------|
| `GET` | `/api/tickets` | Listar todos os ingressos | - |
| `GET` | `/api/tickets/event/:eventId` | Buscar ingressos por evento | `eventId` |
| `GET` | `/api/tickets/buyer/:email` | Buscar ingressos por comprador | `email` |
| `GET` | `/api/tickets/cpf/:cpf` | Buscar ingressos por CPF | `cpf` |
| `GET` | `/api/tickets/status/:status` | Buscar ingressos por status | `status` (valid/used/cancelled) |
| `GET` | `/api/tickets/qr/:qrCode` | Buscar ingresso por QR Code | `qrCode` |
| `GET` | `/api/tickets/stats/event/:eventId` | Estatísticas de ingressos por evento | `eventId` |
| `GET` | `/api/tickets/:id` | Buscar ingresso por ID | `id` |
| `POST` | `/api/tickets` | Criar novo ingresso | Body: Ticket data |
| `PUT` | `/api/tickets/:id` | Atualizar ingresso completo | `id`, Body: Ticket data |
| `PATCH` | `/api/tickets/:id/validate` | Validar ingresso | `id` |
| `PATCH` | `/api/tickets/:id/cancel` | Cancelar ingresso | `id` |
| `DELETE` | `/api/tickets/:id` | Deletar ingresso | `id` |

**Dados obrigatórios para criar ingresso:**
```json
{
  "event_id": "event_123",
  "buyer_name": "Nome do Comprador",
  "buyer_email": "email@exemplo.com",
  "buyer_cpf": "123.456.789-00"
}
```

**Status possíveis para ingressos:**
- `valid` - Ingresso válido
- `used` - Ingresso já utilizado
- `cancelled` - Ingresso cancelado

### 👥 Usuários (`/api/users`)

| Método | Endpoint | Descrição | Parâmetros |
|--------|----------|-----------|------------|
| `GET` | `/api/users` | Listar todos os usuários | - |
| `GET` | `/api/users/search` | Buscar usuários por nome | Query: `?name=João` |
| `GET` | `/api/users/email/:email` | Buscar usuário por email | `email` |
| `GET` | `/api/users/:id` | Buscar usuário por ID | `id` |
| `POST` | `/api/users` | Criar novo usuário | Body: User data |
| `PUT` | `/api/users/:id` | Atualizar usuário completo | `id`, Body: User data |
| `PATCH` | `/api/users/:id` | Atualizar usuário parcialmente | `id`, Body: Updates |
| `DELETE` | `/api/users/:id` | Deletar usuário | `id` |

**Dados obrigatórios para criar usuário:**
```json
{
  "email": "usuario@exemplo.com",
  "full_name": "Nome Completo do Usuário"
}
```

## 🔒 Validações e Segurança

### Validações Automáticas
- **Email único**: Não é possível criar usuários com emails duplicados
- **Evento existente**: Ingressos só podem ser criados para eventos existentes
- **Disponibilidade**: Verificação automática de disponibilidade de ingressos
- **Dados obrigatórios**: Validação de campos obrigatórios em todas as rotas

### Tratamento de Erros
- **404**: Recurso não encontrado
- **400**: Dados inválidos ou parâmetros incorretos
- **409**: Conflito (ex: email já existe)
- **500**: Erro interno do servidor

## 📊 Respostas

### Sucesso
```json
{
  "id": "resource_id",
  "name": "Nome do Recurso",
  "created_at": "2024-12-25T20:00:00.000Z"
}
```

### Erro
```json
{
  "error": "Descrição do erro"
}
```

### Lista
```json
[
  {
    "id": "resource_1",
    "name": "Recurso 1"
  },
  {
    "id": "resource_2", 
    "name": "Recurso 2"
  }
]
```

## 🚀 Como Usar

### 1. Importar as rotas
```typescript
import apiRoutes from './routes';

app.use(apiRoutes);
```

### 2. Fazer requisições
```bash
# Listar eventos
curl http://localhost:3000/api/events

# Criar usuário
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","full_name":"João Silva"}'

# Buscar ingressos por evento
curl http://localhost:3000/api/tickets/event/event_123
```

## 🔧 Desenvolvimento

### Adicionar Nova Rota
1. Crie o arquivo da rota em `routes/`
2. Importe no `routes/index.ts`
3. Adicione a documentação aqui

### Testar Rotas
```bash
# Iniciar servidor
npm run dev

# Testar endpoints
curl http://localhost:3000/api/events
```

## 📝 Notas Importantes

- Todas as rotas usam os repositórios implementados
- Validações são feitas automaticamente
- IDs são gerados automaticamente se não fornecidos
- Timestamps são adicionados automaticamente
- QR Codes são gerados automaticamente para ingressos
- Contadores de ingressos vendidos são atualizados automaticamente
