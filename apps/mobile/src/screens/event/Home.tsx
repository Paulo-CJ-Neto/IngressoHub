import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
// LinearGradient removed - using View with background color instead
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { Event } from '@ingressohub/entities';
import { eventsService } from '@/services';
import { RootDrawerParamList } from '@/navigation';
import { Card, CardContent, Badge, Button } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';

const { width } = Dimensions.get('window');

export default function Home() {
  const navigation = useNavigation<DrawerNavigationProp<RootDrawerParamList>>();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const { isProducer } = useAuth()
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadEvents();
  }, []);

  // Recarrega quando a tela recebe foco novamente (ex: quando volta de outra tela)
  useFocusEffect(
    useCallback(() => {
      loadEvents(true); // Carrega silenciosamente para não mostrar loading
    }, [])
  );


  const loadEvents = async (silent: boolean = false) => {
    if (!silent) {
      setLoading(true);
    }
    try {
      const data = await eventsService.getActiveEvents();
      setEvents(data);
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
      Alert.alert(
        'Erro',
        'Não foi possível carregar os eventos. Verifique sua conexão com a internet.',
        [{ text: 'OK' }]
      );
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadEvents(true);
    setRefreshing(false);
  };

  const getAvailableTickets = (event: Event) => {
    return event.max_tickets - (event.sold_tickets || 0);
  };

  const LoadingSkeleton = () => (
      <ScrollView style={styles.container} contentInsetAdjustmentBehavior="always">
        <View style={styles.heroSection}>
          <View style={styles.loadingHero}>
            <View style={styles.loadingIcon} />
            <View style={styles.loadingTitle} />
            <View style={styles.loadingSubtitle} />
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.loadingSectionTitle} />
          <View style={styles.loadingSectionLine} />

          <View style={styles.eventsGrid}>
            {Array(6).fill(0).map((_, i) => (
              <View key={i} style={styles.loadingCard}>
                <View style={styles.loadingImage} />
                <View style={styles.loadingCardContent}>
                  <View style={styles.loadingCardTitle} />
                  <View style={styles.loadingCardText} />
                  <View style={styles.loadingCardFooter}>
                    <View style={styles.loadingPrice} />
                    <View style={styles.loadingButton} />
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
  );

  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIcon}>
        <Ionicons name="calendar-outline" size={48} color="#8b5cf6" />
      </View>
      <Text style={styles.emptyTitle}>Nenhum evento disponível</Text>
      <Text style={styles.emptySubtitle}>Novos eventos serão adicionados em breve!</Text>
    </View>
  );

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Hero Section */}
        <View
          style={styles.heroSection}
        >
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => navigation.openDrawer()}
            accessibilityRole="button"
            accessibilityLabel="Abrir menu"
          >
            <Ionicons name="menu" size={22} color="#1e293b" />
          </TouchableOpacity>
          <View style={styles.heroContent}>
            <View style={styles.heroBadge}>
              <Ionicons name="sparkles" size={16} color="#8b5cf6" />
              <Text style={styles.heroBadgeText}>A melhor experiência em eventos</Text>
            </View>

            <Text style={styles.heroTitle}>
              Descubra Eventos Incríveis
            </Text>

            <Text style={styles.heroSubtitle}>
              Encontre os melhores eventos da cidade e garanta seu ingresso de forma rápida e segura
            </Text>

            {
              isProducer ? null :
                <Button
                  style={styles.ticketsButton}
                  onPress={() => navigation.navigate('MyTickets')}>
                  <Text style={styles.ticketsButtonText}>Meus Ingressos</Text>
                </Button>
            }
          </View>
        </View>

        {/* Events Section */}
        <View style={styles.content}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Eventos Disponíveis</Text>
            <View style={styles.sectionLine} />
          </View>

          {events.length === 0 ? (
            <EmptyState />
          ) : (
            <View style={styles.eventsGrid}>
              {events.map((event, index) => (
                <Card key={event.id} style={styles.eventCard}>
                  <View style={styles.imageContainer}>
                    <Image
                      source={{
                        uri: event.image_url || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=600&h=300&fit=crop'
                      }}
                      style={styles.eventImage}
                      resizeMode="cover"
                    />

                    {getAvailableTickets(event) < 10 && getAvailableTickets(event) > 0 && (
                      <Badge style={styles.badgeLastTickets}>
                        <Text style={styles.badgeText}>Últimos ingressos!</Text>
                      </Badge>
                    )}

                    {getAvailableTickets(event) === 0 && (
                      <Badge style={styles.badgeSoldOut}>
                        <Text style={styles.badgeText}>Esgotado</Text>
                      </Badge>
                    )}
                  </View>

                  <CardContent style={styles.cardContent}>
                    <Text style={styles.eventTitle}>{event.name}</Text>

                    <View style={styles.eventInfo}>
                      <View style={styles.infoRow}>
                        <Ionicons name="calendar-outline" size={20} color="#8b5cf6" />
                        <Text style={styles.infoText}>
                          {format(new Date(event.date), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                        </Text>
                      </View>

                      <View style={styles.infoRow}>
                        <Ionicons name="location-outline" size={20} color="#6366f1" />
                        <Text style={styles.infoText}>{event.location}</Text>
                      </View>

                      <View style={styles.infoRow}>
                        <Ionicons name="people-outline" size={20} color="#3b82f6" />
                        <Text style={styles.infoText}>
                          {getAvailableTickets(event)} ingressos disponíveis
                        </Text>
                      </View>
                    </View>

                    <View style={styles.cardFooter}>
                      <View style={styles.priceContainer}>
                        <Text style={styles.priceLabel}>A partir de</Text>
                        <Text style={styles.priceValue}>
                          R$ {event.price.toFixed(2).replace('.', ',')}
                        </Text>
                      </View>

                      <Button
                        disabled={getAvailableTickets(event) === 0}
                        style={styles.detailsButton}
                        onPress={() => navigation.navigate('HomeStack', { screen: 'EventDetails', params: { id: event.id } } as any)}
                      >
                        <Text style={styles.buttonText}>
                          {getAvailableTickets(event) === 0 ? 'Esgotado' : 'Ver Detalhes'}
                        </Text>
                        {getAvailableTickets(event) > 0 && (
                          <Ionicons name="arrow-forward" size={16} color="#ffffff" style={{ marginLeft: 8 }} />
                        )}
                      </Button>
                    </View>
                  </CardContent>
                </Card>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1, backgroundColor: '#f8fafc' },
  heroSection: {
    padding: 20,
    paddingTop: 110,
    paddingBottom: 40,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
  },
  menuButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 1,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 12,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  heroContent: {
    alignItems: 'center',
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 24,
  },
  heroBadgeText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#7c3aed',
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: '#1e293b',
    lineHeight: 44,
  },
  heroSubtitle: {
    fontSize: 18,
    textAlign: 'center',
    color: '#64748b',
    lineHeight: 26,
    maxWidth: 300,
  },
  ticketsButton: {
    marginTop: 16,
    backgroundColor: '#6366f1',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
  },
  ticketsButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  sectionHeader: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  sectionLine: {
    width: 60,
    height: 4,
    backgroundColor: '#8b5cf6',
    borderRadius: 2,
  },
  eventsGrid: {
    gap: 20,
  },
  eventCard: {
    marginBottom: 20,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
  },
  eventImage: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  badgeLastTickets: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#f97316',
  },
  badgeSoldOut: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#6b7280',
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  cardContent: {
    padding: 24,
  },
  eventTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
    lineHeight: 28,
  },
  eventInfo: {
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8b5cf6',
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8b5cf6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    width: 96,
    height: 96,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  // Loading styles
  loadingHero: {
    alignItems: 'center',
  },
  loadingIcon: {
    width: 64,
    height: 64,
    backgroundColor: '#e2e8f0',
    borderRadius: 16,
    marginBottom: 24,
  },
  loadingTitle: {
    width: 200,
    height: 32,
    backgroundColor: '#e2e8f0',
    borderRadius: 8,
    marginBottom: 16,
  },
  loadingSubtitle: {
    width: 300,
    height: 16,
    backgroundColor: '#e2e8f0',
    borderRadius: 8,
  },
  loadingSectionTitle: {
    width: 150,
    height: 28,
    backgroundColor: '#e2e8f0',
    borderRadius: 8,
    marginBottom: 8,
  },
  loadingSectionLine: {
    width: 60,
    height: 4,
    backgroundColor: '#e2e8f0',
    borderRadius: 2,
    marginBottom: 24,
  },
  loadingCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    marginBottom: 20,
    overflow: 'hidden',
  },
  loadingImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#e2e8f0',
  },
  loadingCardContent: {
    padding: 24,
  },
  loadingCardTitle: {
    width: '80%',
    height: 20,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
    marginBottom: 12,
  },
  loadingCardText: {
    width: '60%',
    height: 16,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
    marginBottom: 20,
  },
  loadingCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  loadingPrice: {
    width: 80,
    height: 24,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
  },
  loadingButton: {
    width: 100,
    height: 40,
    backgroundColor: '#e2e8f0',
    borderRadius: 16,
  },
});
