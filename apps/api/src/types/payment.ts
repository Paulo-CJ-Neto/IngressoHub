// Tipos para a entidade Payment
export interface Payment {
  id: string;
  userId: string;
  ticketId: string;
  eventId: string;
  amount: number;
  status: PaymentStatus;
  pixQrCode?: string;
  pixQrCodeBase64?: string;
  pixCopyPaste?: string;
  pagarmeTransactionId?: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, any>;
}

export enum PaymentStatus {
  PENDING = 'pending',
  WAITING_PAYMENT = 'waiting_payment',
  PAID = 'paid',
  FAILED = 'failed',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled'
}

// Tipos para a API do Pagar.me
export interface PagarmePixRequest {
  amount: number;
  payment_method: 'pix';
  pix_expiration_date?: string;
  customer: {
    name: string;
    email: string;
    type: 'individual' | 'company';
    document: string;
  };
  items: Array<{
    amount: number;
    description: string;
    quantity: number;
    code: string;
  }>;
  metadata?: Record<string, any>;
}

export interface PagarmePixResponse {
  id: number;
  status: string;
  amount: number;
  payment_method: 'pix';
  pix_qr_code: string;
  pix_qr_code_base64: string;
  pix_expiration_date: string;
  created_at: string;
  updated_at: string;
  customer: {
    id: number;
    name: string;
    email: string;
    type: string;
    document: string;
  };
  items: Array<{
    id: string;
    amount: number;
    description: string;
    quantity: number;
    code: string;
  }>;
  metadata?: Record<string, any>;
}

export interface PagarmeWebhookPayload {
  type: string;
  data: {
    id: number;
    status: string;
    amount: number;
    payment_method: string;
    pix_qr_code?: string;
    pix_qr_code_base64?: string;
    pix_expiration_date?: string;
    created_at: string;
    updated_at: string;
    customer: {
      id: number;
      name: string;
      email: string;
      type: string;
      document: string;
    };
    items: Array<{
      id: string;
      amount: number;
      description: string;
      quantity: number;
      code: string;
    }>;
    metadata?: Record<string, any>;
  };
}

// Tipos para as requisições da API
export interface CreatePixPaymentRequest {
  userId: string;
  ticketId: string;
  eventId: string;
  amount: number;
  customerName: string;
  customerEmail: string;
  customerDocument: string;
  eventName: string;
}

export interface CreatePixPaymentResponse {
  success: boolean;
  payment: Payment;
  pixQrCode: string;
  pixQrCodeBase64: string;
  pixCopyPaste: string;
  expiresAt: string;
}

export interface PaymentStatusResponse {
  success: boolean;
  payment: Payment;
}
