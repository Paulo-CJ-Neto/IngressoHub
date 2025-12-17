import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Event } from '@ingressohub/entities';
import { Card, CardContent } from '@/components/ui';

interface EventSelectorProps {
  events: Event[];
  selectedEvent: Event | null;
  onEventSelect: (event: Event) => void;
}

export function EventSelector({ events, selectedEvent, onEventSelect }: EventSelectorProps) {
  const renderEvent = ({ item }: { item: Event }) => (
    <Card style={[
      styles.eventCard, 
      selectedEvent?.id === item.id && styles.eventCardSelected
    ]}>
      <TouchableOpacity onPress={() => onEventSelect(item)}>
        <CardContent>
          <Text style={styles.eventTitle}>{item.name}</Text>
          <Text style={styles.eventDate}>
            {format(new Date(item.date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
          </Text>
          <Text style={styles.eventLocation}>{item.location}</Text>
        </CardContent>
      </TouchableOpacity>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Validação de Ingressos</Text>
      <Text style={styles.subHeader}>Selecione um evento</Text>
      
      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        renderItem={renderEvent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  subHeader: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 16,
  },
  eventCard: {
    marginBottom: 12,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  eventCardSelected: {
    borderColor: '#8B5CF6',
    backgroundColor: 'rgba(139,92,246,0.05)',
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  eventDate: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
  eventLocation: {
    fontSize: 13,
    color: '#475569',
    marginTop: 2,
  },
});
