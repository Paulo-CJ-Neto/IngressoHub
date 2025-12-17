import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useTicketValidation } from '../useTicketValidation';
import { ticketsService } from '@/services';

jest.mock('@/services');

describe('useTicketValidation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve validar ticket com sucesso', async () => {
    const qrData = JSON.stringify({ ticket_id: 'ticket_123', event_id: 'event_123' });
    
    (ticketsService.validateTicketByIds as jest.Mock).mockResolvedValue({
      status: 'valid',
      validatedAt: new Date().toISOString(),
    });

    const { result } = renderHook(() => useTicketValidation());

    await act(async () => {
      await result.current.validateTicket(qrData);
    });

    await waitFor(() => {
      expect(result.current.banner).toBeTruthy();
    });

    expect(result.current.banner?.type).toBe('valid');
    expect(result.current.banner?.message).toContain('Válido');
  });

  it('deve detectar ticket já usado', async () => {
    const qrData = JSON.stringify({ ticket_id: 'ticket_123', event_id: 'event_123' });
    
    (ticketsService.validateTicketByIds as jest.Mock).mockResolvedValue({
      status: 'already_used',
      usedAt: new Date().toISOString(),
    });

    const { result } = renderHook(() => useTicketValidation());

    await act(async () => {
      await result.current.validateTicket(qrData);
    });

    await waitFor(() => {
      expect(result.current.banner).toBeTruthy();
    });

    expect(result.current.banner?.type).toBe('invalid');
    expect(result.current.banner?.message).toContain('Já utilizado');
  });

  it('deve detectar ticket inválido', async () => {
    const qrData = JSON.stringify({ ticket_id: 'ticket_123', event_id: 'event_123' });
    
    (ticketsService.validateTicketByIds as jest.Mock).mockResolvedValue({
      status: 'invalid',
    });

    const { result } = renderHook(() => useTicketValidation());

    await act(async () => {
      await result.current.validateTicket(qrData);
    });

    await waitFor(() => {
      expect(result.current.banner).toBeTruthy();
    });

    expect(result.current.banner?.type).toBe('invalid');
    expect(result.current.banner?.message).toContain('Inválido');
  });

  it('deve ignorar QR codes duplicados rapidamente', async () => {
    const qrData = JSON.stringify({ ticket_id: 'ticket_123', event_id: 'event_123' });
    
    (ticketsService.validateTicketByIds as jest.Mock).mockResolvedValue({
      status: 'valid',
      validatedAt: new Date().toISOString(),
    });

    const { result } = renderHook(() => useTicketValidation());

    await act(async () => {
      await result.current.validateTicket(qrData);
      await result.current.validateTicket(qrData); // Duplicado imediatamente
    });

    expect(ticketsService.validateTicketByIds).toHaveBeenCalledTimes(1);
  });

  it('deve limpar banner', async () => {
    const qrData = JSON.stringify({ ticket_id: 'ticket_123', event_id: 'event_123' });
    
    (ticketsService.validateTicketByIds as jest.Mock).mockResolvedValue({
      status: 'valid',
      validatedAt: new Date().toISOString(),
    });

    const { result } = renderHook(() => useTicketValidation());

    await act(async () => {
      await result.current.validateTicket(qrData);
    });

    await waitFor(() => {
      expect(result.current.banner).toBeTruthy();
    });

    act(() => {
      result.current.clearBanner();
    });

    expect(result.current.banner).toBeNull();
  });

  it('deve tratar QR code inválido (não JSON)', async () => {
    const invalidQrData = 'invalid-qr-code';

    const { result } = renderHook(() => useTicketValidation());

    await act(async () => {
      await result.current.validateTicket(invalidQrData);
    });

    await waitFor(() => {
      expect(result.current.banner).toBeTruthy();
    });

    expect(result.current.banner?.type).toBe('invalid');
    expect(ticketsService.validateTicketByIds).not.toHaveBeenCalled();
  });
});

