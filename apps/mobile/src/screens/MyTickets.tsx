import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { Card, CardContent } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { Event, EventService } from '../entities/Event';
import { Ticket, TicketService } from '../entities/Ticket';
import { User, UserService } from '../entities/User';
import { RootDrawerParamList } from '../navigation';
import { SafeAreaView } from 'react-native-safe-area-context';

type MyTicketsNavigationProp = DrawerNavigationProp<RootDrawerParamList, 'MyTickets'>;

interface TicketWithEvent extends Ticket {
  event?: Event;
}

export default function MyTickets() {
  const navigation = useNavigation<MyTicketsNavigationProp>();
  const [user, setUser] = useState<User | null>(null);
  const [tickets, setTickets] = useState<TicketWithEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingLogin, setLoadingLogin] = useState(false);

  useEffect(() => {
    loadUserAndTickets();
  }, []);

  const loadUserAndTickets = async () => {
    setLoading(true);
    try {
      const currentUser = await UserService.me();
      setUser(currentUser);

      const userTickets = await TicketService.findByBuyerEmail(currentUser.email);
      const withEvents = await attachEvents(userTickets);
      setTickets(withEvents);
    } catch (error) {
      setUser(null);
    }
    setLoading(false);
  };

  const attachEvents = async (ticketList: Ticket[]): Promise<TicketWithEvent[]> => {
    const uniqueEventIds = Array.from(new Set(ticketList.map(t => t.event_id)));
    const eventsById: Record<string, Event> = {};

    await Promise.all(
      uniqueEventIds.map(async (id) => {
        const result = await EventService.filter({ id });
        if (result.length > 0) {
          eventsById[id] = result[0];
        }
      })
    );

    return ticketList.map(t => ({ ...t, event: eventsById[t.event_id] }));
  };

  const handleLogin = async () => {
    setLoadingLogin(true);
    try {
      await UserService.loginWithRedirect();
      const currentUser = await UserService.me();
      setUser(currentUser);
      const userTickets = await TicketService.findByBuyerEmail(currentUser.email);
      const withEvents = await attachEvents(userTickets);
      setTickets(withEvents);
    } catch (e) {
      // ignore
    }
    setLoadingLogin(false);
  };

  const getStatusBadge = (ticket: TicketWithEvent) => {
    const event = ticket.event;
    if (ticket.status === 'used') {
      return <Badge style={[styles.badge, { backgroundColor: '#10B981' }] as StyleProp<ViewStyle>}><Text style={styles.badgeText}>Utilizado</Text></Badge>;
    }
    if (event && new Date(event.date) < new Date()) {
      return <Badge style={[styles.badge, { backgroundColor: '#6B7280' }] as StyleProp<ViewStyle>}><Text style={styles.badgeText}>Expirado</Text></Badge>;
    }
    return <Badge style={[styles.badge, { backgroundColor: '#8B5CF6' }] as StyleProp<ViewStyle>}><Text style={styles.badgeText}>Válido</Text></Badge>;
  };

  if (loading) {
    return (
      <View style={styles.containerCentered}>
        <ActivityIndicator size="large" color="#8B5CF6" />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.containerCentered}>
        <Card style={styles.authCard}>
          <CardContent style={styles.authCardContent}>
            <View style={styles.authIconWrapper}>
              <Ionicons name="person-circle" size={48} color="#FFFFFF" />
            </View>
            <Text style={styles.authTitle}>Entre na sua conta</Text>
            <Text style={styles.authSubtitle}>Faça login para ver seus ingressos comprados</Text>
            <Button onPress={handleLogin} style={styles.authPrimaryButton}>
              {loadingLogin ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.authPrimaryButtonText}>Entrar com Google</Text>
              )}
            </Button>
            <TouchableOpacity style={styles.authSecondaryButton} onPress={() => navigation.navigate('HomeStack')}>
              <Text style={styles.authSecondaryButtonText}>Voltar aos eventos</Text>
            </TouchableOpacity>
          </CardContent>
        </Card>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
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
        <Text style={styles.headerTitle}>Meus Ingressos</Text>
        <Text style={styles.headerSubtitle}>Gerencie todos os seus ingressos em um só lugar</Text>
      </View>

      <View style={styles.content}>
        {tickets.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIcon}>
              <Ionicons name="qr-code-outline" size={48} color="#9CA3AF" />
            </View>
            <Text style={styles.emptyTitle}>Nenhum ingresso encontrado</Text>
            <Text style={styles.emptySubtitle}>Você ainda não comprou nenhum ingresso</Text>
            <Button style={styles.primaryCta} onPress={() => navigation.navigate('HomeStack')}>
              <Text style={styles.primaryCtaText}>Explorar Eventos</Text>
            </Button>
          </View>
        ) : (
          <View style={styles.list}>
            {tickets.map((ticket) => {
              if (!ticket.event) return null;
              const event = ticket.event;
              return (
                <Card key={ticket.id} style={styles.ticketCard}>
                  <View style={styles.ticketRow}>
                    <Image
                      source={{ uri: event.image_url || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=300&h=200&fit=crop' }}
                      style={styles.ticketImage}
                    />
                    <CardContent style={styles.ticketContent}>
                      <View style={styles.ticketHeaderRow}>
                        <Text style={styles.eventName}>{event.name}</Text>
                        {getStatusBadge(ticket)}
                      </View>

                      <View style={styles.infoRow}>
                        <Ionicons name="calendar-outline" size={18} color="#8B5CF6" />
                        <Text style={styles.infoText}>
                          {format(new Date(event.date), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                        </Text>
                      </View>

                      <View style={styles.infoRow}>
                        <Ionicons name="location-outline" size={18} color="#6366F1" />
                        <Text style={styles.infoText}>{event.location}</Text>
                      </View>

                      <View style={styles.footerRow}>
                        <View>
                          <Text style={styles.priceLabel}>Valor pago</Text>
                          <Text style={styles.priceValue}>R$ {ticket.total_price.toFixed(2).replace('.', ',')}</Text>
                        </View>
                        <Button style={styles.detailsButton} onPress={() => navigation.navigate('HomeStack', { screen: 'EventDetails', params: { id: event.id } } as any)}>
                          <Text style={styles.detailsButtonText}>Ver Evento</Text>
                          <Ionicons name="chevron-forward" size={16} color="#FFFFFF" style={{ marginLeft: 6 }} />
                        </Button>
                      </View>
                    </CardContent>
                  </View>
                </Card>
              );
            })}
          </View>
        )}
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
  containerCentered: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748B',
  },
  header: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 24,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
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
  headerIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748B',
  },
  content: {
    padding: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  primaryCta: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  primaryCtaText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  list: {
    gap: 16,
  },
  ticketCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
  },
  ticketRow: {
    flexDirection: 'row',
  },
  ticketImage: {
    width: 120,
    height: 120,
  },
  ticketContent: {
    flex: 1,
    padding: 16,
  },
  ticketHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginRight: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  infoText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#64748B',
  },
  footerRow: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  detailsButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  authCard: {
    width: '90%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
  },
  authCardContent: {
    padding: 20,
    alignItems: 'center',
  },
  authIconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  authTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
  },
  authSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 16,
    textAlign: 'center',
  },
  authPrimaryButton: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
    marginBottom: 12,
  },
  authPrimaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  authSecondaryButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#8B5CF6',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
  },
  authSecondaryButtonText: {
    color: '#8B5CF6',
    fontSize: 16,
    fontWeight: '600',
  },
});


