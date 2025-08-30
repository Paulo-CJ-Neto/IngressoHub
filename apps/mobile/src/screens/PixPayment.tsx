import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Dimensions,
} from 'react-native';
import * as Clipboard from "expo-clipboard";
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { RootStackParamList } from '../navigation';

const { width } = Dimensions.get('window');

type PixPaymentNavigationProp = StackNavigationProp<RootStackParamList, 'PixPayment'>;
type PixPaymentRouteProp = RouteProp<RootStackParamList, 'PixPayment'>;

export default function PixPayment() {
  const [timeLeft, setTimeLeft] = useState(20 * 60); // 20 minutes in seconds
  const [isExpired, setIsExpired] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const navigation = useNavigation<PixPaymentNavigationProp>();
  const route = useRoute<PixPaymentRouteProp>();
  
  const { qrCode, pixCode, amount, eventName } = route.params;

  useEffect(() => {
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
  }, []);

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
      'Tem certeza que deseja cancelar o pagamento? Os ingressos serão liberados novamente.',
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
      <SafeAreaView style={styles.container}>
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
              <View style={styles.qrCode}>
                <Text style={styles.qrPlaceholder}>QR Code</Text>
                <Text style={styles.qrSubtext}>Gerado pelo Backend</Text>
              </View>
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
              <MaterialCommunityIcons name="information" size={24} color="#2563EB" />
              <Text style={styles.statusTitle}>Status do Pagamento</Text>
            </View>
            
            <View style={styles.statusContent}>
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
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleCancelPayment}
            >
              <MaterialCommunityIcons name="close-circle" size={20} color="#EF4444" />
              <Text style={styles.secondaryButtonText}>Cancelar Pagamento</Text>
            </TouchableOpacity>
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
  qrCode: {
    width: 300,
    height: 300,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
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
