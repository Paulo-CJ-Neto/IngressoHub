import { TicketType } from '@/components/ticket';

export const MOCK_TICKET_TYPES: TicketType[] = [
  {
    id: 'full',
    name: 'Inteira',
    description: 'Ingresso completo para o evento',
    price: 100.00,
    original_price: 100.00,
    available_quantity: 50,
    icon: '🎫'
  },
  {
    id: 'half',
    name: 'Meia-entrada',
    description: 'Para estudantes, idosos e pessoas com deficiência',
    price: 50.00,
    discount_percentage: 50,
    original_price: 100.00,
    available_quantity: 30,
    icon: '🎓'
  },
  {
    id: 'women',
    name: 'Ingresso Mulher',
    description: 'Promoção especial para mulheres',
    price: 75.00,
    discount_percentage: 25,
    original_price: 100.00,
    available_quantity: 40,
    icon: '👩'
  },
  {
    id: 'men',
    name: 'Ingresso Homem',
    description: 'Ingresso padrão para homens',
    price: 100.00,
    original_price: 100.00,
    available_quantity: 45,
    icon: '👨'
  }
];
