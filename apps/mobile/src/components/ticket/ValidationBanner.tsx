import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ValidationBannerProps {
  type: 'valid' | 'invalid';
  message: string;
  visible?: boolean;
}

export function ValidationBanner({ type, message, visible = true }: ValidationBannerProps) {
  if (!visible) return null;

  return (
    <View
      style={[
        styles.banner,
        type === 'valid' ? styles.bannerValid : styles.bannerInvalid,
      ]}
    >
      <Text style={styles.bannerText}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 28,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  bannerValid: {
    backgroundColor: 'rgba(16,185,129,0.85)',
  },
  bannerInvalid: {
    backgroundColor: 'rgba(239,68,68,0.85)',
  },
  bannerText: {
    color: '#FFFFFF',
    fontSize: 14,
    textAlign: 'center',
  },
});
