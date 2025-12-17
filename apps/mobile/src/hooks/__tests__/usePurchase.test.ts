import { renderHook, act, waitFor } from '@testing-library/react-native';
import { usePurchase } from '../usePurchase';
import { eventsService, ticketsService } from '@/services';
import { useAuth } from '@/context/AuthContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Alert } from 'react-native';
import { Event } from '@ingressohub/entities';

jest.mock('@/services');
jest.mock('@/context/AuthContext');
jest.mock('@react-navigation/native');
jest.mock('react-native', () => ({
  Alert: {
    alert: jest.fn(),
  },
}));

describe('usePurchase', () => {
  const mockNavigation = {
    navigate: jest.fn(),
    goBack: jest.fn(),
  };

  const mockRoute = {
    params: { eventId: 'event_123' },
  };

  const mockUser = {
    id: 'user_123',
    email: 'user@example.com',
    full_name: 'Test User',
    created_at: new Date().toISOString(),
    email_verified: true,
    user_type: 'client' as const,
  };

  const mockEvent: Event = {
    id: 'event_123',
    name: 'Test Event',
    date: new Date().toISOString(),
    location: 'Test Location',
    producer_id: 'producer_123',
    price: 100,
    max_tickets: 100,
    sold_tickets: 50,
    status: 'active',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useNavigation as jest.Mock).mockReturnValue(mockNavigation);
    (useRoute as jest.Mock).mockReturnValue(mockRoute);
    (useAuth as jest.Mock).mockReturnValue({ user: mockUser });
  });

  it('deve carregar evento ao inicializar', async () => {
    (eventsService.getEventById as jest.Mock).mockResolvedValue(mockEvent);

    const { result } = renderHook(() => usePurchase());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.event).toEqual(mockEvent);
    expect(eventsService.getEventById).toHaveBeenCalledWith('event_123');
  });

  it('deve atualizar informações do comprador com dados do usuário', async () => {
    (eventsService.getEventById as jest.Mock).mockResolvedValue(mockEvent);

    const { result } = renderHook(() => usePurchase());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.buyerInfo.email).toBe(mockUser.email);
    expect(result.current.buyerInfo.name).toBe(mockUser.full_name);
  });

  it('deve atualizar quantidade de ingressos selecionados', async () => {
    (eventsService.getEventById as jest.Mock).mockResolvedValue(mockEvent);

    const { result } = renderHook(() => usePurchase());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.handleTicketQuantityChange('type_1', 2);
    });

    expect(result.current.selectedTickets['type_1']).toBe(2);
  });

  it('deve calcular preço total corretamente', async () => {
    (eventsService.getEventById as jest.Mock).mockResolvedValue({
      ...mockEvent,
      ticket_types: [
        { id: 'type_1', name: 'Pista', price: 100, quantity: 50, sold: 0 },
      ],
    });

    const { result } = renderHook(() => usePurchase());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.handleTicketQuantityChange('type_1', 2);
    });

    expect(result.current.getTotalPrice()).toBe(200);
  });

  it('deve validar CPF antes de processar compra', async () => {
    (eventsService.getEventById as jest.Mock).mockResolvedValue(mockEvent);

    const { result } = renderHook(() => usePurchase());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.setBuyerInfo({
        name: 'Test',
        cpf: '00000000000',
        email: 'test@example.com',
      });
      result.current.handlePurchase();
    });

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalled();
    });
  });
});

