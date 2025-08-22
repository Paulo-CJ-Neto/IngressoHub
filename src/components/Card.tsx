import React from 'react';
import { View, ViewStyle, StyleProp } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export const Card: React.FC<CardProps> = ({ children, style }) => {
  return (
    <View
      style={[
        {
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          borderRadius: 24,
          padding: 16,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 4,
          },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 5,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

export const CardContent: React.FC<CardProps> = ({ children, style }) => {
  return (
    <View style={[{ padding: 16 }, style]}>
      {children}
    </View>
  );
};
