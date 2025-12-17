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
  abacatePayBillingId?: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, any>;
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED'
}

// Tipos para a API do AbacatePay (PIX QRCode)
export interface AbacatePayPixQrCodeRequest {
  amount: number; // Valor em centavos
  expiresIn?: number; // Tempo de expiração em segundos
  description?: string; // Descrição do pagamento (máx 140 caracteres)
  customer?: {
    name: string;
    cellphone?: string;
    email: string;
    taxId: string; // CPF/CNPJ
  };
  metadata?: {
    externalId?: string;
    userId?: string;
    eventId?: string;
    [key: string]: any;
  };
}

export interface AbacatePayPixQrCodeResponse {
  data: {
    id: string;
    amount: number;
    status: 'PENDING' | 'EXPIRED' | 'CANCELLED' | 'PAID' | 'REFUNDED';
    devMode: boolean;
    brCode: string; // Código copia-e-cola PIX
    brCodeBase64: string; // Imagem base64 do QR Code
    platformFee: number;
    createdAt: string;
    updatedAt: string;
    expiresAt: string;
  };
  error: string | null;
}

export interface AbacatePayWebhookPayload {
  type: string;
  billing: {
    id: string;
    status: string;
    integration?: {
      pix?: {
        code?: string;
        qrCodeUrl?: string;
      };
    };
  };
  customer?: {
    id?: string;
    name?: string;
    email?: string;
    taxId?: string;
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
