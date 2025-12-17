import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, TouchableWithoutFeedback } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NavigationProp, useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { eventsService } from '@/services';
import { Event } from '@ingressohub/entities';
import { useAuth } from '@/context/AuthContext';

export default function ProducerMyEvents() {
  const navigation = useNavigation<NavigationProp<any>>();
  const route = useRoute<any>();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<Event[]>([]);
  const [lastRefreshKey, setLastRefreshKey] = useState<number | null>(null);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const all = await eventsService.getAllEvents();
      setEvents(all);
    } catch (_) {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    (async () => {
      await fetchAll();
    })();
    return () => { isMounted = false; };
  }, []);

  // Recarrega quando a tela recebe foco novamente (ex: quando volta do EditEvent)
  useFocusEffect(
    useCallback(() => {
      fetchAll();
    }, [])
  );

  // Recarrega uma única vez quando "refreshKey" vier nos params
  useEffect(() => {
    const refreshKey = (route as any)?.params?.refreshKey as number | undefined;
    if (refreshKey && refreshKey !== lastRefreshKey) {
      (async () => {
        await fetchAll();
        setLastRefreshKey(refreshKey);
        // Limpa o param para evitar recargas futuras
        navigation.setParams?.({ refreshKey: undefined });
      })();
    }
  }, [route, lastRefreshKey, navigation]);

  const myEvents = useMemo(() => {
    if (!user) return [] as Event[];
    return events.filter((e) => e.producer_id === user.id);
  }, [events, user]);

  const formatDateTime = (iso: string) => {
    try {
      const d = new Date(iso);
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const yyyy = d.getFullYear();
      const hh = String(d.getHours()).padStart(2, '0');
      const min = String(d.getMinutes()).padStart(2, '0');
      return `${dd}/${mm}/${yyyy} às ${hh}:${min}`;
    } catch {
      return iso;
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#8B5CF6" />
        <Text style={{ marginTop: 12, color: '#64748B' }}>Carregando seus eventos…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Meus Eventos</Text>
        <Text style={styles.subtitle}>Gerencie e visualize seus eventos</Text>
      </View>

      <ScrollView style={styles.content}>
        {myEvents.length === 0 && (
          <View style={{ padding: 20 }}>
            <Text style={{ color: '#64748B' }}>Você ainda não criou eventos.</Text>
          </View>
        )}

        {myEvents.map((event) => (
          <TouchableWithoutFeedback
            key={event.id}
            style={styles.cardContainerRow}
            onPress={() => navigation.navigate('HomeStack', { screen: 'EventDetails', params: { id: event.id } })}
          >
            <View style={styles.eventCard}>
              <View style={styles.eventHeader}>
                <View style={styles.eventTitleContainer}>
                  <View>
                    <Text style={styles.eventName} numberOfLines={1} ellipsizeMode="tail">{event.name}</Text>
                    <Text style={styles.eventDate}>{formatDateTime(event.date)}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
                      <Ionicons name="location-outline" size={16} color="#64748B" />
                      <Text style={styles.eventLocation} numberOfLines={1} ellipsizeMode="tail">{event.location}</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={[styles.primaryButton, { backgroundColor: '#8B5CF6', alignSelf: 'flex-start', marginTop: 10 }]}
                    onPress={() => {
                      navigation.navigate('MyEventsStack', { screen: 'EditEvent', params: { eventId: event.id } });
                    }}
                  >
                    <Ionicons name="create-outline" size={18} color="#FFFFFF" />
                    <Text style={styles.primaryButtonText}>Editar</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.imageContainer}>
                  {event.image_url ? (
                    <Image
                      source={{ uri: event.image_url }}
                      style={styles.thumbnail}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.placeholder}>
                      <Ionicons name="image-outline" size={20} color="#A5B4FC" />
                    </View>
                  )}
                </View>
              </View>

            </View>
          </TouchableWithoutFeedback>
        ))}
      </ScrollView>
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
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flex: 1
  },
  cardContainerRow: {
    flex: 1,
    flexDirection: 'row'
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  eventTitleContainer: {
    flex: 1,
    paddingRight: 12,
    justifyContent: 'space-between',
  },
  eventName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  eventDate: {
    marginTop: 4,
    fontSize: 14,
    color: '#475569',
  },
  eventLocation: {
    marginLeft: 6,
    fontSize: 14,
    color: '#64748B',
  },
  imageContainer: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  thumbnail: {
    width: '100%',
    aspectRatio: 1.2,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  placeholder: {
    width: '100%',
    aspectRatio: 1.2,
    borderRadius: 8,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});


