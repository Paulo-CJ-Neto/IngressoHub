# ingressohub Monorepo

Este é um monorepo para o projeto ingressohub, organizado com a seguinte estrutura:

## 📁 Estrutura do Projeto

```
ingressohub-monorepo/
├── apps/
│   ├── mobile/          # Aplicação React Native (Expo)
│   └── api/             # Backend Node.js com Express
├── packages/
│   └── entities/        # Entidades compartilhadas (Event, Ticket, User)
├── package.json         # Package.json raiz com workspaces
└── tsconfig.json        # Configuração TypeScript raiz
```

## 🚀 Scripts Disponíveis

### Desenvolvimento
- `npm run dev:mobile` - Inicia o app React Native
- `npm run dev:api` - Inicia o backend em modo desenvolvimento

### Build
- `npm run build` - Builda todos os pacotes
- `npm run build:mobile` - Builda apenas o mobile
- `npm run build:api` - Builda apenas a API
- `npm run build:entities` - Builda apenas as entidades

### Utilitários
- `npm run install:all` - Instala dependências em todos os workspaces
- `npm run clean` - Limpa builds em todos os workspaces

## 🛠️ Configuração

### Pré-requisitos
- Node.js 18+
- npm 9+
- Expo CLI (para desenvolvimento mobile)

### Instalação
```bash
# Instalar dependências raiz
npm install

# Instalar dependências em todos os workspaces
npm run install:all
```

## 📱 Mobile App

O app mobile está localizado em `apps/mobile/` e usa:
- React Native com Expo
- TypeScript
- React Navigation
- React Native Paper para UI

### Executar
```bash
npm run dev:mobile
```

## 🔌 API Backend

A API está localizada em `apps/api/` e usa:
- Node.js com Express
- TypeScript
- CORS e Helmet para segurança
- Rota `/health` para health check
- Rota `/api/events` como exemplo

### Executar
```bash
npm run dev:api
```

## 📦 Pacote Entities

O pacote `packages/entities/` contém:
- `Event.ts` - Entidade de evento
- `Ticket.ts` - Entidade de ingresso
- `User.ts` - Entidade de usuário

Este pacote é compartilhado entre mobile e API, garantindo consistência de tipos.

## 🔗 TypeScript Project References

O projeto usa TypeScript Project References para:
- Compilação incremental
- Verificação de tipos entre projetos
- Importações com paths configurados

## 📋 Próximos Passos

1. Implementar autenticação na API
2. Adicionar banco de dados
3. Implementar funcionalidades de CRUD
4. Adicionar testes unitários
5. Configurar CI/CD
