# Configuração de Email - IngressoHub API

Este documento explica como configurar o sistema de email para verificação de contas na API do IngressoHub.

## 🚀 Configuração Rápida

### 1. Variáveis de Ambiente

Crie um arquivo `.env` na raiz da API com as seguintes variáveis:

```bash
# Configuração de Email (Gmail para desenvolvimento)
EMAIL_USER=seu-email@gmail.com
EMAIL_PASS=sua-senha-de-app

# URLs do Frontend
FRONTEND_URL=http://localhost:3000
MOBILE_APP_URL=ingressohub://verify-email

# Ambiente
NODE_ENV=development
```

### 2. Configuração do Gmail

Para usar o Gmail como provedor de email:

1. **Ative a verificação em duas etapas** na sua conta Google
2. **Gere uma senha de app**:
   - Vá para [Conta Google > Segurança](https://myaccount.google.com/security)
   - Em "Como você faz login no Google", clique em "Verificação em duas etapas"
   - Clique em "Senhas de app"
   - Gere uma senha para "Email"
   - Use essa senha no campo `EMAIL_PASS`

### 3. Teste a Configuração

```bash
# Teste a conexão de email
npm run test:email

# Ou teste manualmente
cd apps/api
npm run dev
# Acesse http://localhost:3000/health para verificar se está funcionando
```

## 📧 Provedores de Email Suportados

### Gmail (Desenvolvimento)
- **Vantagens**: Gratuito, fácil de configurar
- **Desvantagens**: Limite de 500 emails/dia, não recomendado para produção
- **Configuração**: Apenas `EMAIL_USER` e `EMAIL_PASS`

### SendGrid (Produção)
- **Vantagens**: Profissional, 100 emails/dia gratuitos, escalável
- **Desvantagens**: Requer configuração adicional
- **Configuração**: `SENDGRID_API_KEY` e `EMAIL_FROM`

### Outros Provedores
- **Amazon SES**: Para aplicações AWS
- **Mailgun**: Para aplicações empresariais
- **Postmark**: Para emails transacionais

## 🔧 Configuração Avançada

### SendGrid

1. Crie uma conta em [SendGrid](https://sendgrid.com/)
2. Gere uma API Key
3. Configure as variáveis de ambiente:

```bash
SENDGRID_API_KEY=sua-api-key-aqui
EMAIL_FROM=noreply@seudominio.com
NODE_ENV=production
```

### Amazon SES

1. Configure o SES na sua conta AWS
2. Configure as variáveis de ambiente:

```bash
AWS_SES_REGION=us-east-1
AWS_SES_ACCESS_KEY_ID=sua-access-key
AWS_SES_SECRET_ACCESS_KEY=sua-secret-key
EMAIL_FROM=noreply@seudominio.com
NODE_ENV=production
```

## 📱 Configuração Mobile

Para o app mobile funcionar corretamente:

1. **Deep Links**: Configure o schema `ingressohub://` no app
2. **Universal Links**: Para iOS, configure o domínio associado
3. **App Links**: Para Android, configure o intent filter

## 🧪 Testes

### Teste de Conexão
```typescript
import { EmailService } from './src/services/EmailService';

// Teste a conexão
const isConnected = await EmailService.testConnection();
console.log('Conexão de email:', isConnected ? '✅ OK' : '❌ Falhou');
```

### Teste de Envio
```typescript
// Teste envio de verificação
const sent = await EmailService.sendVerificationEmail(
  'teste@exemplo.com',
  'token-teste',
  'Usuário Teste'
);
console.log('Email enviado:', sent ? '✅ Sim' : '❌ Não');
```

## 🚨 Solução de Problemas

### Erro: "Invalid login"
- Verifique se `EMAIL_USER` e `EMAIL_PASS` estão corretos
- Certifique-se de que a verificação em duas etapas está ativada
- Use uma senha de app, não sua senha principal

### Erro: "Connection timeout"
- Verifique sua conexão com a internet
- Verifique se o firewall não está bloqueando a porta 587
- Tente usar a porta 465 com SSL

### Emails não chegam
- Verifique a pasta de spam
- Verifique se o email está sendo enviado (logs da API)
- Teste com um email diferente

### Limite de emails excedido
- Gmail: 500 emails/dia
- SendGrid: 100 emails/dia (gratuito)
- Considere usar um provedor diferente para produção

## 📊 Monitoramento

### Logs
A API registra todas as operações de email:
- ✅ Sucesso: `Email de verificação enviado para: email@exemplo.com`
- ❌ Erro: `Erro ao enviar email de verificação: [detalhes]`

### Métricas
Monitore:
- Taxa de entrega de emails
- Tempo de resposta
- Erros de autenticação
- Limites de quota

## 🔒 Segurança

### Tokens de Verificação
- Expiração: 24 horas
- Formato: UUID v4
- Armazenamento: Hash no banco de dados

### Rate Limiting
- Máximo: 5 tentativas de verificação por hora por email
- Máximo: 3 reenvios de verificação por dia por email

### Validação
- Email deve ser válido
- Token deve existir e não ter expirado
- Usuário deve existir

## 📚 Recursos Adicionais

- [Documentação do Nodemailer](https://nodemailer.com/)
- [Configuração do Gmail](https://support.google.com/accounts/answer/185833)
- [Documentação do SendGrid](https://sendgrid.com/docs/)
- [Melhores Práticas de Email](https://www.emailjs.com/docs/best-practices/)

## 🔄 Fluxo de Verificação

### 1. Cadastro do Usuário
- Usuário se cadastra no app mobile
- Sistema gera token de verificação único
- Email é enviado com link de confirmação

### 2. Verificação via Web
- Usuário recebe email e clica no link
- Link abre página web de confirmação
- Sistema valida token e marca email como verificado

### 3. Retorno ao App
- Usuário volta ao app mobile
- Clica em "Email Já Verificado"
- É redirecionado para login

### 4. Login
- Usuário pode fazer login normalmente
- Sistema verifica se email foi confirmado
- Acesso liberado aos recursos do app
