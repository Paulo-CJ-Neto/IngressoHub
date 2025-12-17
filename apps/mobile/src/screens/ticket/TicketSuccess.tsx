import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  Platform,
} from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

import { ticketsService } from '@/services';
import { Ticket } from '@ingressohub/entities';
import { RootStackParamList } from '@/navigation';

const { width } = Dimensions.get('window');

type TicketSuccessNavigationProp = StackNavigationProp<RootStackParamList, 'TicketSuccess'>;
type TicketSuccessRouteProp = RouteProp<RootStackParamList, 'TicketSuccess'>;

export default function TicketSuccess() {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [event, setEvent] = useState<any>(null);
  
  const navigation = useNavigation<TicketSuccessNavigationProp>();
  const route = useRoute<TicketSuccessRouteProp>();

  useEffect(() => {
    loadTicket();
  }, []);

  // Desabilitar botão de voltar quando pagamento for aprovado
  useFocusEffect(
    React.useCallback(() => {
      const paymentApproved = route.params?.paymentApproved || false;
      
      if (paymentApproved) {
        // Desabilitar gesto de voltar
        navigation.setOptions({
          gestureEnabled: false,
        });

        // Interceptar tentativa de voltar
        const unsubscribe = navigation.addListener('beforeRemove', (e) => {
          // Prevenir ação padrão de voltar
          e.preventDefault();
        });

        return () => {
          unsubscribe();
        };
      }
    }, [navigation, route.params?.paymentApproved])
  );

  const loadTicket = async () => {
    const qrCode = route.params?.qrCode;
    const ticketId = route.params?.ticketId;
    const ticketData = route.params?.ticket as Ticket | undefined;
    const paymentApproved = route.params?.paymentApproved || false;
    
    // Se já recebeu o ticket completo, usar direto
    if (ticketData) {
      setTicket(ticketData);
      await loadEvent(ticketData.event_id);
      setLoading(false);
      return;
    }
    
    // Se recebeu ticketId, buscar por ID
    if (ticketId) {
      try {
        const fetchedTicket = await ticketsService.getTicketById(ticketId);
        setTicket(fetchedTicket);
        await loadEvent(fetchedTicket.event_id);
        setLoading(false);
        return;
      } catch (error) {
        console.error("Erro ao carregar ingresso por ID:", error);
      }
    }
    
    // Se recebeu qrCode, buscar por QR Code
    if (qrCode) {
      try {
        const ticketData = await ticketsService.getTicketByQrCode(qrCode);
        if (!ticketData) {
          Alert.alert('Erro', 'Ingresso não encontrado');
          navigation.navigate('Home');
          return;
        }
        setTicket(ticketData);
        await loadEvent(ticketData.event_id);
      } catch (error) {
        console.error("Erro ao carregar ingresso:", error);
        Alert.alert('Erro', 'Erro ao carregar dados do ingresso');
        navigation.navigate('Home');
      }
      setLoading(false);
      return;
    }
    
    // Se não recebeu nenhum parâmetro
    Alert.alert('Erro', 'Dados do ingresso não encontrados');
    navigation.navigate('Home');
    setLoading(false);
  };

  const loadEvent = async (eventId: string) => {
    try {
      const { eventsService } = await import('@/services');
      const eventData = await eventsService.getEventById(eventId);
      setEvent(eventData);
    } catch (error) {
      console.error('Erro ao carregar evento:', error);
    }
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

  const generatePDF = async () => {
    if (!ticket) return;

    setGeneratingPdf(true);
    try {
      // Criar HTML do PDF
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body {
                font-family: Arial, sans-serif;
                padding: 40px;
                max-width: 600px;
                margin: 0 auto;
              }
              .header {
                text-align: center;
                border-bottom: 3px solid #8B5CF6;
                padding-bottom: 20px;
                margin-bottom: 30px;
              }
              .title {
                font-size: 28px;
                color: #1E293B;
                margin: 0;
              }
              .subtitle {
                font-size: 16px;
                color: #64748B;
                margin-top: 8px;
              }
              .ticket-info {
                background: #F8FAFC;
                padding: 20px;
                border-radius: 12px;
                margin-bottom: 20px;
              }
              .info-row {
                display: flex;
                justify-content: space-between;
                padding: 10px 0;
                border-bottom: 1px solid #E2E8F0;
              }
              .info-row:last-child {
                border-bottom: none;
              }
              .info-label {
                font-weight: 600;
                color: #64748B;
              }
              .info-value {
                color: #1E293B;
                text-align: right;
              }
              .qr-section {
                text-align: center;
                margin: 30px 0;
                padding: 20px;
                background: #FFFFFF;
                border: 2px dashed #E2E8F0;
                border-radius: 12px;
              }
              .qr-code {
                font-family: monospace;
                font-size: 12px;
                word-break: break-all;
                color: #374151;
                margin-top: 15px;
              }
              .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #E2E8F0;
                color: #64748B;
                font-size: 12px;
              }
              .status-badge {
                display: inline-block;
                padding: 4px 12px;
                background: #10B981;
                color: white;
                border-radius: 12px;
                font-size: 12px;
                font-weight: 600;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1 class="title">IngressoHub</h1>
              <p class="subtitle">Seu Ingresso</p>
            </div>
            
            <div class="ticket-info">
              <div class="info-row">
                <span class="info-label">Comprador:</span>
                <span class="info-value">${ticket.buyer_name}</span>
              </div>
              <div class="info-row">
                <span class="info-label">E-mail:</span>
                <span class="info-value">${ticket.buyer_email}</span>
              </div>
              <div class="info-row">
                <span class="info-label">CPF:</span>
                <span class="info-value">${ticket.buyer_cpf}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Quantidade:</span>
                <span class="info-value">${ticket.quantity} ingresso(s)</span>
              </div>
              <div class="info-row">
                <span class="info-label">Valor Total:</span>
                <span class="info-value">R$ ${ticket.total_price.toFixed(2).replace('.', ',')}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Status:</span>
                <span class="info-value">
                  <span class="status-badge">Válido</span>
                </span>
              </div>
            </div>
            
            <div class="qr-section">
              <h3>Código QR do Ingresso</h3>
              <div class="qr-code">${ticket.qr_code}</div>
              <p style="font-size: 12px; color: #64748B; margin-top: 10px;">
                Apresente este código na entrada do evento
              </p>
            </div>
            
            ${event ? `
            <div class="ticket-info">
              <div class="info-row">
                <span class="info-label">Evento:</span>
                <span class="info-value">${event.name}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Data:</span>
                <span class="info-value">${new Date(event.date).toLocaleDateString('pt-BR')}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Local:</span>
                <span class="info-value">${event.location}</span>
              </div>
            </div>
            ` : ''}
            
            <div class="footer">
              <p>Este documento é uma comprovação de compra do ingresso.</p>
              <p>IngressoHub - Todos os direitos reservados</p>
            </div>
          </body>
        </html>
      `;

      // Gerar PDF
      const { uri } = await Print.printToFileAsync({ html });
      
      // Verificar se pode compartilhar
      const isAvailable = await Sharing.isAvailableAsync();
      
      if (isAvailable) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Salvar ou compartilhar ingresso',
        });
      } else {
        Alert.alert('PDF gerado', `PDF salvo em: ${uri}`);
      }
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      Alert.alert('Erro', 'Não foi possível gerar o PDF. Tente novamente.');
    } finally {
      setGeneratingPdf(false);
    }
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
          <Text style={styles.successTitle}>
            {route.params?.paymentApproved ? 'Pagamento Aprovado!' : 'Compra Realizada!'}
          </Text>
          <Text style={styles.successSubtitle}>
            {route.params?.paymentApproved 
              ? 'Seu pagamento foi confirmado e seus ingressos foram liberados!'
              : 'Seu ingresso foi gerado com sucesso'}
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

          {/* Download PDF Section */}
          <View style={styles.downloadCard}>
            <View style={styles.downloadHeader}>
              <MaterialCommunityIcons name="file-download" size={24} color="#2563EB" />
              <Text style={styles.downloadTitle}>Baixar Ingresso</Text>
            </View>
            
            <View style={styles.downloadContent}>
              <Text style={styles.downloadText}>
                Baixe seu ingresso em PDF para guardar ou compartilhar
              </Text>
              
              <TouchableOpacity
                style={[styles.downloadButton, generatingPdf && styles.downloadButtonDisabled]}
                onPress={generatePDF}
                disabled={generatingPdf}
              >
                <MaterialIcons 
                  name={generatingPdf ? "hourglass-empty" : "picture-as-pdf"} 
                  size={20} 
                  color="#FFFFFF" 
                />
                <Text style={styles.downloadButtonText}>
                  {generatingPdf ? 'Gerando PDF...' : 'Baixar PDF do Ingresso'}
                </Text>
              </TouchableOpacity>
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
  downloadCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  downloadHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  downloadTitle: {
    marginLeft: 12,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  downloadContent: {
    padding: 20,
  },
  downloadText: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 16,
    lineHeight: 24,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  downloadButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  downloadButtonText: {
    marginLeft: 8,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
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

