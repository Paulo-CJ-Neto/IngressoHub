import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';

import { TicketService } from '../entities/Ticket';
import { Ticket } from '../entities/Ticket';
import { RootStackParamList } from '../navigation';

const { width } = Dimensions.get('window');

type TicketSuccessNavigationProp = StackNavigationProp<RootStackParamList, 'TicketSuccess'>;
type TicketSuccessRouteProp = RouteProp<RootStackParamList, 'TicketSuccess'>;

export default function TicketSuccess() {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  
  const navigation = useNavigation<TicketSuccessNavigationProp>();
  const route = useRoute<TicketSuccessRouteProp>();

  useEffect(() => {
    loadTicket();
  }, []);

  const loadTicket = async () => {
    const qrCode = route.params?.qrCode;
    
    if (!qrCode) {
      navigation.navigate('Home');
      return;
    }

    try {
      const ticketData = await TicketService.findByQrCode(qrCode);
      if (!ticketData) {
        Alert.alert('Erro', 'Ingresso não encontrado');
        navigation.navigate('Home');
        return;
      }
      setTicket(ticketData);
    } catch (error) {
      console.error("Erro ao carregar ingresso:", error);
      Alert.alert('Erro', 'Erro ao carregar dados do ingresso');
      navigation.navigate('Home');
    }
    setLoading(false);
  };

  const handleGoHome = () => {
    navigation.navigate('Home');
  };

  const handleViewTickets = () => {
    // Navigate to drawer screen from stack parent
    // We rely on the Drawer being the parent navigator
    // @ts-ignore
    navigation.getParent()?.navigate('MyTickets');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <MaterialIcons name="hourglass-empty" size={48} color="#8B5CF6" />
          <Text style={styles.loadingText}>Carregando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!ticket) return null;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Success Header */}
        <View style={styles.successHeader}>
          <View style={styles.successIcon}>
            <MaterialIcons name="check-circle" size={64} color="#10B981" />
          </View>
          <Text style={styles.successTitle}>Compra Realizada!</Text>
          <Text style={styles.successSubtitle}>
            Seu ingresso foi gerado com sucesso
          </Text>
        </View>

        <View style={styles.content}>
          {/* Ticket Card */}
          <View style={styles.ticketCard}>
            <View style={styles.ticketHeader}>
              <MaterialCommunityIcons name="ticket" size={24} color="#8B5CF6" />
              <Text style={styles.ticketTitle}>Seu Ingresso</Text>
            </View>

            <View style={styles.ticketInfo}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Código QR:</Text>
                <Text style={styles.infoValue}>{ticket.qr_code}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Comprador:</Text>
                <Text style={styles.infoValue}>{ticket.buyer_name}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>E-mail:</Text>
                <Text style={styles.infoValue}>{ticket.buyer_email}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>CPF:</Text>
                <Text style={styles.infoValue}>{ticket.buyer_cpf}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Quantidade:</Text>
                <Text style={styles.infoValue}>{ticket.quantity} ingresso(s)</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Valor Total:</Text>
                <Text style={styles.totalValue}>
                  R$ {ticket.total_price.toFixed(2).replace('.', ',')}
                </Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Status:</Text>
                <View style={styles.statusContainer}>
                  <View style={[styles.statusDot, { backgroundColor: '#10B981' }]} />
                  <Text style={styles.statusText}>Válido</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Payment Instructions */}
          <View style={styles.paymentCard}>
            <View style={styles.paymentHeader}>
              <MaterialCommunityIcons name="credit-card" size={24} color="#2563EB" />
              <Text style={styles.paymentTitle}>Instruções de Pagamento</Text>
            </View>
            
            <View style={styles.paymentContent}>
              <Text style={styles.paymentText}>
                Para finalizar sua compra, realize o pagamento via PIX:
              </Text>
              
              <View style={styles.pixInfo}>
                <Text style={styles.pixLabel}>Chave PIX:</Text>
                <Text style={styles.pixValue}>ingressohub@exemplo.com</Text>
              </View>
              
              <View style={styles.pixInfo}>
                <Text style={styles.pixLabel}>Valor:</Text>
                <Text style={styles.pixValue}>
                  R$ {ticket.total_price.toFixed(2).replace('.', ',')}
                </Text>
              </View>
              
              <Text style={styles.paymentNote}>
                Após o pagamento, seu ingresso será liberado automaticamente.
                Você receberá uma confirmação por e-mail.
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleViewTickets}
            >
              <MaterialIcons name="list" size={20} color="#FFFFFF" />
              <Text style={styles.primaryButtonText}>Ver Meus Ingressos</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleGoHome}
            >
              <MaterialIcons name="home" size={20} color="#8B5CF6" />
              <Text style={styles.secondaryButtonText}>Voltar ao Início</Text>
            </TouchableOpacity>
          </View>

          {/* Additional Info */}
          <View style={styles.additionalInfo}>
            <Text style={styles.additionalInfoTitle}>Informações Importantes</Text>
            <View style={styles.infoItem}>
              <MaterialIcons name="info" size={16} color="#6B7280" />
              <Text style={styles.infoItemText}>
                Guarde o código QR do seu ingresso. Ele será necessário para entrada no evento.
              </Text>
            </View>
            <View style={styles.infoItem}>
              <MaterialIcons name="schedule" size={16} color="#6B7280" />
              <Text style={styles.infoItemText}>
                Chegue com pelo menos 30 minutos de antecedência ao evento.
              </Text>
            </View>
            <View style={styles.infoItem}>
              <MaterialIcons name="email" size={16} color="#6B7280" />
              <Text style={styles.infoItemText}>
                Você receberá mais detalhes sobre o evento por e-mail.
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
  successHeader: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  successIcon: {
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
  },
  content: {
    padding: 20,
  },
  ticketCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  ticketHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  ticketTitle: {
    marginLeft: 12,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  ticketInfo: {
    padding: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  totalValue: {
    fontSize: 16,
    color: '#8B5CF6',
    fontWeight: 'bold',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '600',
  },
  paymentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  paymentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  paymentTitle: {
    marginLeft: 12,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  paymentContent: {
    padding: 20,
  },
  paymentText: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 16,
    lineHeight: 24,
  },
  pixInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  pixLabel: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  pixValue: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '600',
  },
  paymentNote: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
    marginTop: 12,
    lineHeight: 20,
  },
  actionButtons: {
    marginBottom: 20,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8B5CF6',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
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
    borderColor: '#8B5CF6',
    paddingVertical: 16,
    borderRadius: 12,
  },
  secondaryButtonText: {
    marginLeft: 8,
    color: '#8B5CF6',
    fontSize: 16,
    fontWeight: '600',
  },
  additionalInfo: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  additionalInfoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  infoItemText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    flex: 1,
  },
});
