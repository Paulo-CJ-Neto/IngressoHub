# Integração de Pagamentos PIX com Pagar.me

Este documento explica como configurar e usar a integração de pagamentos PIX com a API do Pagar.me no IngressoHub.

## 🚀 Funcionalidades

- ✅ Criação de cobranças PIX
- ✅ Geração de QR Code e código copia e cola
- ✅ Recebimento de webhooks de confirmação
- ✅ Consulta de status de pagamentos
- ✅ Gerenciamento de pagamentos por usuário
- ✅ Cancelamento de pagamentos
- ✅ Armazenamento seguro no DynamoDB

## 📋 Pré-requisitos

1. **Conta no Pagar.me** (sandbox para testes, produção para uso real)
2. **Credenciais da API** (API Key e Encryption Key)
3. **Webhook URL** configurada no painel do Pagar.me
4. **DynamoDB** configurado e funcionando

## ⚙️ Configuração

### 1. Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```bash
# Pagar.me - Sandbox (desenvolvimento)
PAGARME_API_KEY=sua_api_key_sandbox_aqui
PAGARME_ENCRYPTION_KEY=sua_encryption_key_sandbox_aqui
PAGARME_WEBHOOK_SECRET=seu_webhook_secret_sandbox_aqui
PAGARME_ENVIRONMENT=sandbox

# Pagar.me - Produção
# PAGARME_API_KEY=sua_api_key_producao_aqui
# PAGARME_ENCRYPTION_KEY=sua_encryption_key_producao_aqui
# PAGARME_WEBHOOK_SECRET=seu_webhook_secret_producao_aqui
# PAGARME_ENVIRONMENT=production

# Tabela de Pagamentos
PAYMENTS_TABLE_NAME=Payments
```

### 2. Criar Tabela no DynamoDB

Execute o script para criar a tabela de pagamentos:

```bash
npm run db:create-payments-table
```

### 3. Configurar Webhook no Pagar.me

No painel do Pagar.me, configure o webhook para apontar para:

```
https://seu-dominio.com/api/payments/webhook
```

## 🔌 Endpoints da API

### POST /api/payments/pix
Cria um novo pagamento PIX.

**Request Body:**
```json
{
  "userId": "user-123",
  "ticketId": "ticket-456",
  "eventId": "event-789",
  "amount": 5000,
  "customerName": "João Silva",
  "customerEmail": "joao@email.com",
  "customerDocument": "12345678901",
  "eventName": "Show de Rock"
}
```

**Response:**
```json
{
  "success": true,
  "payment": {
    "id": "payment-uuid",
    "status": "waiting_payment",
    "amount": 5000,
    "pixQrCode": "00020126...",
    "pixQrCodeBase64": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    "expiresAt": "2024-01-15T10:00:00.000Z"
  },
  "pixQrCode": "00020126...",
  "pixQrCodeBase64": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "pixCopyPaste": "00020126...",
  "expiresAt": "2024-01-15T10:00:00.000Z"
}
```

### POST /api/payments/webhook
Webhook do Pagar.me (não chamar diretamente).

### GET /api/payments/:id/status
Consulta o status de um pagamento.

**Response:**
```json
{
  "success": true,
  "payment": {
    "id": "payment-uuid",
    "status": "paid",
    "amount": 5000,
    "createdAt": "2024-01-15T09:00:00.000Z",
    "updatedAt": "2024-01-15T09:30:00.000Z"
  }
}
```

### GET /api/payments/user/:userId
Lista todos os pagamentos de um usuário.

### DELETE /api/payments/:id
Cancela um pagamento.

### GET /api/payments/health
Verifica a saúde do serviço de pagamento.

## 📱 Uso no Aplicativo Mobile

### 1. Criar Pagamento
```typescript
const response = await fetch('/api/payments/pix', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'user-123',
    ticketId: 'ticket-456',
    eventId: 'event-789',
    amount: 5000,
    customerName: 'João Silva',
    customerEmail: 'joao@email.com',
    customerDocument: '12345678901',
    eventName: 'Show de Rock'
  })
});

const result = await response.json();
// Exibir QR Code: result.pixQrCodeBase64
// Exibir código copia e cola: result.pixCopyPaste
```

### 2. Verificar Status
```typescript
const checkStatus = async (paymentId: string) => {
  const response = await fetch(`/api/payments/${paymentId}/status`);
  const result = await response.json();
  
  if (result.payment.status === 'paid') {
    // Liberar ingresso
    console.log('Pagamento aprovado!');
  } else if (result.payment.status === 'failed') {
    // Mostrar erro
    console.log('Pagamento falhou!');
  }
};
```

## 🔒 Segurança

- **Webhook Secret**: Sempre configure um secret para validar webhooks
- **HTTPS**: Use sempre HTTPS em produção
- **Rate Limiting**: Considere implementar rate limiting nos endpoints
- **Validação**: Todos os dados são validados antes do processamento

## 🧪 Testes

### Sandbox do Pagar.me
Para testes, use as credenciais de sandbox e os dados de teste fornecidos pelo Pagar.me.

### Teste Local
1. Configure as variáveis de ambiente
2. Execute `npm run db:create-payments-table`
3. Inicie o servidor com `npm run dev`
4. Teste os endpoints com Postman ou similar

## 📊 Monitoramento

- **Logs**: Todos os pagamentos são logados
- **Webhooks**: Recebimento e processamento são monitorados
- **Erros**: Tratamento robusto de erros com mensagens claras
- **Health Check**: Endpoint `/api/payments/health` para monitoramento

## 🚨 Troubleshooting

### Erro: "Serviço de pagamento não configurado"
- Verifique se as variáveis do Pagar.me estão configuradas
- Confirme se o arquivo `.env` está sendo carregado

### Erro: "Credenciais inválidas do Pagar.me"
- Verifique se a API Key está correta
- Confirme se está usando o ambiente correto (sandbox/produção)

### Webhook não recebido
- Verifique se a URL está correta no painel do Pagar.me
- Confirme se o servidor está acessível externamente
- Verifique os logs do servidor

## 📚 Recursos Adicionais

- [Documentação da API do Pagar.me](https://docs.pagar.me/)
- [Guia de Webhooks](https://docs.pagar.me/webhooks)
- [Ambiente de Sandbox](https://sandbox.pagar.me/)

## 🤝 Suporte

Para dúvidas ou problemas:
1. Verifique os logs do servidor
2. Consulte a documentação do Pagar.me
3. Abra uma issue no repositório
