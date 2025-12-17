import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { Event } from '@ingressohub/entities';
import { eventsService } from '@/services';
import { Card, CardContent, Badge, Button } from '@/components/ui';
import { RootStackParamList, RootDrawerParamList } from '@/navigation';
import { useAuth } from '@/context/AuthContext';
import { DrawerNavigationProp } from '@react-navigation/drawer';

const { width } = Dimensions.get('window');

type EventDetailsNavigationProp = StackNavigationProp<RootStackParamList, 'EventDetails'>;
type EventDetailsRouteProp = RouteProp<RootStackParamList, 'EventDetails'>;

export default function EventDetails() {
  const navigation = useNavigation<EventDetailsNavigationProp>();
  const drawerNavigation = useNavigation<DrawerNavigationProp<RootDrawerParamList>>();
  const route = useRoute<EventDetailsRouteProp>();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadEvent();
  }, []);

  const loadEvent = async () => {
    const eventId = route.params?.id;
    
    if (!eventId) {
      navigation.navigate('Home');
      return;
    }

    try {
      const eventData = await eventsService.getEventById(eventId);
      setEvent(eventData);
    } catch (error) {
      console.error('Erro ao carregar evento:', error);
      Alert.alert(
        'Erro',
        'Não foi possível carregar os detalhes do evento.',
        [{ text: 'OK', onPress: () => navigation.navigate('Home') }]
      );
    }
    setLoading(false);
  };

  const getAvailableTickets = () => {
    if (!event) return 0;
    return event.max_tickets - (event.sold_tickets || 0);
  };

  const LoadingSkeleton = () => (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.loadingBackButton} />
        
        <View style={styles.loadingGrid}>
          <View style={styles.loadingImage} />
          <View style={styles.loadingInfo}>
            <View style={styles.loadingTitle} />
            <View style={styles.loadingStars} />
            
            <View style={styles.loadingCard}>
              <View style={styles.loadingCardItem} />
              <View style={styles.loadingCardItem} />
              <View style={styles.loadingCardItem} />
            </View>
            
            <View style={styles.loadingDescription} />
            <View style={styles.loadingPurchase} />
          </View>
        </View>
      </View>
    </ScrollView>
  );

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (!event) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {/* Back Button */}
        <View style={styles.backButtonContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={20} color="#8b5cf6" />
            <Text style={styles.backButtonText}>Voltar aos eventos</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.grid}>
          {/* Event Image */}
          <View style={styles.imageContainer}>
            <View style={styles.imageWrapper}>
              <Image
                source={{ 
                  uri: event.image_url || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&h=600&fit=crop'
                }}
                style={styles.eventImage}
                resizeMode="cover"
              />
              
              {getAvailableTickets() < 10 && getAvailableTickets() > 0 && (
                <Badge style={styles.badgeLastTickets}>
                  <Text style={styles.badgeText}>Últimos ingressos!</Text>
                </Badge>
              )}
              
              {getAvailableTickets() === 0 && (
                <Badge style={styles.badgeSoldOut}>
                  <Text style={styles.badgeText}>Esgotado</Text>
                </Badge>
              )}
            </View>
          </View>

          {/* Event Info */}
          <View style={styles.infoContainer}>
            <View style={styles.titleSection}>
              <Text style={styles.eventTitle}>{event.name}</Text>
              <View style={styles.starsContainer}>
                {Array(5).fill(0).map((_, i) => (
                  <Ionicons key={i} name="star" size={20} color="#fbbf24" />
                ))}
                <Text style={styles.premiumText}>Evento premium</Text>
              </View>
            </View>

            <Card style={styles.infoCard}>
              <CardContent style={styles.infoCardContent}>
                <View style={styles.infoItem}>
                  <View style={styles.infoIcon}>
                    <Ionicons name="calendar-outline" size={24} color="#ffffff" />
                  </View>
                  <View style={styles.infoText}>
                    <Text style={styles.infoLabel}>Data e horário</Text>
                    <Text style={styles.infoValue}>
                      {format(new Date(event.date), "EEEE, dd 'de' MMMM", { locale: ptBR })}
                    </Text>
                    <Text style={styles.infoTime}>
                      {format(new Date(event.date), "HH:mm")}
                    </Text>
                  </View>
                </View>

                <View style={styles.infoItem}>
                  <View style={[styles.infoIcon, { backgroundColor: '#6366f1' }]}>
                    <Ionicons name="location-outline" size={24} color="#ffffff" />
                  </View>
                  <View style={styles.infoText}>
                    <Text style={styles.infoLabel}>Local</Text>
                    <Text style={styles.infoValue}>{event.location}</Text>
                  </View>
                </View>

                <View style={styles.infoItem}>
                  <View style={[styles.infoIcon, { backgroundColor: '#3b82f6' }]}>
                    <Ionicons name="people-outline" size={24} color="#ffffff" />
                  </View>
                  <View style={styles.infoText}>
                    <Text style={styles.infoLabel}>Disponibilidade</Text>
                    <Text style={styles.infoValue}>
                      {getAvailableTickets()} ingressos disponíveis
                    </Text>
                    <Text style={styles.infoSubtext}>
                      de {event.max_tickets} totais
                    </Text>
                  </View>
                </View>
              </CardContent>
            </Card>

            <Card style={styles.descriptionCard}>
              <CardContent style={styles.descriptionContent}>
                <Text style={styles.descriptionTitle}>Descrição do Evento</Text>
                <Text style={styles.descriptionText}>
                  {event.description || 'Descrição detalhada do evento será exibida aqui.'}
                </Text>
              </CardContent>
            </Card>

            {/* Purchase Section */}
            <Card style={styles.purchaseCard}>
              <CardContent style={styles.purchaseContent}>
                <View style={styles.purchaseHeader}>
                  <View style={styles.priceContainer}>
                    <Text style={styles.priceLabel}>Valor do ingresso</Text>
                    <Text style={styles.priceValue}>
                      R$ {event.price.toFixed(2).replace('.', ',')}
                    </Text>
                  </View>
                  <View style={styles.availabilityContainer}>
                    <Text style={styles.availabilityLabel}>Disponíveis</Text>
                    <Text style={styles.availabilityValue}>{getAvailableTickets()}</Text>
                  </View>
                </View>

                <Button
                  disabled={getAvailableTickets() === 0}
                  style={styles.purchaseButton}
                  onPress={() => {
                    if (!user) {
                      Alert.alert(
                        'Entrar ou Cadastrar',
                        'Você precisa estar logado para comprar. Deseja fazer login ou cadastrar-se?',
                        [
                          { text: 'Cancelar', style: 'cancel' },
                          { text: 'Login', onPress: () => drawerNavigation.navigate('Login') },
                          { text: 'Cadastro', onPress: () => drawerNavigation.navigate('Register') },
                        ]
                      );
                      return;
                    }
                    navigation.navigate('Purchase', { eventId: event.id });
                  }}
                >
                  <Text style={styles.purchaseButtonText}>
                    {getAvailableTickets() === 0 ? 'Ingressos Esgotados' : 'Comprar Ingresso'}
                  </Text>
                </Button>
              </CardContent>
            </Card>
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
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 20,
  },
  backButtonContainer: {
    marginBottom: 24,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  backButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#8b5cf6',
  },
  grid: {
    gap: 24,
  },
  imageContainer: {
    alignItems: 'center',
  },
  imageWrapper: {
    position: 'relative',
    width: '100%',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  eventImage: {
    width: '100%',
    height: 300,
    borderRadius: 24,
  },
  badgeLastTickets: {
    position: 'absolute',
    top: 24,
    right: 24,
    backgroundColor: '#f97316',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  badgeSoldOut: {
    position: 'absolute',
    top: 24,
    right: 24,
    backgroundColor: '#6b7280',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  infoContainer: {
    gap: 24,
  },
  titleSection: {
    marginBottom: 8,
  },
  eventTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
    lineHeight: 40,
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  premiumText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#64748b',
  },
  infoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 24,
  },
  infoCardContent: {
    padding: 24,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  infoIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#8b5cf6',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  infoText: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  infoTime: {
    fontSize: 16,
    fontWeight: '500',
    color: '#8b5cf6',
  },
  infoSubtext: {
    fontSize: 14,
    color: '#64748b',
  },
  descriptionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 24,
  },
  descriptionContent: {
    padding: 24,
  },
  descriptionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  descriptionText: {
    fontSize: 18,
    color: '#64748b',
    lineHeight: 28,
  },
  purchaseCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 24,
  },
  purchaseContent: {
    padding: 24,
  },
  purchaseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  priceContainer: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  priceValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#8b5cf6',
  },
  availabilityContainer: {
    alignItems: 'flex-end',
  },
  availabilityLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  availabilityValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  purchaseButton: {
    backgroundColor: '#8b5cf6',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  purchaseButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  // Loading styles
  loadingBackButton: {
    width: 120,
    height: 40,
    backgroundColor: '#e2e8f0',
    borderRadius: 16,
    marginBottom: 24,
  },
  loadingGrid: {
    gap: 24,
  },
  loadingImage: {
    width: '100%',
    height: 300,
    backgroundColor: '#e2e8f0',
    borderRadius: 24,
  },
  loadingInfo: {
    gap: 24,
  },
  loadingTitle: {
    width: '80%',
    height: 32,
    backgroundColor: '#e2e8f0',
    borderRadius: 8,
    marginBottom: 12,
  },
  loadingStars: {
    width: 120,
    height: 20,
    backgroundColor: '#e2e8f0',
    borderRadius: 8,
  },
  loadingCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    gap: 20,
  },
  loadingCardItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingDescription: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    height: 120,
  },
  loadingPurchase: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    height: 120,
  },
});

