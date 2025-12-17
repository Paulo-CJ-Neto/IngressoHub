import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TicketType } from '@/components/ticket';

interface PriceSummaryProps {
  selectedTickets: { [key: string]: number };
  ticketTypes: TicketType[];
  formatPrice: (price: number) => string;
  getTotalTickets: () => number;
  getTotalPrice: () => number;
}

export default function PriceSummary({
  selectedTickets,
  ticketTypes,
  formatPrice,
  getTotalTickets,
  getTotalPrice,
}: PriceSummaryProps) {
  const hasDiscounts = Object.entries(selectedTickets).some(([ticketTypeId, quantity]) => {
    const ticketType = ticketTypes.find(t => t.id === ticketTypeId);
    return ticketType?.discount_percentage && quantity > 0;
  });

  const getTotalSavings = () => {
    return Object.entries(selectedTickets).reduce((total, [ticketTypeId, quantity]) => {
      const ticketType = ticketTypes.find(t => t.id === ticketTypeId);
      if (ticketType?.discount_percentage) {
        return total + ((ticketType.original_price - ticketType.price) * quantity);
      }
      return total;
    }, 0);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Resumo da Compra</Text>
      
      {Object.entries(selectedTickets)
        .filter(([ticketTypeId]) => ticketTypes.find(t => t.id === ticketTypeId))
        .map(([ticketTypeId, quantity]) => {
        const ticketType = ticketTypes.find(t => t.id === ticketTypeId)!;
        
        return (
          <View key={ticketTypeId} style={styles.priceRow}>
            <View style={styles.priceRowLeft}>
              <Text style={styles.priceLabel}>{ticketType.name}</Text>
              <Text style={styles.priceQuantity}>x{quantity}</Text>
            </View>
            <View style={styles.priceRowRight}>
              {ticketType.discount_percentage && (
                <Text style={styles.originalPrice}>
                  R$ {formatPrice(ticketType.original_price * quantity)}
                </Text>
              )}
              <Text style={styles.priceValue}>
                R$ {formatPrice(ticketType.price * quantity)}
              </Text>
            </View>
          </View>
        );
      })}
      
      <View style={styles.divider} />
      
      <View style={styles.priceRow}>
        <Text style={styles.totalLabel}>Total de ingressos:</Text>
        <Text style={styles.totalValue}>{getTotalTickets()}</Text>
      </View>
      
      <View style={styles.priceRow}>
        <Text style={styles.totalLabel}>Valor total:</Text>
        <Text style={styles.totalValue}>
          R$ {formatPrice(getTotalPrice())}
        </Text>
      </View>

      {hasDiscounts && (
        <View style={styles.savingsRow}>
          <Text style={styles.savingsLabel}>Total economizado:</Text>
          <Text style={styles.savingsValue}>
            R$ {formatPrice(getTotalSavings())}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 16,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  priceRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 16,
    color: '#374151',
    marginRight: 8,
  },
  priceQuantity: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  priceRowRight: {
    alignItems: 'flex-end',
  },
  priceValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8B5CF6',
  },
  originalPrice: {
    fontSize: 12,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
    marginRight: 6,
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 16,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8B5CF6',
  },
  savingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  savingsLabel: {
    fontSize: 16,
    color: '#10B981',
    fontWeight: '600',
  },
  savingsValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10B981',
  },
});
