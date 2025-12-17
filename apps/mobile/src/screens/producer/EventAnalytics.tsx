import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function EventAnalytics() {
  // Dados mockados para demonstração
  const analytics = {
    totalRevenue: 'R$ 45.680,00',
    totalTickets: 1250,
    averageTicketPrice: 'R$ 36,54',
    conversionRate: '68%',
    topEvent: 'Show de Rock',
    topEventRevenue: 'R$ 12.000,00'
  };

  const monthlyData = [
    { month: 'Jan', revenue: 8500, tickets: 180 },
    { month: 'Fev', revenue: 9200, tickets: 200 },
    { month: 'Mar', revenue: 7800, tickets: 160 },
    { month: 'Abr', revenue: 11200, tickets: 240 },
    { month: 'Mai', revenue: 9800, tickets: 210 },
    { month: 'Jun', revenue: 8900, tickets: 190 }
  ];

  const eventPerformance = [
    { name: 'Show de Rock', revenue: 12000, tickets: 150, status: 'active' },
    { name: 'Festival de Jazz', revenue: 10800, tickets: 180, status: 'active' },
    { name: 'Teatro Clássico', revenue: 6000, tickets: 100, status: 'completed' },
    { name: 'Palestra Tech', revenue: 4800, tickets: 120, status: 'completed' }
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Analytics de Eventos</Text>
        <Text style={styles.subtitle}>Acompanhe o desempenho dos seus eventos</Text>
      </View>

      {/* Métricas Principais */}
      <View style={styles.metricsContainer}>
        <View style={styles.metricCard}>
          <Ionicons name="trending-up-outline" size={24} color="#10B981" />
          <Text style={styles.metricValue}>{analytics.totalRevenue}</Text>
          <Text style={styles.metricLabel}>Receita Total</Text>
        </View>

        <View style={styles.metricCard}>
          <Ionicons name="ticket-outline" size={24} color="#8B5CF6" />
          <Text style={styles.metricValue}>{analytics.totalTickets}</Text>
          <Text style={styles.metricLabel}>Ingressos Vendidos</Text>
        </View>

        <View style={styles.metricCard}>
          <Ionicons name="calculator-outline" size={24} color="#F59E0B" />
          <Text style={styles.metricValue}>{analytics.averageTicketPrice}</Text>
          <Text style={styles.metricLabel}>Preço Médio</Text>
        </View>

        <View style={styles.metricCard}>
          <Ionicons name="analytics-outline" size={24} color="#EF4444" />
          <Text style={styles.metricValue}>{analytics.conversionRate}</Text>
          <Text style={styles.metricLabel}>Taxa de Conversão</Text>
        </View>
      </View>

      {/* Gráfico de Receita Mensal */}
      <View style={styles.chartContainer}>
        <Text style={styles.sectionTitle}>Receita Mensal</Text>
        <View style={styles.chart}>
          {monthlyData.map((data, index) => (
            <View key={data.month} style={styles.chartBar}>
              <View style={styles.barContainer}>
                <View 
                  style={[
                    styles.bar, 
                    { 
                      height: (data.revenue / 12000) * 120,
                      backgroundColor: index === monthlyData.length - 1 ? '#8B5CF6' : '#E2E8F0'
                    }
                  ]} 
                />
              </View>
              <Text style={styles.barLabel}>{data.month}</Text>
              <Text style={styles.barValue}>R$ {(data.revenue / 1000).toFixed(1)}k</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Performance dos Eventos */}
      <View style={styles.performanceContainer}>
        <Text style={styles.sectionTitle}>Performance dos Eventos</Text>
        {eventPerformance.map((event, index) => (
          <View key={index} style={styles.performanceCard}>
            <View style={styles.performanceHeader}>
              <Text style={styles.eventName}>{event.name}</Text>
              <View style={[
                styles.statusBadge,
                { backgroundColor: event.status === 'active' ? '#10B981' : '#6B7280' }
              ]}>
                <Text style={styles.statusText}>
                  {event.status === 'active' ? 'Ativo' : 'Concluído'}
                </Text>
              </View>
            </View>
            
            <View style={styles.performanceMetrics}>
              <View style={styles.performanceMetric}>
                <Ionicons name="cash-outline" size={16} color="#64748B" />
                <Text style={styles.performanceValue}>R$ {event.revenue.toLocaleString()}</Text>
                <Text style={styles.performanceLabel}>Receita</Text>
              </View>
              
              <View style={styles.performanceMetric}>
                <Ionicons name="ticket-outline" size={16} color="#64748B" />
                <Text style={styles.performanceValue}>{event.tickets}</Text>
                <Text style={styles.performanceLabel}>Ingressos</Text>
              </View>
              
              <View style={styles.performanceMetric}>
                <Ionicons name="calculator-outline" size={16} color="#64748B" />
                <Text style={styles.performanceValue}>
                  R$ {(event.revenue / event.tickets).toFixed(2)}
                </Text>
                <Text style={styles.performanceLabel}>Preço Médio</Text>
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* Insights */}
      <View style={styles.insightsContainer}>
        <Text style={styles.sectionTitle}>Insights</Text>
        <View style={styles.insightCard}>
          <Ionicons name="bulb-outline" size={24} color="#F59E0B" />
          <View style={styles.insightContent}>
            <Text style={styles.insightTitle}>Evento de Maior Sucesso</Text>
            <Text style={styles.insightText}>
              "{analytics.topEvent}" gerou {analytics.topEventRevenue} em vendas
            </Text>
          </View>
        </View>
        
        <View style={styles.insightCard}>
          <Ionicons name="trending-up-outline" size={24} color="#10B981" />
          <View style={styles.insightContent}>
            <Text style={styles.insightTitle}>Crescimento Mensal</Text>
            <Text style={styles.insightText}>
              Sua receita cresceu 15% em relação ao mês anterior
            </Text>
          </View>
        </View>
        
        <View style={styles.insightCard}>
          <Ionicons name="people-outline" size={24} color="#8B5CF6" />
          <View style={styles.insightContent}>
            <Text style={styles.insightTitle}>Engajamento</Text>
            <Text style={styles.insightText}>
              Taxa de conversão de 68% indica boa aceitação dos preços
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
  metricsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 20,
    gap: 12,
  },
  metricCard: {
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
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    marginTop: 8,
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },
  chartContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 16,
  },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 160,
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartBar: {
    alignItems: 'center',
    flex: 1,
  },
  barContainer: {
    height: 120,
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  bar: {
    width: 20,
    borderRadius: 10,
    minHeight: 4,
  },
  barLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  barValue: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
  },
  performanceContainer: {
    padding: 20,
  },
  performanceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  performanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  eventName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
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
  performanceMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  performanceMetric: {
    alignItems: 'center',
    flex: 1,
  },
  performanceValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
    marginTop: 4,
    marginBottom: 2,
  },
  performanceLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  insightsContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  insightCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  insightContent: {
    flex: 1,
    marginLeft: 12,
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  insightText: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
  },
});
