# 🚀 ingressohub Monorepo - Início Rápido

## ⚡ Setup Inicial

1. **Instalar dependências raiz:**
   ```bash
   npm install
   ```

2. **Instalar dependências dos workspaces:**
   ```bash
   npm run install:all
   ```

3. **Build das entidades:**
   ```bash
   npm run build:entities
   ```

## 🎯 Comandos Principais

### 📱 Mobile App
```bash
npm run dev:mobile    # Inicia o app React Native
```

### 🔌 API Backend
```bash
npm run dev:api       # Inicia o backend em desenvolvimento
```

### 🔨 Build
```bash
npm run build         # Builda todos os pacotes
npm run build:mobile  # Builda apenas o mobile
npm run build:api     # Builda apenas a API
```

## 🌐 URLs da API

- **Health Check:** http://localhost:3000/health
- **Eventos:** http://localhost:3000/api/events

## 📱 Testando o Mobile

1. Execute `npm run dev:mobile`
2. Escaneie o QR Code com o Expo Go
3. Ou pressione `w` para abrir no navegador

## 🔌 Testando a API

1. Execute `npm run dev:api`
2. Acesse http://localhost:3000/health
3. Teste a rota de eventos: http://localhost:3000/api/events

## 🆘 Solução de Problemas

### Erro de dependências
```bash
npm run install:all
```

### Limpar builds
```bash
npm run clean
```

### Rebuildar entidades
```bash
npm run build:entities
```

## 📁 Estrutura do Projeto

```
ingressohub-monorepo/
├── apps/
│   ├── mobile/          # React Native + Expo
│   └── api/             # Node.js + Express
├── packages/
│   └── entities/        # Entidades compartilhadas
└── package.json         # Workspaces configurados
```

## 🔗 Dependências Compartilhadas

- **Event.ts** - Entidade de evento
- **Ticket.ts** - Entidade de ingresso  
- **User.ts** - Entidade de usuário

Estas entidades são importadas tanto no mobile quanto na API usando:
```typescript
import { Event, Ticket, User } from '@ingressohub/entities';
```
