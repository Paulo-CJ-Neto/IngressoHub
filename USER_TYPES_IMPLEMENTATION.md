# Implementação de Tipos de Usuário - IngressoHub

## Visão Geral

Este documento descreve a implementação de diferentes tipos de usuário no sistema IngressoHub, permitindo que clientes, produtores e administradores tenham acesso a funcionalidades específicas baseadas em seus perfis.

## Tipos de Usuário

### 1. Cliente (client)
- **Descrição**: Usuários que compram ingressos para eventos
- **Funcionalidades**:
  - Visualizar eventos disponíveis
  - Comprar ingressos
  - Gerenciar ingressos pessoais
  - Validar ingressos
  - Perfil pessoal

### 2. Produtor (producer)
- **Descrição**: Usuários que criam e gerenciam eventos
- **Funcionalidades**:
  - Dashboard de produtor com estatísticas
  - Criar novos eventos
  - Gerenciar eventos existentes
  - Visualizar analytics de eventos
  - Perfil de produtor

### 3. Administrador (admin)
- **Descrição**: Usuários com acesso total ao sistema
- **Funcionalidades**:
  - Dashboard administrativo
  - Gestão de usuários
  - Moderação de eventos
  - Analytics do sistema
  - Perfil administrativo

## Implementação Técnica

### Backend (API)

#### 1. Atualização da Entidade User
```typescript
export interface User {
  // ... campos existentes
  user_type: 'client' | 'producer' | 'admin';
}
```

#### 2. Script de Migração
Execute o script para atualizar usuários existentes:
```bash
npm run db:update-users-table
```

#### 3. Rota de Registro Atualizada
A rota `/auth/register` agora aceita o parâmetro `user_type`:
```json
{
  "email": "produtor@exemplo.com",
  "password": "senha123",
  "full_name": "Nome do Produtor",
  "user_type": "producer"
}
```

### Frontend (Mobile)

#### 1. Contexto de Autenticação Atualizado
O `AuthContext` agora inclui flags para verificar o tipo de usuário:
```typescript
const { isClient, isProducer, isAdmin } = useAuth();
```

#### 2. Navegação Condicional
Diferentes navegações são renderizadas baseadas no tipo de usuário:
- **Clientes**: Navegação padrão com funcionalidades de compra
- **Produtores**: Navegação específica para gestão de eventos
- **Administradores**: Navegação administrativa com controle total

#### 3. Telas Específicas por Tipo

##### Para Produtores:
- `ProducerDashboard`: Dashboard com estatísticas e ações rápidas
- `ManageEvents`: Lista e gestão de eventos criados
- `CreateEvent`: Formulário para criar novos eventos
- `EventAnalytics`: Analytics e insights dos eventos

##### Para Administradores:
- `AdminDashboard`: Dashboard administrativo do sistema
- `UserManagement`: Gestão de todos os usuários
- `EventModeration`: Aprovação/rejeição de eventos
- `SystemAnalytics`: Analytics gerais do sistema

## Fluxo de Autenticação

### 1. Registro
1. Usuário escolhe o tipo de conta (cliente ou produtor)
2. Sistema valida e cria o usuário com o tipo especificado
3. Email de verificação é enviado (se necessário)

### 2. Login
1. Usuário faz login com email/senha
2. Sistema retorna o tipo de usuário junto com os dados
3. Navegação apropriada é renderizada baseada no tipo

### 3. Navegação
- **Não autenticado**: Tela de login/registro
- **Cliente**: Navegação padrão
- **Produtor**: Navegação de produtor
- **Administrador**: Navegação administrativa

## Segurança

### 1. Validação de Tipo
- Apenas tipos válidos são aceitos no registro
- Usuários não podem alterar seus próprios tipos
- Apenas administradores podem alterar tipos de usuário

### 2. Controle de Acesso
- Cada rota verifica o tipo de usuário necessário
- Produtores só podem gerenciar seus próprios eventos
- Administradores têm acesso total ao sistema

## Como Testar

### 1. Criar Usuário Produtor
```bash
# Via API
POST /auth/register
{
  "email": "produtor@teste.com",
  "password": "senha123",
  "user_type": "producer"
}
```

### 2. Criar Usuário Administrador
```bash
# Via API (ou diretamente no banco)
POST /auth/register
{
  "email": "admin@teste.com",
  "password": "senha123",
  "user_type": "admin"
}
```

### 3. Verificar Navegação
- Faça login com diferentes tipos de usuário
- Verifique se a navegação correta é renderizada
- Teste as funcionalidades específicas de cada tipo

## Próximos Passos

### 1. Funcionalidades Pendentes
- [ ] Sistema de aprovação de eventos por administradores
- [ ] Gestão avançada de usuários
- [ ] Analytics mais detalhados
- [ ] Sistema de notificações por tipo de usuário

### 2. Melhorias
- [ ] Interface para administradores alterarem tipos de usuário
- [ ] Logs de auditoria para ações administrativas
- [ ] Dashboard mais rico com gráficos interativos
- [ ] Sistema de permissões granulares

### 3. Integração
- [ ] Webhooks para eventos de mudança de tipo
- [ ] API para terceiros gerenciarem usuários
- [ ] Sistema de convites para produtores
- [ ] Integração com sistemas de pagamento por produtor

## Arquivos Modificados

### Backend
- `packages/entities/src/User.ts`
- `apps/api/src/routes/auth.ts`
- `apps/api/src/scripts/update-users-table.ts`
- `apps/api/package.json`

### Frontend
- `apps/mobile/src/context/AuthContext.tsx`
- `apps/mobile/src/services/authService.ts`
- `apps/mobile/src/screens/Register.tsx`
- `apps/mobile/src/navigation/index.tsx`
- `apps/mobile/src/navigation/ProducerNavigation.tsx`
- `apps/mobile/src/navigation/AdminNavigation.tsx`
- `apps/mobile/src/screens/ProducerDashboard.tsx`
- `apps/mobile/src/screens/ManageEvents.tsx`
- `apps/mobile/src/screens/CreateEvent.tsx`
- `apps/mobile/src/screens/EventAnalytics.tsx`
- `apps/mobile/src/screens/AdminDashboard.tsx`
- `apps/mobile/src/screens/UserManagement.tsx`
- `apps/mobile/src/screens/EventModeration.tsx`
- `apps/mobile/src/screens/SystemAnalytics.tsx`

## Conclusão

A implementação de tipos de usuário foi concluída com sucesso, permitindo que o IngressoHub suporte diferentes perfis de usuário com funcionalidades específicas. O sistema agora é mais robusto e preparado para crescer com diferentes tipos de usuários e necessidades de negócio.
