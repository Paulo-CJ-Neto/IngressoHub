# Scripts de Banco de Dados - IngressoHub API

Este diretório contém scripts para gerenciar o banco de dados da aplicação.

## 📁 Scripts Disponíveis

### 1. `populate-database.ts` - Popular Banco de Dados
Cria dados de exemplo para as tabelas Events, Users e Tickets.

**Uso:**
```bash
cd apps/api
npx ts-node src/scripts/populate-database.ts
```

**O que faz:**
- Cria 8 eventos de exemplo (shows, festivais, teatro, etc.)
- Cria 8 usuários de exemplo com dados realistas
- Cria tickets variados (válidos, usados, cancelados)
- Verifica se os dados foram criados corretamente

### 2. `clear-database.ts` - Limpar Banco de Dados
Remove TODOS os dados das tabelas.

**⚠️ ATENÇÃO:** Este script remove TODOS os dados existentes!

**Uso:**
```bash
cd apps/api
npx ts-node src/scripts/clear-database.ts
```

**O que faz:**
- Remove todos os tickets
- Remove todos os usuários
- Remove todos os eventos
- Verifica se o banco está vazio

### 3. `reset-and-populate.ts` - Reset e Popular
Combina limpeza e população em uma única operação.

**⚠️ ATENÇÃO:** Remove TODOS os dados existentes e cria novos!

**Uso:**
```bash
cd apps/api
npx ts-node src/scripts/reset-and-populate.ts
```

**O que faz:**
- Limpa todos os dados existentes
- Popula com dados de exemplo
- Verifica se tudo foi criado corretamente

### 4. `database-examples.ts` - Exemplos de Uso
Demonstra como usar as funções do banco de dados.

**Uso:**
```bash
cd apps/api
npx ts-node src/scripts/database-examples.ts
```

## 🚀 Como Usar

### Pré-requisitos
1. Certifique-se de que o banco de dados está configurado
2. Verifique se as variáveis de ambiente estão definidas
3. Execute a API pelo menos uma vez para criar as tabelas

### Comandos Rápidos

**Para popular o banco (recomendado para desenvolvimento):**
```bash
cd apps/api
npx ts-node src/scripts/populate-database.ts
```

**Para reset completo (limpar + popular):**
```bash
cd apps/api
npx ts-node src/scripts/reset-and-populate.ts
```

**Para apenas limpar:**
```bash
cd apps/api
npx ts-node src/scripts/clear-database.ts
```

## 📊 Dados Criados

### Eventos (8 eventos)
- Show de Rock In Rio 2024
- Festival de Música Eletrônica Tomorrowland Brasil
- Teatro: Romeu e Julieta - Shakespeare
- Stand-up Comedy Night - Comédia Nacional
- Show de MPB - Caetano Veloso
- Festival de Jazz Internacional
- Balé Clássico - O Lago dos Cisnes
- Show de Rock - Iron Maiden

### Usuários (8 usuários)
- João Silva
- Maria Santos
- Pedro Oliveira
- Ana Costa
- Carlos Ferreira
- Júlia Rodrigues
- Lucas Martins
- Fernanda Lima

### Tickets (variados)
- Tickets válidos (80%)
- Tickets usados (20%)
- Tickets cancelados (alguns extras)
- Quantidades variadas (1-2 ingressos)
- Preços calculados automaticamente

## 🔒 Segurança

- **Produção:** Scripts de limpeza são bloqueados em produção
- **Confirmação:** Scripts perigosos têm delay de confirmação
- **Ambiente:** Verificação automática do ambiente

## 🛠️ Desenvolvimento

### Adicionando Novos Dados

Para adicionar mais eventos, usuários ou tickets, edite os arrays no arquivo `populate-database.ts`:

```typescript
// Adicionar novo evento
const sampleEvents: Omit<Event, 'id'>[] = [
  // ... eventos existentes
  {
    name: 'Novo Evento',
    date: new Date('2024-12-25T20:00:00').toISOString(),
    location: 'Local do Evento',
    price: 100.00,
    max_tickets: 200,
    sold_tickets: 50,
    status: 'active'
  }
];
```

### Personalizando Scripts

Você pode importar e usar as funções em outros scripts:

```typescript
import { populateEvents, populateUsers } from './populate-database';

// Usar apenas algumas funções
await populateEvents();
await populateUsers();
```

## 📝 Logs

Todos os scripts fornecem logs detalhados:
- ✅ Sucessos
- ❌ Erros
- 📊 Resumos
- 🔍 Verificações

## 🎯 Casos de Uso

### Desenvolvimento Inicial
```bash
# Primeira vez usando o projeto
npx ts-node src/scripts/reset-and-populate.ts
```

### Adicionar Mais Dados
```bash
# Apenas popular (sem limpar)
npx ts-node src/scripts/populate-database.ts
```

### Limpar para Testes
```bash
# Limpar tudo
npx ts-node src/scripts/clear-database.ts
```

### Verificar Dados
```bash
# Ver exemplos de uso
npx ts-node src/scripts/database-examples.ts
```

## 🔧 Troubleshooting

### Erro: "Tabelas não existem"
Execute a API primeiro para criar as tabelas:
```bash
cd apps/api
npm start
```

### Erro: "Credenciais inválidas"
Verifique as variáveis de ambiente no arquivo `.env`

### Erro: "Timeout"
Aumente o timeout nas configurações do DynamoDB

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs de erro
2. Confirme se o banco está acessível
3. Verifique as configurações de ambiente
4. Execute os scripts de exemplo primeiro
