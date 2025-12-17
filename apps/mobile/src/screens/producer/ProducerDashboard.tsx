import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { ProducerDrawerParamList } from '@/navigation/ProducerNavigation';

type ProducerDashboardNavigationProp = DrawerNavigationProp<ProducerDrawerParamList, 'ProducerDashboard'>;

export default function ProducerDashboard() {
  const navigation = useNavigation<ProducerDashboardNavigationProp>();

  // Dados mockados para demonstração
  const stats = {
    totalEvents: 12,
    activeEvents: 8,
    totalTickets: 1250,
    revenue: 'R$ 45.680,00'
  };

  const recentEvents = [
    { id: '1', name: 'Show de Rock', date: '15/12/2024', status: 'active', tickets: 150 },
    { id: '2', name: 'Festival de Jazz', date: '20/12/2024', status: 'active', tickets: 200 },
    { id: '3', name: 'Teatro Clássico', date: '10/12/2024', status: 'completed', tickets: 100 }
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard do Produtor</Text>
        <Text style={styles.subtitle}>Gerencie seus eventos e acompanhe o desempenho</Text>
      </View>

      {/* Estatísticas */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Ionicons name="calendar-outline" size={24} color="#8B5CF6" />
          <Text style={styles.statNumber}>{stats.totalEvents}</Text>
          <Text style={styles.statLabel}>Total de Eventos</Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons name="play-circle-outline" size={24} color="#10B981" />
          <Text style={styles.statNumber}>{stats.activeEvents}</Text>
          <Text style={styles.statLabel}>Eventos Ativos</Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons name="ticket-outline" size={24} color="#F59E0B" />
          <Text style={styles.statNumber}>{stats.totalTickets}</Text>
          <Text style={styles.statLabel}>Ingressos Vendidos</Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons name="trending-up-outline" size={24} color="#EF4444" />
          <Text style={styles.statNumber}>{stats.revenue}</Text>
          <Text style={styles.statLabel}>Receita Total</Text>
        </View>
      </View>

      {/* Ações Rápidas */}
      <View style={styles.actionsContainer}>
        <Text style={styles.sectionTitle}>Ações Rápidas</Text>
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('CreateEvent')}
          >
            <Ionicons name="add-circle-outline" size={32} color="#8B5CF6" />
            <Text style={styles.actionButtonText}>Criar Evento</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('ManageEvents')}
          >
            <Ionicons name="settings-outline" size={32} color="#10B981" />
            <Text style={styles.actionButtonText}>Gerenciar Eventos</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('EventAnalytics')}
          >
            <Ionicons name="analytics-outline" size={32} color="#F59E0B" />
            <Text style={styles.actionButtonText}>Ver Analytics</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Eventos Recentes */}
      <View style={styles.recentEventsContainer}>
        <Text style={styles.sectionTitle}>Eventos Recentes</Text>
        {recentEvents.map((event) => (
          <View key={event.id} style={styles.eventCard}>
            <View style={styles.eventInfo}>
              <Text style={styles.eventName}>{event.name}</Text>
              <Text style={styles.eventDate}>{event.date}</Text>
              <Text style={styles.eventTickets}>{event.tickets} ingressos</Text>
            </View>
            <View style={[
              styles.statusBadge,
              { backgroundColor: event.status === 'active' ? '#10B981' : '#6B7280' }
            ]}>
              <Text style={styles.statusText}>
                {event.status === 'active' ? 'Ativo' : 'Concluído'}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#8B5CF6',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#E2E8F0',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },
  actionsContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginTop: 8,
    textAlign: 'center',
  },
  recentEventsContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  eventCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  eventInfo: {
    flex: 1,
  },
  eventName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  eventDate: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 2,
  },
  eventTickets: {
    fontSize: 12,
    color: '#94A3B8',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
