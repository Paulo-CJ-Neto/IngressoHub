# IngressoHub - React Native App

Um aplicativo React Native para compra de ingressos de eventos, convertido do React web.

## 🚀 Funcionalidades

- **Listagem de Eventos**: Visualize todos os eventos disponíveis
- **Detalhes do Evento**: Informações completas sobre cada evento
- **Sistema de Compra**: Interface para finalizar compra de ingressos
- **Autenticação**: Login com Google (simulado)
- **Geração de Ingressos**: QR Code único para cada ingresso
- **Pagamento PIX**: Instruções de pagamento integradas

## 📱 Telas Implementadas

1. **Home** - Lista de eventos disponíveis
2. **EventDetails** - Detalhes completos do evento
3. **Purchase** - Finalização da compra
4. **TicketSuccess** - Confirmação e detalhes do ingresso

## 🛠️ Tecnologias Utilizadas

- **React Native** - Framework principal
- **Expo** - Plataforma de desenvolvimento
- **React Navigation** - Navegação entre telas
- **TypeScript** - Tipagem estática
- **date-fns** - Manipulação de datas
- **Expo Vector Icons** - Ícones

## 📦 Instalação

1. Clone o repositório:
```bash
git clone <repository-url>
cd IngressoHub
```

2. Instale as dependências:
```bash
npm install
```

3. Execute o projeto:
```bash
npm start
```

## 🏗️ Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
├── entities/           # Entidades e serviços
│   ├── Event.ts       # Evento e EventService
│   ├── Ticket.ts      # Ingresso e TicketService
│   └── User.ts        # Usuário e UserService
├── navigation/         # Configuração de navegação
├── screens/           # Telas do aplicativo
│   ├── Home.tsx
│   ├── EventDetails.tsx
│   ├── Purchase.tsx
│   └── TicketSuccess.tsx
└── utils/             # Utilitários
```

## 🔄 Fluxo de Navegação

1. **Home** → **EventDetails** (ao clicar em um evento)
2. **EventDetails** → **Purchase** (ao clicar em "Comprar Ingresso")
3. **Purchase** → **TicketSuccess** (após finalizar compra)
4. **TicketSuccess** → **Home** (ao clicar em "Voltar ao Início")

## 📊 Entidades

### Event
- `id`: Identificador único
- `name`: Nome do evento
- `date`: Data e hora
- `location`: Local do evento
- `price`: Preço do ingresso
- `max_tickets`: Número máximo de ingressos
- `sold_tickets`: Ingressos vendidos
- `image_url`: URL da imagem
- `description`: Descrição do evento
- `status`: Status do evento (active/inactive)

### Ticket
- `id`: Identificador único
- `event_id`: ID do evento
- `buyer_name`: Nome do comprador
- `buyer_cpf`: CPF do comprador
- `buyer_email`: Email do comprador
- `quantity`: Quantidade de ingressos
- `total_price`: Preço total
- `qr_code`: Código QR único
- `status`: Status do ingresso (valid/used/cancelled)
- `created_at`: Data de criação

### User
- `id`: Identificador único
- `email`: Email do usuário
- `full_name`: Nome completo
- `avatar_url`: URL do avatar
- `created_at`: Data de criação

## 🎨 Design System

O aplicativo utiliza um design system consistente com:

- **Cores principais**: Roxo (#8B5CF6) e Índigo (#6366F1)
- **Tipografia**: Sistema de fontes hierárquico
- **Componentes**: Cards, botões, inputs padronizados
- **Espaçamento**: Sistema de grid consistente

## 🔧 Configuração

### Babel
O projeto utiliza `babel-plugin-module-resolver` para aliases de importação:
- `@/` aponta para `src/`

### TypeScript
Configurado com path mapping para melhor organização de imports.

## 📱 Executando no Dispositivo

1. Instale o Expo Go no seu dispositivo
2. Execute `npm start`
3. Escaneie o QR Code com o Expo Go

## 🧪 Dados de Teste

O aplicativo utiliza dados mockados para demonstração:
- 4 eventos pré-cadastrados
- Sistema de login simulado
- Geração de QR Codes únicos

## 🔮 Próximas Funcionalidades

- [ ] Implementar backend real
- [ ] Sistema de notificações push
- [ ] Histórico de compras
- [ ] Avaliações de eventos
- [ ] Sistema de favoritos
- [ ] Compartilhamento de eventos

## 📄 Licença

Este projeto está sob a licença MIT.
