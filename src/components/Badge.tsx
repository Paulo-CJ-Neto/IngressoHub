import React from 'react';
import { View, Text, ViewStyle, TextStyle, StyleProp } from 'react-native';

interface BadgeProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const Badge: React.FC<BadgeProps> = ({ children, style, textStyle }) => {
  return (
    <View
      style={[
        {
          backgroundColor: '#8b5cf6',
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 16,
          alignSelf: 'flex-start',
        },
        style,
      ]}
    >
      <Text
        style={[
          {
            color: '#ffffff',
            fontSize: 12,
            fontWeight: '600',
          },
          textStyle,
        ]}
      >
        {children}
      </Text>
    </View>
  );
};
