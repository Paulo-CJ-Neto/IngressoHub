import React from 'react';
import { View, ScrollView, TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';

import { usePurchase } from '../hooks/usePurchase';
import { formatPrice } from '../utils/formatters';
import EventHeader from '../components/EventHeader';
import TicketTypeSelector from '../components/TicketTypeSelector';
import PriceSummary from '../components/PriceSummary';
import PaymentForm from '../components/PaymentForm';

export default function Purchase() {
  const {
    event,
    selectedTickets,
    buyerInfo,
    loading,
    processing,
    paymentMethod,
    user,
    ticketTypes,
    setBuyerInfo,
    setPaymentMethod,
    handleLogin,
    handleTicketQuantityChange,
    getTotalPrice,
    getTotalTickets,
    hasSelectedTickets,
    getAvailableTicketsForType,
    getAvailableTickets,
    handlePurchase,
    navigation,
  } = usePurchase();

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B5CF6" />
          <Text style={styles.loadingText}>Carregando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!event) return null;

  const handleBuyerInfoChange = (field: keyof typeof buyerInfo, value: string) => {
    setBuyerInfo(prev => ({ ...prev, [field]: value }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialIcons name="arrow-back" size={24} color="#374151" />
            <Text style={styles.backButtonText}>Voltar</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Finalizar Compra</Text>
        </View>

        <View style={styles.content}>
          {/* Event Header */}
          <EventHeader 
            event={event} 
            getAvailableTickets={getAvailableTickets} 
          />

          {/* Ticket Type Selection */}
          <TicketTypeSelector
            ticketTypes={ticketTypes}
            selectedTickets={selectedTickets}
            onTicketQuantityChange={handleTicketQuantityChange}
            getAvailableTicketsForType={getAvailableTicketsForType}
            formatPrice={formatPrice}
          />

          {/* Price Summary */}
          {hasSelectedTickets() && (
            <PriceSummary
              selectedTickets={selectedTickets}
              ticketTypes={ticketTypes}
              formatPrice={formatPrice}
              getTotalTickets={getTotalTickets}
              getTotalPrice={getTotalPrice}
            />
          )}

          {/* Payment Form */}
          <PaymentForm
            buyerInfo={buyerInfo}
            onBuyerInfoChange={handleBuyerInfoChange}
            user={user}
            onLogin={handleLogin}
            paymentMethod={paymentMethod}
            onPaymentMethodChange={setPaymentMethod}
            hasSelectedTickets={hasSelectedTickets}
            getTotalPrice={getTotalPrice}
            formatPrice={formatPrice}
            processing={processing}
            onPurchase={handlePurchase}
          />
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748B',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  backButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  headerTitle: {
    marginLeft: 16,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  content: {
    padding: 20,
  },
});
