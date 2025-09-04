import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Event } from '@ingressohub/entities';

interface EventHeaderProps {
  event: Event;
  getAvailableTickets: () => number;
}

export default function EventHeader({ event, getAvailableTickets }: EventHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: event.image_url || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=400&h=200&fit=crop' }}
          style={styles.eventImage}
        />
        <View style={styles.imageOverlay} />
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{getAvailableTickets()} ingressos disponíveis</Text>
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
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
});
