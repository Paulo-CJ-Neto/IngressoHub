import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Button } from '@/components/ui';

interface ValidationActionsProps {
  onOpenCamera: () => void;
  onShowDetails?: () => void;
}

export function ValidationActions({ onOpenCamera, onShowDetails }: ValidationActionsProps) {
  return (
    <View style={styles.container}>
      <Button onPress={onOpenCamera} style={styles.primaryButton}>
        <Text style={styles.primaryButtonText}>Abrir Câmera</Text>
      </Button>
      
      {onShowDetails && (
        <TouchableOpacity style={styles.secondaryButton} onPress={onShowDetails}>
          <Text style={styles.secondaryButtonText}>Detalhes</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  primaryButton: {
    flex: 1,
    marginRight: 12,
    backgroundColor: '#8B5CF6',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#8B5CF6',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  secondaryButtonText: {
    color: '#8B5CF6',
    fontSize: 16,
    fontWeight: '600',
  },
});
