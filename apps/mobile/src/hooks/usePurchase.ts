import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { Event } from '@ingressohub/entities';
import { eventsService, ticketsService, paymentService } from '@/services';
import { RootStackParamList, RootDrawerParamList } from '@/navigation';
import { useAuth } from '@/context/AuthContext';
import { validateCPF } from '@/utils/formatters';
import { TicketType } from '@/components/ticket';

type PurchaseNavigationProp = StackNavigationProp<RootStackParamList, 'Purchase'>;
type PurchaseRouteProp = RouteProp<RootStackParamList, 'Purchase'>;

interface BuyerInfo {
  name: string;
  cpf: string;
  email: string;
}

export function usePurchase() {
  const [event, setEvent] = useState<Event | null>(null);
  const [selectedTickets, setSelectedTickets] = useState<{[key: string]: number}>({});
  const [buyerInfo, setBuyerInfo] = useState<BuyerInfo>({
    name: '',
    cpf: '',
    email: ''
  });
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'credit' | 'debit'>('pix');
  
  const { user } = useAuth();
  const navigation = useNavigation<PurchaseNavigationProp>();
  const drawerNavigation = useNavigation<DrawerNavigationProp<RootDrawerParamList>>();
  const route = useRoute<PurchaseRouteProp>();

  useEffect(() => {
    loadEventAndUser();
  }, []);

  useEffect(() => {
    if (user) {
      setBuyerInfo(prev => ({
        ...prev,
        name: user.full_name || prev.name,
        email: user.email || prev.email
      }));
    }
  }, [user]);

  const loadEventAndUser = async () => {
    const eventId = route.params?.eventId;
    
    if (!eventId) {
      navigation.goBack();
      return;
    }

    try {
      const eventData = await eventsService.getEventById(eventId);
      setEvent(eventData);
      
      if (user) {
        setBuyerInfo(prev => ({
          ...prev,
          name: user.full_name || '',
          email: user.email || ''
        }));
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      Alert.alert('Erro', 'Não foi possível carregar os dados do evento.');
      navigation.goBack();
    }
    setLoading(false);
  };

  const mapEventTicketTypesToUI = (): TicketType[] => {
    if (!event || !Array.isArray(event.ticket_types)) return [];
    return event.ticket_types.map((type, index) => {
      const safeName = type.name || `Tipo ${index + 1}`;
      const generatedId = `${event.id || 'event'}_type_${index}_${safeName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
      const id = type.id || generatedId;
      const available_quantity = Math.max(0, (type.quantity || 0) - (type.sold || 0));
      const { price, original_price, discount_percentage } = mapPriceToUI(Number(type.price || 0));
      return {
        id,
        name: safeName,
        description: 'Ingresso',
        price,
        original_price,
        discount_percentage,
        available_quantity,
        icon: pickIconByName(safeName),
      } as TicketType;
    });
  };

  const handleLogin = () => {
    drawerNavigation.navigate('Login');
  };

  const handleTicketQuantityChange = (ticketTypeId: string, newQuantity: number) => {
    setSelectedTickets(prev => {
      const updated = { ...prev };
      if (newQuantity <= 0) {
        delete updated[ticketTypeId];
      } else {
        updated[ticketTypeId] = newQuantity;
      }
      return updated;
    });
  };

  const getTotalPrice = () => {
    return Object.entries(selectedTickets).reduce((total, [ticketTypeId, quantity]) => {
      const ticketType = mapEventTicketTypesToUI().find(t => t.id === ticketTypeId);
      return total + (ticketType ? ticketType.price * quantity : 0);
    }, 0);
  };

  const getTotalTickets = () => {
    return Object.values(selectedTickets).reduce((total, quantity) => total + quantity, 0);
  };

  const hasSelectedTickets = () => {
    return Object.keys(selectedTickets).length > 0;
  };

  const getAvailableTicketsForType = (ticketType: TicketType) => {
    if (!event) return 0;
    const maxAvailable = event.max_tickets - (event.sold_tickets || 0);
    return Math.min(ticketType.available_quantity, maxAvailable);
  };

  const getAvailableTickets = () => {
    if (!event) return 0;
    return event.max_tickets - (event.sold_tickets || 0);
  };

  const handlePurchase = async () => {
    if (!buyerInfo.name || !buyerInfo.cpf || !buyerInfo.email) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }

    if (!validateCPF(buyerInfo.cpf)) {
      Alert.alert('Erro', 'CPF inválido');
      return;
    }

    if (!event) return;

    if (paymentMethod === 'pix') {
      setProcessing(true);
      try {
        // Gerar um ticketId temporário (será usado para referenciar os tickets após pagamento)
        const temporaryTicketId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Criar pagamento PIX
        const paymentResponse = await paymentService.createPixPayment({
          userId: user?.id || 'anonymous',
          ticketId: temporaryTicketId,
          eventId: event.id,
          amount: Math.round(getTotalPrice() * 100), // Converter para centavos
          customerName: buyerInfo.name,
          customerEmail: buyerInfo.email,
          customerDocument: buyerInfo.cpf.replace(/\D/g, ''), // Remove formatação
          eventName: event.name,
        });

        // Navegar para tela de pagamento PIX com os dados reais
        navigation.navigate('PixPayment', {
          paymentId: paymentResponse.payment.id,
          qrCode: paymentResponse.pixQrCodeBase64, // Imagem base64 do QR Code
          pixCode: paymentResponse.pixCopyPaste, // Código copia-e-cola
          amount: getTotalPrice(),
          eventName: event.name,
          eventId: event.id,
          buyer: {
            name: buyerInfo.name,
            cpf: buyerInfo.cpf.replace(/\D/g, ''),
            email: buyerInfo.email,
          },
          ticketTypes: Object.entries(selectedTickets).map(([id, quantity]) => ({
            id,
            quantity
          })),
          expiresAt: paymentResponse.expiresAt,
        });
      } catch (error: any) {
        console.error("Erro ao criar pagamento PIX:", error);
        Alert.alert(
          'Erro ao criar pagamento', 
          error.message || 'Não foi possível criar o pagamento PIX. Tente novamente.'
        );
      } finally {
        setProcessing(false);
      }
      return;
    }

    setProcessing(true);
    try {
      const ticketData = {
        event_id: event.id,
        buyer_name: buyerInfo.name,
        buyer_cpf: buyerInfo.cpf.replace(/\D/g, ''),
        buyer_email: buyerInfo.email,
        quantity: getTotalTickets(),
        total_price: getTotalPrice(),
        status: 'valid' as const,
        ticket_types: Object.entries(selectedTickets).map(([id, quantity]) => ({
          ticket_type_id: id,
          quantity: quantity
        }))
      };

      const ticket = await ticketsService.createTicket(ticketData);
      navigation.navigate('TicketSuccess', { qrCode: ticket.qr_code });
    } catch (error) {
      console.error("Erro ao processar compra:", error);
      Alert.alert('Erro', 'Erro ao processar compra. Tente novamente.');
    }
    setProcessing(false);
  };

  return {
    event,
    selectedTickets,
    buyerInfo,
    loading,
    processing,
    paymentMethod,
    user,
    ticketTypes: mapEventTicketTypesToUI(),
    setBuyerInfo,
    setPaymentMethod,
    handleLogin,
    handleTicketQuantityChange,
    getTotalPrice,
    getTotalTickets,
    hasSelectedTickets,
    getAvailableTicketsForType,
    getAvailableTickets,
    handlePurchase,
    navigation,
  };
}
function mapPriceToUI(price: number): { price: number; original_price: number; discount_percentage?: number } {
  // Sem descontos dinâmicos por enquanto; usa o mesmo preço como original
  return { price, original_price: price };
}

function pickIconByName(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes('vip')) return '⭐';
  if (lower.includes('camarote')) return '🥂';
  if (lower.includes('pista')) return '🎫';
  return '🎟️';
}
