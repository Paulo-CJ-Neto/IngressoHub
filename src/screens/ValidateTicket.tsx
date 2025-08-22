import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { RootDrawerParamList } from '../navigation';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card, CardContent } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { Ticket, TicketService } from '../entities/Ticket';
import { Event, EventService } from '../entities/Event';

export default function ValidateTicket() {
  const navigation = useNavigation<DrawerNavigationProp<RootDrawerParamList>>();
  const [qrCode, setQrCode] = useState('');
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [event, setEvent] = useState<Event | null>(null);
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<null | { valid: boolean; message: string; details: string }>(null);

  const validateTicket = async () => {
    if (!qrCode.trim()) {
      Alert.alert('Atenção', 'Por favor, insira o código do ingresso');
      return;
    }

    setValidating(true);
    setValidationResult(null);

    try {
      const found = await TicketService.findByQrCode(qrCode.trim());
      if (!found) {
        setValidationResult({ valid: false, message: 'Ingresso não encontrado', details: 'Código QR inválido ou inexistente' });
        setTicket(null);
        setEvent(null);
        setValidating(false);
        return;
      }

      setTicket(found);

      // Load event
      const events = await EventService.filter({ id: found.event_id });
      if (events.length > 0) setEvent(events[0]);

      if (found.status === 'used') {
        setValidationResult({
          valid: false,
          message: 'Ingresso já utilizado',
          details: found.used_at
            ? `Utilizado em: ${format(new Date(found.used_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`
            : 'Este ingresso já foi utilizado',
        });
        setValidating(false);
        return;
      }

      if (found.status === 'cancelled') {
        setValidationResult({ valid: false, message: 'Ingresso cancelado', details: 'Este ingresso foi cancelado e não é mais válido' });
        setValidating(false);
        return;
      }

      // Check event time window (assume 4h duration)
      const eventDate = events[0] ? new Date(events[0].date) : null;
      if (eventDate) {
        const now = new Date();
        const eventEnd = new Date(eventDate.getTime() + 4 * 60 * 60 * 1000);
        if (now > eventEnd) {
          setValidationResult({ valid: false, message: 'Evento já finalizado', details: 'Evento já terminou' });
          setValidating(false);
          return;
        }
      }

      setValidationResult({ valid: true, message: 'Ingresso válido!', details: 'Entrada liberada' });
    } catch (e) {
      setValidationResult({ valid: false, message: 'Erro na validação', details: 'Tente novamente em instantes' });
    }
    setValidating(false);
  };

  const markTicketAsUsed = async () => {
    if (!ticket || !validationResult?.valid) return;
    try {
      const usedAt = new Date().toISOString();
      const updated = await TicketService.update(ticket.id, { status: 'used', used_at: usedAt });
      setTicket(updated);
      setValidationResult({ valid: true, message: 'Ingresso utilizado!', details: 'Entrada confirmada com sucesso' });
    } catch (e) {
      Alert.alert('Erro', 'Erro ao confirmar entrada');
    }
  };

  const reset = () => {
    setQrCode('');
    setTicket(null);
    setEvent(null);
    setValidationResult(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => navigation.openDrawer()}
          accessibilityRole="button"
          accessibilityLabel="Abrir menu"
        >
          <Ionicons name="menu" size={22} color="#1E293B" />
        </TouchableOpacity>
        <View style={styles.headerIcon}>
          <Ionicons name="qr-code-outline" size={28} color="#FFFFFF" />
        </View>
        <Text style={styles.headerTitle}>Validar Ingresso</Text>
        <Text style={styles.headerSubtitle}>Escaneie ou digite o código do ingresso</Text>
      </View>

      {/* Form */}
      <View style={styles.content}>
        <Card>
          <CardContent>
            <Text style={styles.label}>Código QR do Ingresso</Text>
            <TextInput
              value={qrCode}
              onChangeText={setQrCode}
              placeholder="Digite o código QR"
              placeholderTextColor="#9CA3AF"
              style={styles.input}
            />
            <View style={styles.row}>
              <Button onPress={validateTicket} disabled={validating || !qrCode.trim()} style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>{validating ? 'Validando...' : 'Validar Ingresso'}</Text>
              </Button>
              <TouchableOpacity onPress={reset} style={styles.secondaryButton}>
                <Text style={styles.secondaryButtonText}>Limpar</Text>
              </TouchableOpacity>
            </View>
          </CardContent>
        </Card>

        {/* Result */}
        {validationResult && (
          <Card style={[styles.resultCard, validationResult.valid ? styles.resultValid : styles.resultInvalid]}>
            <CardContent>
              <View style={styles.center}>
                <View style={[styles.resultIcon, validationResult.valid ? styles.bgGreen : styles.bgRed]}>
                  <Ionicons name={validationResult.valid ? 'checkmark-circle' : 'close-circle'} size={40} color="#FFFFFF" />
                </View>
                <Text style={[styles.resultTitle, validationResult.valid ? styles.textGreen : styles.textRed]}>
                  {validationResult.message}
                </Text>
                <Text style={validationResult.valid ? styles.textGreenMuted : styles.textRedMuted}>
                  {validationResult.details}
                </Text>
              </View>

              {ticket && event && (
                <View style={styles.ticketDetails}>
                  <Text style={styles.detailsTitle}>Detalhes do Ingresso</Text>
                  <View style={styles.detailsGrid}>
                    <View style={styles.detailRow}>
                      <Ionicons name="calendar-outline" size={18} color="#8B5CF6" />
                      <Text style={styles.detailText}>{event.name}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Ionicons name="location-outline" size={18} color="#6366F1" />
                      <Text style={styles.detailText}>{event.location}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Ionicons name="person-outline" size={18} color="#3B82F6" />
                      <Text style={styles.detailText}>{ticket.buyer_name}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Ionicons name="pricetag-outline" size={18} color="#10B981" />
                      <Text style={styles.detailText}>{ticket.quantity} ingresso(s)</Text>
                    </View>
                  </View>

                  <View style={styles.ticketFooter}>
                    <Badge style={[styles.badge, ticket.status === 'used' ? styles.bgRed : styles.bgGreen]}>
                      <Text style={styles.badgeText}>{ticket.status === 'used' ? 'Já utilizado' : 'Válido'}</Text>
                    </Badge>
                    <Text style={styles.eventDate}>Data: {format(new Date(event.date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</Text>
                  </View>
                </View>
              )}

              {validationResult.valid && ticket?.status !== 'used' && (
                <Button onPress={markTicketAsUsed} style={styles.confirmButton}>
                  <Text style={styles.confirmButtonText}>✓ Confirmar Entrada</Text>
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    alignItems: 'center', paddingTop: 40, paddingBottom: 24, backgroundColor: '#FFFFFF',
    borderBottomWidth: 1, borderBottomColor: '#E2E8F0',
  },
  menuButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 12,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  headerIcon: { width: 56, height: 56, borderRadius: 16, backgroundColor: '#8B5CF6', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#1E293B', marginBottom: 6 },
  headerSubtitle: { fontSize: 14, color: '#64748B' },
  content: { padding: 20 },
  label: { fontSize: 16, fontWeight: '600', color: '#374151', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16, color: '#1E293B', backgroundColor: '#FFFFFF', marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  primaryButton: { flex: 1, marginRight: 12, backgroundColor: '#8B5CF6' },
  primaryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  secondaryButton: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#8B5CF6', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12 },
  secondaryButtonText: { color: '#8B5CF6', fontSize: 16, fontWeight: '600' },
  resultCard: { marginTop: 16 },
  resultValid: { backgroundColor: 'rgba(16, 185, 129, 0.06)', borderRadius: 16 },
  resultInvalid: { backgroundColor: 'rgba(239, 68, 68, 0.06)', borderRadius: 16 },
  center: { alignItems: 'center' },
  resultIcon: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  bgGreen: { backgroundColor: '#10B981' },
  bgRed: { backgroundColor: '#EF4444' },
  resultTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 4 },
  textGreen: { color: '#065F46' },
  textRed: { color: '#991B1B' },
  textGreenMuted: { color: '#059669' },
  textRedMuted: { color: '#DC2626' },
  ticketDetails: { backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 16, padding: 16, marginTop: 16 },
  detailsTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E293B', marginBottom: 12 },
  detailsGrid: { gap: 8 },
  detailRow: { flexDirection: 'row', alignItems: 'center' },
  detailText: { marginLeft: 8, fontSize: 14, color: '#374151' },
  ticketFooter: { marginTop: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  badge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  badgeText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },
  eventDate: { fontSize: 14, color: '#1E293B', fontWeight: '600' },
  confirmButton: { marginTop: 12, backgroundColor: '#10B981' },
  confirmButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});


