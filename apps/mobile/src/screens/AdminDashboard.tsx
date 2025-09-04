import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { AdminDrawerParamList } from '../navigation/AdminNavigation';

type AdminDashboardNavigationProp = DrawerNavigationProp<AdminDrawerParamList, 'AdminDashboard'>;

export default function AdminDashboard() {
  const navigation = useNavigation<AdminDashboardNavigationProp>();

  // Dados mockados para demonstração
  const systemStats = {
    totalUsers: 2847,
    totalEvents: 156,
    totalRevenue: 'R$ 892.450,00',
    activeProducers: 89,
    pendingApprovals: 12,
    systemHealth: '98%'
  };

  const recentActivity = [
    { id: '1', type: 'user_registration', message: 'Novo usuário cadastrado', time: '2 min atrás', status: 'info' },
    { id: '2', type: 'event_created', message: 'Evento "Show de Rock" criado', time: '15 min atrás', status: 'success' },
    { id: '3', type: 'payment_processed', message: 'Pagamento processado com sucesso', time: '1 hora atrás', status: 'success' },
    { id: '4', type: 'user_reported', message: 'Usuário reportado por spam', time: '2 horas atrás', status: 'warning' },
    { id: '5', type: 'system_backup', message: 'Backup automático realizado', time: '3 horas atrás', status: 'info' }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_registration': return 'person-add-outline';
      case 'event_created': return 'calendar-outline';
      case 'payment_processed': return 'card-outline';
      case 'user_reported': return 'warning-outline';
      case 'system_backup': return 'cloud-upload-outline';
      default: return 'information-circle-outline';
    }
  };

  const getActivityColor = (status: string) => {
    switch (status) {
      case 'success': return '#10B981';
      case 'warning': return '#F59E0B';
      case 'error': return '#EF4444';
      default: return '#8B5CF6';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard Administrativo</Text>
        <Text style={styles.subtitle}>Visão geral do sistema IngressoHub</Text>
      </View>

      {/* Estatísticas do Sistema */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Ionicons name="people-outline" size={24} color="#8B5CF6" />
          <Text style={styles.statNumber}>{systemStats.totalUsers.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Total de Usuários</Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons name="calendar-outline" size={24} color="#10B981" />
          <Text style={styles.statNumber}>{systemStats.totalEvents}</Text>
          <Text style={styles.statLabel}>Total de Eventos</Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons name="trending-up-outline" size={24} color="#F59E0B" />
          <Text style={styles.statNumber}>{systemStats.totalRevenue}</Text>
          <Text style={styles.statLabel}>Receita Total</Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons name="business-outline" size={24} color="#EF4444" />
          <Text style={styles.statNumber}>{systemStats.activeProducers}</Text>
          <Text style={styles.statLabel}>Produtores Ativos</Text>
        </View>
      </View>

      {/* Métricas de Sistema */}
      <View style={styles.systemMetricsContainer}>
        <View style={styles.systemMetricCard}>
          <View style={styles.systemMetricHeader}>
            <Ionicons name="shield-checkmark-outline" size={24} color="#10B981" />
            <Text style={styles.systemMetricTitle}>Saúde do Sistema</Text>
          </View>
          <Text style={styles.systemMetricValue}>{systemStats.systemHealth}</Text>
          <Text style={styles.systemMetricLabel}>Operacional</Text>
        </View>

        <View style={styles.systemMetricCard}>
          <View style={styles.systemMetricHeader}>
            <Ionicons name="time-outline" size={24} color="#F59E0B" />
            <Text style={styles.systemMetricTitle}>Aprovações Pendentes</Text>
          </View>
          <Text style={styles.systemMetricValue}>{systemStats.pendingApprovals}</Text>
          <Text style={styles.systemMetricLabel}>Aguardando</Text>
        </View>
      </View>

      {/* Ações Rápidas */}
      <View style={styles.actionsContainer}>
        <Text style={styles.sectionTitle}>Ações Administrativas</Text>
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('UserManagement')}
          >
            <Ionicons name="people-outline" size={32} color="#8B5CF6" />
            <Text style={styles.actionButtonText}>Gestão de Usuários</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('EventModeration')}
          >
            <Ionicons name="checkmark-circle-outline" size={32} color="#10B981" />
            <Text style={styles.actionButtonText}>Moderação de Eventos</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('SystemAnalytics')}
          >
            <Ionicons name="bar-chart-outline" size={32} color="#F59E0B" />
            <Text style={styles.actionButtonText}>Analytics do Sistema</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Atividade Recente */}
      <View style={styles.activityContainer}>
        <Text style={styles.sectionTitle}>Atividade Recente do Sistema</Text>
        {recentActivity.map((activity) => (
          <View key={activity.id} style={styles.activityCard}>
            <View style={[
              styles.activityIcon,
              { backgroundColor: getActivityColor(activity.status) }
            ]}>
              <Ionicons 
                name={getActivityIcon(activity.type) as any} 
                size={20} 
                color="#FFFFFF" 
              />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityMessage}>{activity.message}</Text>
              <Text style={styles.activityTime}>{activity.time}</Text>
            </View>
            <View style={[
              styles.activityStatus,
              { backgroundColor: getActivityColor(activity.status) }
            ]} />
          </View>
        ))}
      </View>

      {/* Alertas do Sistema */}
      <View style={styles.alertsContainer}>
        <Text style={styles.sectionTitle}>Alertas do Sistema</Text>
        <View style={styles.alertCard}>
          <Ionicons name="warning-outline" size={24} color="#F59E0B" />
          <View style={styles.alertContent}>
            <Text style={styles.alertTitle}>Backup Pendente</Text>
            <Text style={styles.alertMessage}>
              Backup manual do banco de dados está pendente há 2 dias
            </Text>
          </View>
        </View>
        
        <View style={styles.alertCard}>
          <Ionicons name="information-circle-outline" size={24} color="#8B5CF6" />
          <View style={styles.alertContent}>
            <Text style={styles.alertTitle}>Atualização Disponível</Text>
            <Text style={styles.alertMessage}>
              Nova versão do sistema está disponível para deploy
            </Text>
          </View>
        </View>
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
    backgroundColor: '#1E293B',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#CBD5E1',
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
  systemMetricsContainer: {
    padding: 20,
    flexDirection: 'row',
    gap: 12,
  },
  systemMetricCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  systemMetricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  systemMetricTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginLeft: 8,
  },
  systemMetricValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  systemMetricLabel: {
    fontSize: 12,
    color: '#64748B',
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
  activityContainer: {
    padding: 20,
  },
  activityCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityMessage: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1E293B',
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 12,
    color: '#64748B',
  },
  activityStatus: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  alertsContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  alertCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  alertContent: {
    flex: 1,
    marginLeft: 12,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  alertMessage: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
  },
});
