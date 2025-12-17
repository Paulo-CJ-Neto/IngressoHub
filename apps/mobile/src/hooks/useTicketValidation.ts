import { useState, useRef } from 'react';
import { ticketsService } from '@/services';

interface ValidationResult {
  status: 'valid' | 'already_used' | 'invalid';
  validatedAt?: string;
  usedAt?: string;
}

interface ValidationBanner {
  type: 'valid' | 'invalid';
  message: string;
}

export function useTicketValidation() {
  const [banner, setBanner] = useState<ValidationBanner | null>(null);
  const [lastScanned, setLastScanned] = useState<string | null>(null);
  const [scanText, setScanText] = useState<string>('');
  
  const isProcessingRef = useRef(false);
  const lastScannedRef = useRef<string | null>(null);
  const nextAllowedRef = useRef<number>(0);

  const validateTicket = async (data: string): Promise<void> => {
    if (!data) return;
    
    const now = Date.now();
    if (now < nextAllowedRef.current) return;
    if (isProcessingRef.current) return;
    if (data === lastScannedRef.current) {
      nextAllowedRef.current = now + 1000;
      return;
    }

    isProcessingRef.current = true;
    setLastScanned(data);
    lastScannedRef.current = data;
    setScanText(data);

    try {
      // Espera-se um JSON simples no QR com ticket_id e event_id
      const parsed = JSON.parse(data) as { ticket_id?: string; event_id?: string };
      
      if (parsed?.ticket_id && parsed?.event_id) {
        const result = await ticketsService.validateTicketByIds({
          ticket_id: parsed.ticket_id,
          event_id: parsed.event_id,
        });
        
        if (result.status === 'valid') {
          setBanner({ 
            type: 'valid', 
            message: `✅ Válido • ${new Date(result.validatedAt).toLocaleString()}` 
          });
        } else if (result.status === 'already_used') {
          setBanner({ 
            type: 'invalid', 
            message: `❌ Já utilizado • ${new Date(result.usedAt).toLocaleString()}` 
          });
        } else {
          setBanner({ 
            type: 'invalid', 
            message: '❌ Inválido • QR Code inválido ou não pertence ao evento' 
          });
        }
      } else {
        setBanner({ 
          type: 'invalid', 
          message: '❌ Inválido • QR Code inválido e não pertence ao evento' 
        });
      }
    } catch {
      setBanner({ 
        type: 'invalid', 
        message: '❌ Inválido • QR Code inválido e não pertence ao evento' 
      });
    } finally {
      isProcessingRef.current = false;
      nextAllowedRef.current = Date.now() + 1500;
    }
  };

  const clearBanner = () => {
    setBanner(null);
  };

  return {
    banner,
    lastScanned,
    scanText,
    validateTicket,
    clearBanner
  };
}
