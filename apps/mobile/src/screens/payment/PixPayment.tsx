import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Dimensions,
  Image,
} from 'react-native';
import * as Clipboard from "expo-clipboard";
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { ticketsService, paymentService } from '@/services';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import QRCode from 'react-native-qrcode-svg';

import { RootStackParamList } from '@/navigation';
import { PaymentStatus } from '@/services/paymentService';

const { width } = Dimensions.get('window');

type PixPaymentNavigationProp = StackNavigationProp<RootStackParamList, 'PixPayment'>;
type PixPaymentRouteProp = RouteProp<RootStackParamList, 'PixPayment'>;

export default function PixPayment() {
  const [timeLeft, setTimeLeft] = useState(20 * 60); // 20 minutes in seconds
  const [isExpired, setIsExpired] = useState(false);
  const [copied, setCopied] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(PaymentStatus.PENDING);
  const [checkingStatus, setCheckingStatus] = useState(false);
  
  const navigation = useNavigation<PixPaymentNavigationProp>();
  const route = useRoute<PixPaymentRouteProp>();
  const { user } = useAuth();
  
  const { qrCode, pixCode, amount, eventName, paymentId, expiresAt } = route.params as any;
  const eventId = (route.params as any)?.eventId as string | undefined;
  const buyer = (route.params as any)?.buyer as { name?: string; cpf?: string; email?: string } | undefined;
  const ticketTypes = (route.params as any)?.ticketTypes as Array<{ id: string; quantity: number }> | undefined;

  const statusCheckInterval = useRef<NodeJS.Timeout | null>(null);

  // Calcular tempo restante baseado na data de expiração
  useEffect(() => {
    if (expiresAt) {
      const updateTimer = () => {
        const now = new Date().getTime();
        const expTime = new Date(expiresAt).getTime();
        const remaining = Math.max(0, Math.floor((expTime - now) / 1000));
        
        setTimeLeft(remaining);
        if (remaining === 0) {
          setIsExpired(true);
        }
      };

      updateTimer();
      const timer = setInterval(updateTimer, 1000);

      return () => clearInterval(timer);
    } else {
      // Fallback para timer de 20 minutos se não houver expiresAt
      const timer = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            setIsExpired(true);
            clearInterval(timer);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [expiresAt]);

  // Polling para verificar status do pagamento
  useEffect(() => {
    if (!paymentId ||
        paymentStatus ===  PaymentStatus.PAID || 
        paymentStatus === PaymentStatus.FAILED || 
        paymentStatus === PaymentStatus.EXPIRED || 
        paymentStatus === PaymentStatus.CANCELLED
      ) {
      return;
    }

    const checkPaymentStatus = async () => {
      if (checkingStatus) return;
      
      setCheckingStatus(true);
      try {
        const response = await paymentService.getPaymentStatus(paymentId);
        const newStatus = response.payment.status;
        
        setPaymentStatus(newStatus);

        if (newStatus === 'PAID') {
          // Pagamento confirmado - criar tickets e navegar para sucesso
          await handlePaymentSuccess();
          if (statusCheckInterval.current) {
            clearInterval(statusCheckInterval.current);
            statusCheckInterval.current = null;
          }
        } else if (newStatus === PaymentStatus.EXPIRED || newStatus === PaymentStatus.FAILED || newStatus === PaymentStatus.CANCELLED) {
          // Pagamento expirado/falhou - parar polling
          if (statusCheckInterval.current) {
            clearInterval(statusCheckInterval.current);
            statusCheckInterval.current = null;
          }
        }
      } catch (error) {
        console.error('Erro ao verificar status do pagamento:', error);
      } finally {
        setCheckingStatus(false);
      }
    };

    // Verificar imediatamente
    checkPaymentStatus();

    // Verificar a cada 5 segundos
    statusCheckInterval.current = setInterval(checkPaymentStatus, 5000);

    return () => {
      if (statusCheckInterval.current) {
        clearInterval(statusCheckInterval.current);
        statusCheckInterval.current = null;
      }
    };
  }, [paymentId, paymentStatus]);

  const handlePaymentSuccess = async () => {
    try {
      if (!eventId || !buyer) {
        Alert.alert('Erro', 'Dados insuficientes para criar tickets.');
        return;
      }

      const totalQuantity = (ticketTypes || []).reduce((sum, t) => sum + (t.quantity || 0), 0) || 1;
      const payload = {
        eventId,
        buyer: {
          name: buyer.name || user?.full_name || 'Cliente',
          cpf: buyer.cpf || '',
          email: buyer.email || user?.email || '',
        },
        quantity: totalQuantity,
        totalPrice: amount || 0,
      };

      const result = await ticketsService.createTicketSimple(payload);
      
      // Navegar direto para tela de sucesso sem alerta
      // Usar replace para impedir voltar à tela de pagamento
      navigation.replace('TicketSuccess', { 
        ticket: result.ticket,
        ticketId: result.ticket.id,
        qrCode: result.qrPayload,
        paymentApproved: true,
      });
    } catch (error) {
      console.error('Erro ao criar tickets após pagamento:', error);
      Alert.alert(
        'Pagamento Confirmado',
        'Seu pagamento foi confirmado! Os ingressos serão liberados em breve.',
        [{ text: 'OK', onPress: () => navigation.navigate('MyTickets' as any) }]
      );
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleCopyPixCode = async () => {
    try {
      await Clipboard.setStringAsync(pixCode);
      setCopied(true);
      
      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível copiar o código PIX.');
    }
  };

  const handlePaymentConfirmed = () => {
    Alert.alert(
      'Pagamento Confirmado',
      'Seu pagamento foi confirmado! Você será redirecionado para a tela de sucesso.',
      [
        {
          text: 'OK',
          onPress: () => navigation.navigate('TicketSuccess', { qrCode: qrCode })
        }
      ]
    );
  };

  const handleCancelPayment = () => {
    Alert.alert(
      'Cancelar Pagamento',
      'Tem certeza que deseja cancelar o pagamento?',
      [
        {
          text: 'Não',
          style: 'cancel'
        },
        {
          text: 'Sim',
          style: 'destructive',
          onPress: () => navigation.goBack()
        }
      ]
    );
  };

  if (isExpired) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.expiredContainer}>
          <MaterialCommunityIcons name="clock-alert" size={80} color="#EF4444" />
          <Text style={styles.expiredTitle}>Tempo Expirado</Text>
          <Text style={styles.expiredText}>
            O tempo para pagamento expirou. Os ingressos foram liberados novamente.
          </Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.primaryButtonText}>Voltar para Compra</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => handleCancelPayment()}
          >
            <MaterialIcons name="arrow-back" size={24} color="#374151" />
            <Text style={styles.backButtonText}>Voltar</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Pagamento PIX</Text>
        </View>

        <View style={styles.content}>
          {/* Timer Section */}
          <View style={styles.timerContainer}>
            <LinearGradient
              colors={['#8B5CF6', '#6366F1']}
              style={styles.timerGradient}
            >
              <MaterialCommunityIcons name="clock-outline" size={32} color="#FFFFFF" />
              <Text style={styles.timerLabel}>Tempo Restante</Text>
              <Text style={styles.timerValue}>{formatTime(timeLeft)}</Text>
              <Text style={styles.timerSubtext}>
                Após este tempo, os ingressos serão liberados novamente
              </Text>
            </LinearGradient>
          </View>

          {/* Event Info */}
          <View style={styles.eventCard}>
            <View style={styles.eventHeader}>
              <MaterialCommunityIcons name="ticket" size={24} color="#8B5CF6" />
              <Text style={styles.eventTitle}>{eventName}</Text>
            </View>
            <View style={styles.amountContainer}>
              <Text style={styles.amountLabel}>Valor a Pagar:</Text>
              <Text style={styles.amountValue}>R$ {amount.toFixed(2).replace('.', ',')}</Text>
            </View>
          </View>

          {/* QR Code Section */}
          <View style={styles.qrCard}>
            <View style={styles.qrHeader}>
              <MaterialCommunityIcons name="qrcode-scan" size={24} color="#8B5CF6" />
              <Text style={styles.qrTitle}>Escaneie o QR Code</Text>
            </View>
            
            <View style={styles.qrContainer}>
              {qrCode && qrCode.startsWith('data:image') ? (
                // Se for base64 data URL, usar Image
                <Image 
                  source={{ uri: qrCode }} 
                  style={styles.qrCodeImage}
                  resizeMode="contain"
                />
              ) : pixCode ? (
                // Se não tiver imagem, gerar QR code do código PIX
                <View style={styles.qrCodeWrapper}>
                  <QRCode
                    value={pixCode}
                    size={280}
                    backgroundColor="#FFFFFF"
                    color="#000000"
                  />
                </View>
              ) : (
                <View style={styles.qrCode}>
                  <Text style={styles.qrPlaceholder}>QR Code</Text>
                  <Text style={styles.qrSubtext}>Carregando...</Text>
                </View>
              )}
            </View>

            <Text style={styles.qrInstructions}>
              Abra o app do seu banco e escaneie o QR Code acima para realizar o pagamento
            </Text>
          </View>

          {/* PIX Code Section */}
          <View style={styles.pixCodeCard}>
            <View style={styles.pixCodeHeader}>
              <MaterialCommunityIcons name="content-copy" size={24} color="#8B5CF6" />
              <Text style={styles.pixCodeTitle}>Código PIX (Copia e Cola)</Text>
            </View>
            
            <View style={styles.pixCodeContainer}>
              <Text style={styles.pixCode} numberOfLines={3}>
                {pixCode}
              </Text>
              <TouchableOpacity
                style={[styles.copyButton, copied && styles.copyButtonCopied]}
                onPress={handleCopyPixCode}
              >
                <MaterialIcons 
                  name={copied ? "check" : "content-copy"} 
                  size={20} 
                  color={copied ? "#FFFFFF" : "#8B5CF6"} 
                />
                <Text style={[styles.copyButtonText, copied && styles.copyButtonTextCopied]}>
                  {copied ? 'Copiado!' : 'Copiar'}
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.pixCodeInstructions}>
              Copie o código acima e cole no app do seu banco para pagar via PIX
            </Text>
          </View>

          {/* Payment Status */}
          <View style={styles.statusCard}>
            <View style={styles.statusHeader}>
              <MaterialCommunityIcons 
                name={
                  paymentStatus === PaymentStatus.PAID ? 'check-circle' : 
                  paymentStatus === PaymentStatus.FAILED || paymentStatus === PaymentStatus.EXPIRED ? 'alert-circle' :
                  'information'
                } 
                size={24} 
                color={
                  paymentStatus === PaymentStatus.PAID ? '#10B981' : 
                  paymentStatus === PaymentStatus.FAILED || paymentStatus === PaymentStatus.EXPIRED ? '#EF4444' :
                  '#2563EB'
                } 
              />
              <Text style={styles.statusTitle}>Status do Pagamento</Text>
            </View>
            
            <View style={styles.statusContent}>
              {paymentStatus === PaymentStatus.PAID && (
                <View style={styles.statusItem}>
                  <View style={[styles.statusDot, { backgroundColor: '#10B981' }]} />
                  <Text style={styles.statusText}>
                    ✅ Pagamento confirmado! Seus ingressos foram liberados.
                  </Text>
                </View>
              )}
              {(paymentStatus === PaymentStatus.PENDING) && (
                <>
                  <View style={styles.statusItem}>
                    <View style={[styles.statusDot, { backgroundColor: '#F59E0B' }]} />
                    <Text style={styles.statusText}>
                      Aguardando confirmação do pagamento...
                    </Text>
                  </View>
                  <View style={styles.statusItem}>
                    <View style={[styles.statusDot, { backgroundColor: '#10B981' }]} />
                    <Text style={styles.statusText}>
                      Ingressos serão liberados automaticamente após confirmação
                    </Text>
                  </View>
                </>
              )}
              {(paymentStatus === PaymentStatus.FAILED || paymentStatus === PaymentStatus.EXPIRED || paymentStatus === PaymentStatus.CANCELLED) && (
                <View style={styles.statusItem}>
                  <View style={[styles.statusDot, { backgroundColor: '#EF4444' }]} />
                  <Text style={styles.statusText}>
                    {paymentStatus === PaymentStatus.EXPIRED ? 'Pagamento expirado.' : 
                     paymentStatus === PaymentStatus.CANCELLED ? 'Pagamento cancelado.' : 
                     'Pagamento falhou.'} Por favor, tente novamente.
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            {paymentStatus === PaymentStatus.PAID && (
              <TouchableOpacity
                style={[styles.primaryButton, { backgroundColor: '#10B981' }]}
                onPress={() => navigation.navigate('MyTickets' as any)}
              >
                <MaterialCommunityIcons name="check-circle" size={20} color="#FFFFFF" />
                <Text style={styles.primaryButtonText}>Ver Meus Ingressos</Text>
              </TouchableOpacity>
            )}
            {paymentStatus !== PaymentStatus.PAID && (
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={handleCancelPayment}
              >
                <MaterialCommunityIcons name="close-circle" size={20} color="#EF4444" />
                <Text style={styles.secondaryButtonText}>Cancelar Pagamento</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Important Notes */}
          <View style={styles.notesCard}>
            <View style={styles.notesHeader}>
              <MaterialCommunityIcons name="alert-circle" size={20} color="#F59E0B" />
              <Text style={styles.notesTitle}>Importante</Text>
            </View>
            <Text style={styles.notesText}>
              • Mantenha esta tela aberta até confirmar o pagamento{'\n'}
              • O tempo limite é de 20 minutos{'\n'}
              • Após o pagamento, aguarde a confirmação automática{'\n'}
              • Em caso de problemas, entre em contato com o suporte
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
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
  timerContainer: {
    marginBottom: 20,
  },
  timerGradient: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  timerLabel: {
    fontSize: 16,
    color: '#FFFFFF',
    marginTop: 12,
    marginBottom: 8,
  },
  timerValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  timerSubtext: {
    fontSize: 14,
    color: '#E0E7FF',
    textAlign: 'center',
    lineHeight: 20,
  },
  eventCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  eventTitle: {
    marginLeft: 12,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  amountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  amountLabel: {
    fontSize: 16,
    color: '#64748B',
  },
  amountValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B5CF6',
  },
  qrCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  qrHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  qrTitle: {
    marginLeft: 12,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  qrContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  qrCodeWrapper: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  qrCode: {
    width: 300,
    height: 300,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    borderRadius: 12,
  },
  qrCodeImage: {
    width: 300,
    height: 300,
    borderRadius: 12,
  },
  qrPlaceholder: {
    fontSize: 18,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  qrSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
  },
  qrInstructions: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
  },
  pixCodeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  pixCodeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  pixCodeTitle: {
    marginLeft: 12,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  pixCodeContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  pixCode: {
    fontSize: 14,
    color: '#374151',
    fontFamily: 'monospace',
    lineHeight: 20,
    marginBottom: 12,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#8B5CF6',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  copyButtonCopied: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  copyButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  copyButtonTextCopied: {
    color: '#FFFFFF',
  },
  pixCodeInstructions: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusTitle: {
    marginLeft: 12,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  statusContent: {
    gap: 12,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  statusText: {
    fontSize: 14,
    color: '#64748B',
    flex: 1,
  },
  actionButtons: {
    gap: 12,
    marginBottom: 20,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8B5CF6',
    paddingVertical: 16,
    borderRadius: 12,
  },
  primaryButtonText: {
    marginLeft: 8,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EF4444',
    paddingVertical: 16,
    borderRadius: 12,
  },
  secondaryButtonText: {
    marginLeft: 8,
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '600',
  },
  notesCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  notesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  notesTitle: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#92400E',
  },
  notesText: {
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
  },
  expiredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  expiredTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
    marginTop: 20,
    marginBottom: 12,
  },
  expiredText: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
});
