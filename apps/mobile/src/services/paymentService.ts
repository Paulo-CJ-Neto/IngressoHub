import api from './api';

export interface CreatePixPaymentRequest {
  userId: string;
  ticketId: string;
  eventId: string;
  amount: number; // Valor em centavos
  customerName: string;
  customerEmail: string;
  customerDocument: string; // CPF/CNPJ
  eventName: string;
}

export interface CreatePixPaymentResponse {
  success: boolean;
  payment: {
    id: string;
    userId: string;
    ticketId: string;
    eventId: string;
    amount: number;
    status: 'pending' | 'waiting_payment' | 'paid' | 'failed' | 'expired' | 'cancelled';
    pixQrCode?: string;
    pixQrCodeBase64?: string;
    pixCopyPaste?: string;
    expiresAt: string;
    createdAt: string;
    updatedAt: string;
  };
  pixQrCode: string;
  pixQrCodeBase64: string;
  pixCopyPaste: string;
  expiresAt: string;
}

export interface PaymentStatusResponse {
  success: boolean;
  payment: {
    id: string;
    status: PaymentStatus;
    [key: string]: any;
  };
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED'
}

export interface PaymentService {
  createPixPayment(request: CreatePixPaymentRequest): Promise<CreatePixPaymentResponse>;
  getPaymentStatus(paymentId: string): Promise<PaymentStatusResponse>;
}

class PaymentServiceImpl implements PaymentService {
  async createPixPayment(request: CreatePixPaymentRequest): Promise<CreatePixPaymentResponse> {
    try {
      const response = await api.post<CreatePixPaymentResponse>('/payments/pix', request);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao criar pagamento PIX:', error);
      throw new Error(
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Erro ao criar pagamento PIX'
      );
    }
  }

  async getPaymentStatus(paymentId: string): Promise<PaymentStatusResponse> {
    try {
      const response = await api.get<PaymentStatusResponse>(`/payments/${paymentId}/status`);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao consultar status do pagamento:', error);
      throw new Error(
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Erro ao consultar status do pagamento'
      );
    }
  }
}

export const paymentService = new PaymentServiceImpl();

