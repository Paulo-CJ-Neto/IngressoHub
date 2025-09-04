import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export interface TicketType {
  id: string;
  name: string;
  description: string;
  price: number;
  discount_percentage?: number;
  original_price: number;
  available_quantity: number;
  icon: string;
}

interface TicketTypeSelectorProps {
  ticketTypes: TicketType[];
  selectedTickets: { [key: string]: number };
  onTicketQuantityChange: (ticketTypeId: string, newQuantity: number) => void;
  getAvailableTicketsForType: (ticketType: TicketType) => number;
  formatPrice: (price: number) => string;
}

export default function TicketTypeSelector({
  ticketTypes,
  selectedTickets,
  onTicketQuantityChange,
  getAvailableTicketsForType,
  formatPrice,
}: TicketTypeSelectorProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Selecione seus ingressos</Text>
      <Text style={styles.subtitle}>
        Escolha a quantidade de cada tipo de ingresso
      </Text>
      
      {ticketTypes.map((ticketType) => {
        const availableQuantity = getAvailableTicketsForType(ticketType);
        const currentQuantity = selectedTickets[ticketType.id] || 0;
        
        return (
          <View key={ticketType.id} style={styles.ticketTypeRow}>
            <View style={styles.ticketTypeInfo}>
              <View style={styles.ticketTypeHeader}>
                <Text style={styles.ticketTypeIcon}>{ticketType.icon}</Text>
                <View style={styles.ticketTypeDetails}>
                  <View style={styles.ticketTypeNameRow}>
                    <Text style={styles.ticketTypeName}>{ticketType.name}</Text>
                    {ticketType.discount_percentage && (
                      <View style={styles.discountBadge}>
                        <Text style={styles.discountText}>
                          -{ticketType.discount_percentage}%
                        </Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.ticketTypePriceRow}>
                    {ticketType.discount_percentage && (
                      <Text style={styles.originalPrice}>
                        R$ {formatPrice(ticketType.original_price)}
                      </Text>
                    )}
                    <Text style={styles.ticketTypePrice}>
                      R$ {formatPrice(ticketType.price)}
                    </Text>
                  </View>
                  <Text style={styles.availableQuantity}>
                    {availableQuantity} disponíveis
                  </Text>
                </View>
              </View>
            </View>
            
            <View style={styles.quantitySelector}>
              <TouchableOpacity
                style={[styles.quantityButton, currentQuantity <= 0 && styles.quantityButtonDisabled]}
                onPress={() => onTicketQuantityChange(ticketType.id, currentQuantity - 1)}
                disabled={currentQuantity <= 0}
              >
                <Text style={styles.quantityButtonText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.quantityValue}>{currentQuantity}</Text>
              <TouchableOpacity
                style={[styles.quantityButton, currentQuantity >= availableQuantity && styles.quantityButtonDisabled]}
                onPress={() => onTicketQuantityChange(ticketType.id, currentQuantity + 1)}
                disabled={currentQuantity >= availableQuantity}
              >
                <Text style={styles.quantityButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 16,
  },
  ticketTypeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  ticketTypeInfo: {
    flex: 1,
    marginRight: 16,
  },
  ticketTypeHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  ticketTypeIcon: {
    fontSize: 24,
    marginRight: 8,
    marginTop: 2,
  },
  ticketTypeDetails: {
    flex: 1,
  },
  ticketTypeNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ticketTypeName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
    marginRight: 8,
  },
  ticketTypePriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 2,
  },
  ticketTypePrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8B5CF6',
  },
  availableQuantity: {
    fontSize: 11,
    color: '#64748B',
  },
  discountBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  originalPrice: {
    fontSize: 12,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
    marginRight: 6,
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: 120,
    alignSelf: 'center',
  },
  quantityButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  quantityButtonDisabled: {
    opacity: 0.5,
  },
  quantityButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
  },
  quantityValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    marginHorizontal: 16,
    minWidth: 32,
    textAlign: 'center',
  },
});
