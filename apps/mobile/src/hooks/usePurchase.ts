import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { Event } from '@ingressohub/entities';
import { eventsService, ticketsService } from '../services';
import { RootStackParamList, RootDrawerParamList } from '../navigation';
import { useAuth } from '../context/AuthContext';
import { validateCPF } from '../utils/formatters';
import { MOCK_TICKET_TYPES } from '../constants/ticketTypes';
import { TicketType } from '../components/TicketTypeSelector';

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
      const ticketType = MOCK_TICKET_TYPES.find(t => t.id === ticketTypeId);
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
      const pixData = {
        qrCode: 'qr_code_gerado_pelo_backend',
        pixCode: '00020126580014br.gov.bcb.pix0136123e4567-e89b-12d3-a456-426614174000520400005303986540510.005802BR5913Nome do Evento6008Local do Evento62070503***6304ABCD',
        amount: getTotalPrice(),
        eventName: event.name,
        ticketTypes: Object.entries(selectedTickets).map(([id, quantity]) => ({
          id,
          quantity
        }))
      };
      
      navigation.navigate('PixPayment', pixData);
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
    ticketTypes: MOCK_TICKET_TYPES,
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
