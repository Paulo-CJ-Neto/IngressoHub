import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { ProducerDrawerParamList } from '@/navigation/ProducerNavigation';

type ManageEventsNavigationProp = DrawerNavigationProp<ProducerDrawerParamList, 'ManageEvents'>;

export default function ManageEvents() {
  const navigation = useNavigation<ManageEventsNavigationProp>();
  const [events, setEvents] = useState([
    {
      id: '1',
      name: 'Show de Rock',
      date: '15/12/2024',
      time: '20:00',
      location: 'Arena Show',
      status: 'active',
      ticketsSold: 150,
      totalTickets: 200,
      price: 'R$ 80,00'
    },
    {
      id: '2',
      name: 'Festival de Jazz',
      date: '20/12/2024',
      time: '19:30',
      location: 'Teatro Municipal',
      status: 'active',
      ticketsSold: 180,
      totalTickets: 250,
      price: 'R$ 120,00'
    },
    {
      id: '3',
      name: 'Teatro Clássico',
      date: '10/12/2024',
      time: '16:00',
      location: 'Sala de Concertos',
      status: 'completed',
      ticketsSold: 100,
      totalTickets: 100,
      price: 'R$ 60,00'
    }
  ]);

  const handleEditEvent = (eventId: string) => {
    // Navegar para tela de edição (será implementada depois)
    Alert.alert('Editar Evento', 'Funcionalidade será implementada em breve');
  };

  const handleToggleEventStatus = (eventId: string) => {
    setEvents(prevEvents => 
      prevEvents.map(event => 
        event.id === eventId 
          ? { ...event, status: event.status === 'active' ? 'paused' : 'active' }
          : event
      )
    );
  };

  const handleDeleteEvent = (eventId: string) => {
    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza que deseja excluir este evento? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            setEvents(prevEvents => prevEvents.filter(event => event.id !== eventId));
          }
        }
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10B981';
      case 'paused': return '#F59E0B';
      case 'completed': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Ativo';
      case 'paused': return 'Pausado';
      case 'completed': return 'Concluído';
      default: return 'Desconhecido';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Gerenciar Eventos</Text>
        <Text style={styles.subtitle}>Controle todos os seus eventos em um só lugar</Text>
      </View>

      <ScrollView style={styles.content}>
        {events.map((event) => (
          <View key={event.id} style={styles.eventCard}>
            <View style={styles.eventHeader}>
              <View style={styles.eventTitleContainer}>
                <Text style={styles.eventName}>{event.name}</Text>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(event.status) }
                ]}>
                  <Text style={styles.statusText}>{getStatusText(event.status)}</Text>
                </View>
              </View>
              
              <View style={styles.eventActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleEditEvent(event.id)}
                >
                  <Ionicons name="create-outline" size={20} color="#8B5CF6" />
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleToggleEventStatus(event.id)}
                >
                  <Ionicons 
                    name={event.status === 'active' ? 'pause-outline' : 'play-outline'} 
                    size={20} 
                    color="#F59E0B" 
                  />
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleDeleteEvent(event.id)}
                >
                  <Ionicons name="trash-outline" size={20} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.eventDetails}>
              <View style={styles.detailRow}>
                <Ionicons name="calendar-outline" size={16} color="#64748B" />
                <Text style={styles.detailText}>{event.date} às {event.time}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Ionicons name="location-outline" size={16} color="#64748B" />
                <Text style={styles.detailText}>{event.location}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Ionicons name="ticket-outline" size={16} color="#64748B" />
                <Text style={styles.detailText}>
                  {event.ticketsSold}/{event.totalTickets} ingressos vendidos
                </Text>
              </View>
              
              <View style={styles.detailRow}>
                <Ionicons name="cash-outline" size={16} color="#64748B" />
                <Text style={styles.detailText}>{event.price}</Text>
              </View>
            </View>

            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${(event.ticketsSold / event.totalTickets) * 100}%` }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>
                {Math.round((event.ticketsSold / event.totalTickets) * 100)}% vendido
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity 
        style={styles.fab}
        onPress={() => navigation.navigate('CreateEvent')}
      >
        <Ionicons name="add" size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
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
  content: {
    flex: 1,
    padding: 20,
  },
  eventCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  eventTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  eventName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  eventActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  eventDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#64748B',
    marginLeft: 8,
  },
  progressContainer: {
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
