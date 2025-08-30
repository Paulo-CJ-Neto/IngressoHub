import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';

import { Event } from '@ingressohub/entities';
import { eventsService, ticketsService } from '../services';
import { RootStackParamList, RootDrawerParamList } from '../navigation';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');

type PurchaseNavigationProp = StackNavigationProp<RootStackParamList, 'Purchase'>;
type PurchaseRouteProp = RouteProp<RootStackParamList, 'Purchase'>;

export default function Purchase() {
  const [event, setEvent] = useState<Event | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [buyerInfo, setBuyerInfo] = useState({
    name: '',
    cpf: '',
    email: ''
  });
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'credit' | 'debit'>('pix'); // Atualizado para suportar múltiplos métodos
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
      // Load event
      const eventData = await eventsService.getEventById(eventId);
      setEvent(eventData);
      // Se houver usuário autenticado, pré-preencher campos
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

  const validateCPF = (cpf: string) => {
    const cleanCPF = cpf.replace(/\D/g, '');
    return cleanCPF.length === 11;
  };

  const formatCPF = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{3})(\d{2})$/);
    if (match) {
      return `${match[1]}.${match[2]}.${match[3]}-${match[4]}`;
    }
    return value;
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

    // Se o método de pagamento for PIX, navegar para a tela de pagamento PIX
    if (paymentMethod === 'pix') {
      // Simular dados do backend (em produção, isso viria do backend)
      const pixData = {
        qrCode: 'qr_code_gerado_pelo_backend',
        pixCode: '00020126580014br.gov.bcb.pix0136123e4567-e89b-12d3-a456-426614174000520400005303986540510.005802BR5913Nome do Evento6008Local do Evento62070503***6304ABCD',
        amount: event.price * quantity,
        eventName: event.name
      };
      
      navigation.navigate('PixPayment', pixData);
      return;
    }

    // Para outros métodos de pagamento (futuro)
    setProcessing(true);
    try {
      const ticketData = {
        event_id: event.id,
        buyer_name: buyerInfo.name,
        buyer_cpf: buyerInfo.cpf.replace(/\D/g, ''),
        buyer_email: buyerInfo.email,
        quantity: quantity,
        total_price: event.price * quantity,
        status: 'valid' as const
      };

      const ticket = await ticketsService.createTicket(ticketData);
      
      // Navigate to success page with ticket info
      navigation.navigate('TicketSuccess', { qrCode: ticket.qr_code });
    } catch (error) {
      console.error("Erro ao processar compra:", error);
      Alert.alert('Erro', 'Erro ao processar compra. Tente novamente.');
    }
    setProcessing(false);
  };

  const getAvailableTickets = () => {
    if (!event) return 0;
    return event.max_tickets - (event.sold_tickets || 0);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B5CF6" />
          <Text style={styles.loadingText}>Carregando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!event) return null;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialIcons name="arrow-back" size={24} color="#374151" />
            <Text style={styles.backButtonText}>Voltar</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Finalizar Compra</Text>
        </View>

        <View style={styles.content}>
          {/* Event Summary */}
          <View style={styles.eventCard}>
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: event.image_url || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=400&h=200&fit=crop' }}
                style={styles.eventImage}
              />
              <View style={styles.imageOverlay} />
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{getAvailableTickets()} disponíveis</Text>
              </View>
            </View>
            
            <View style={styles.eventInfo}>
              <Text style={styles.eventTitle}>{event.name}</Text>
              
              <View style={styles.eventDetails}>
                <View style={styles.detailItem}>
                  <View style={[styles.dot, { backgroundColor: '#8B5CF6' }]} />
                  <Text style={styles.detailText}>
                    {format(new Date(event.date), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                  </Text>
                </View>
                <View style={styles.detailItem}>
                  <View style={[styles.dot, { backgroundColor: '#6366F1' }]} />
                  <Text style={styles.detailText}>{event.location}</Text>
                </View>
              </View>

              {/* Quantity Selector */}
              <View style={styles.quantityContainer}>
                <Text style={styles.quantityLabel}>Quantidade de ingressos</Text>
                <View style={styles.quantitySelector}>
                  <TouchableOpacity
                    style={[styles.quantityButton, quantity <= 1 && styles.quantityButtonDisabled]}
                    onPress={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <Text style={styles.quantityButtonText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.quantityValue}>{quantity}</Text>
                  <TouchableOpacity
                    style={[styles.quantityButton, quantity >= getAvailableTickets() && styles.quantityButtonDisabled]}
                    onPress={() => setQuantity(Math.min(getAvailableTickets(), quantity + 1))}
                    disabled={quantity >= getAvailableTickets()}
                  >
                    <Text style={styles.quantityButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Price Summary */}
              <View style={styles.priceContainer}>
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Valor unitário:</Text>
                  <Text style={styles.priceValue}>
                    R$ {event.price.toFixed(2).replace('.', ',')}
                  </Text>
                </View>
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Quantidade:</Text>
                  <Text style={styles.priceValue}>{quantity}</Text>
                </View>
                <View style={styles.priceRow}>
                  <Text style={styles.totalLabel}>Total:</Text>
                  <Text style={styles.totalValue}>
                    R$ {(event.price * quantity).toFixed(2).replace('.', ',')}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Purchase Form */}
          <View style={styles.formCard}>
            <View style={styles.formHeader}>
              <MaterialCommunityIcons name="cart" size={24} color="#8B5CF6" />
              <Text style={styles.formTitle}>Dados do Comprador</Text>
            </View>

            {!user && (
              <View style={styles.loginPrompt}>
                <Text style={styles.loginText}>
                  Já tem uma conta? Faça login para agilizar sua compra!
                </Text>
                <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                  <MaterialIcons name="person" size={20} color="#8B5CF6" />
                  <Text style={styles.loginButtonText}>Entrar com Google</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.formFields}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Nome completo *</Text>
                <TextInput
                  style={styles.input}
                  value={buyerInfo.name}
                  onChangeText={(text) => setBuyerInfo({...buyerInfo, name: text})}
                  placeholder="Seu nome completo"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>E-mail *</Text>
                <TextInput
                  style={[styles.input, user && styles.inputDisabled]}
                  value={buyerInfo.email}
                  onChangeText={(text) => setBuyerInfo({...buyerInfo, email: text})}
                  placeholder="seu@email.com"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="email-address"
                  editable={!user}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>CPF *</Text>
                <TextInput
                  style={styles.input}
                  value={buyerInfo.cpf}
                  onChangeText={(text) => setBuyerInfo({...buyerInfo, cpf: formatCPF(text)})}
                  placeholder="000.000.000-00"
                  placeholderTextColor="#9CA3AF"
                  maxLength={14}
                  keyboardType="numeric"
                />
              </View>

              {/* Payment Method Selector */}
              <View style={styles.paymentMethodContainer}>
                <Text style={styles.paymentMethodLabel}>Forma de Pagamento *</Text>
                
                <View style={styles.paymentMethodCard}>
                  <TouchableOpacity
                    style={[styles.paymentOption, paymentMethod === 'pix' && styles.paymentOptionSelected]}
                    onPress={() => setPaymentMethod('pix')}
                  >
                    <View style={styles.paymentOptionContent}>
                      <MaterialCommunityIcons 
                        name="qrcode-scan" 
                        size={24} 
                        color={paymentMethod === 'pix' ? '#8B5CF6' : '#9CA3AF'} 
                      />
                      <View style={styles.paymentOptionText}>
                        <Text style={[styles.paymentOptionTitle, paymentMethod === 'pix' && styles.paymentOptionTitleSelected]}>
                          PIX
                        </Text>
                        <Text style={[styles.paymentOptionSubtitle, paymentMethod === 'pix' ? styles.paymentOptionSubtitleSelected : styles.paymentOptionSubtitleDisabled]}>
                          Pagamento instantâneo
                        </Text>
                      </View>
                    </View>
                    <View style={[styles.radioButton, paymentMethod === 'pix' && styles.radioButtonSelected]}>
                      {paymentMethod === 'pix' && <View style={styles.radioButtonInner} />}
                    </View>
                  </TouchableOpacity>

                  {/* Credit Card Option */}
                  <TouchableOpacity
                    style={[styles.paymentOption, paymentMethod === 'credit' && styles.paymentOptionSelected]}
                    onPress={() => setPaymentMethod('credit')}
                    disabled={true}
                  >
                    <View style={styles.paymentOptionContent}>
                      <MaterialCommunityIcons 
                        name="credit-card" 
                        size={24} 
                        color={paymentMethod === 'credit' ? '#8B5CF6' : '#9CA3AF'} 
                      />
                      <View style={styles.paymentOptionText}>
                        <Text style={[styles.paymentOptionTitle, paymentMethod === 'credit' && styles.paymentOptionTitleSelected]}>
                          Cartão de Crédito
                        </Text>
                        <Text style={[styles.paymentOptionSubtitle, paymentMethod === 'credit' ? styles.paymentOptionSubtitleSelected : styles.paymentOptionSubtitleDisabled]}>
                          Em breve
                        </Text>
                      </View>
                    </View>
                    <View style={[styles.radioButtonDisabled, paymentMethod === 'credit' && styles.radioButtonSelected]}>
                      {paymentMethod === 'credit' && <View style={styles.radioButtonInner} />}
                    </View>
                  </TouchableOpacity>

                  {/* Debit Card Option */}
                  <TouchableOpacity
                    style={[styles.paymentOption, paymentMethod === 'debit' && styles.paymentOptionSelected]}
                    onPress={() => setPaymentMethod('debit')}
                    disabled={true}
                  >
                    <View style={styles.paymentOptionContent}>
                      <MaterialCommunityIcons 
                        name="credit-card-outline" 
                        size={24} 
                        color={paymentMethod === 'debit' ? '#8B5CF6' : '#9CA3AF'} 
                      />
                      <View style={styles.paymentOptionText}>
                        <Text style={[styles.paymentOptionTitle, paymentMethod === 'debit' && styles.paymentOptionTitleSelected]}>
                          Cartão de Débito
                        </Text>
                        <Text style={[styles.paymentOptionSubtitle, paymentMethod === 'debit' ? styles.paymentOptionSubtitleSelected : styles.paymentOptionSubtitleDisabled]}>
                          Em breve
                        </Text>
                      </View>
                    </View>
                    <View style={[styles.radioButtonDisabled, paymentMethod === 'debit' && styles.radioButtonSelected]}>
                      {paymentMethod === 'debit' && <View style={styles.radioButtonInner} />}
                    </View>
                  </TouchableOpacity>
                </View>

                {/* Payment Limitation Notice */}
                <View style={[styles.paymentNotice, { backgroundColor: '#FEF9C3', borderColor: '#FACC15' }]}>
                  <MaterialCommunityIcons name="alert-circle" size={20} color="#F59E42" />
                  <Text style={[styles.paymentNoticeText, { color: '#B45309' }]}>
                    No momento, só temos a opção de pagamento via PIX disponível. Não é possível pagar com cartão de crédito ou débito.
                  </Text>
                </View>
              </View>

              <View style={styles.paymentInfo}>
                <View style={styles.paymentHeader}>
                  <MaterialCommunityIcons 
                    name={paymentMethod === 'pix' ? 'qrcode-scan' : 'credit-card'} 
                    size={20} 
                    color={paymentMethod === 'pix' ? '#8B5CF6' : '#2563EB'} 
                  />
                  <Text style={styles.paymentTitle}>
                    Pagamento via {paymentMethod === 'pix' ? 'PIX' : paymentMethod === 'credit' ? 'Cartão de Crédito' : 'Cartão de Débito'}
                  </Text>
                </View>
                <Text style={styles.paymentText}>
                  {paymentMethod === 'pix' 
                    ? 'Após confirmar a compra, você receberá as instruções de pagamento via PIX e seu ingresso será liberado automaticamente.'
                    : 'Após confirmar a compra, você será redirecionado para a tela de pagamento seguro.'
                  }
                </Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.purchaseButton,
                  (!buyerInfo.name || !buyerInfo.email || !buyerInfo.cpf || processing) && styles.purchaseButtonDisabled
                ]}
                onPress={handlePurchase}
                disabled={processing || !buyerInfo.name || !buyerInfo.email || !buyerInfo.cpf}
              >
                {processing ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.purchaseButtonText}>
                    Finalizar Compra - R$ {(event.price * quantity).toFixed(2).replace('.', ',')}
                  </Text>
                )}
              </TouchableOpacity>

              <Text style={styles.termsText}>
                Ao finalizar a compra, você concorda com nossos termos de uso
                e política de privacidade.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748B',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  backButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  headerTitle: {
    marginLeft: 16,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  content: {
    padding: 20,
  },
  eventCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  imageContainer: {
    position: 'relative',
  },
  eventImage: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  badge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  eventInfo: {
    padding: 20,
  },
  eventTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 16,
  },
  eventDetails: {
    marginBottom: 24,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  detailText: {
    fontSize: 16,
    color: '#64748B',
  },
  quantityContainer: {
    marginBottom: 24,
  },
  quantityLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  quantityButtonDisabled: {
    opacity: 0.5,
  },
  quantityButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
  },
  quantityValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
    marginHorizontal: 20,
    minWidth: 40,
    textAlign: 'center',
  },
  priceContainer: {
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 20,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 16,
    color: '#64748B',
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8B5CF6',
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  formTitle: {
    marginLeft: 12,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  loginPrompt: {
    margin: 20,
    padding: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  loginText: {
    fontSize: 14,
    color: '#374151',
    textAlign: 'center',
    marginBottom: 12,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#8B5CF6',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  loginButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  formFields: {
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1E293B',
    backgroundColor: '#FFFFFF',
  },
  inputDisabled: {
    backgroundColor: '#F3F4F6',
    color: '#9CA3AF',
  },
  paymentMethodContainer: {
    marginBottom: 20,
  },
  paymentMethodLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  paymentMethodCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 12,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  paymentOptionSelected: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  paymentOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentOptionText: {
    marginLeft: 12,
  },
  paymentOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  paymentOptionTitleSelected: {
    color: '#8B5CF6',
  },
  paymentOptionSubtitle: {
    fontSize: 12,
    color: '#64748B',
  },
  paymentOptionSubtitleSelected: {
    color: '#8B5CF6',
  },
  paymentOptionSubtitleDisabled: {
    color: '#9CA3AF',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonDisabled: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#9CA3AF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    backgroundColor: '#8B5CF6',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
  },
  paymentOptionDisabled: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  paymentNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  paymentNoticeText: {
    marginLeft: 8,
    marginRight: 8,
    fontSize: 13,
    color: '#065F46',
    lineHeight: 18,
  },
  paymentInfo: {
    backgroundColor: '#EFF6FF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginBottom: 20,
  },
  paymentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  paymentTitle: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#1D4ED8',
  },
  paymentText: {
    fontSize: 14,
    color: '#2563EB',
    lineHeight: 20,
  },
  purchaseButton: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  purchaseButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  purchaseButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  termsText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 16,
  },
  radioButtonInnerDisabled: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#9CA3AF',
  },
});
