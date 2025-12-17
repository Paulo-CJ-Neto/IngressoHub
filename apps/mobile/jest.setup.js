// Setup global para testes React Native
import 'react-native-gesture-handler/jestSetup';

// Mock do AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('./src/__mocks__/@react-native-async-storage/async-storage')
);

// Mock do expo-image-picker
jest.mock('expo-image-picker', () =>
  require('./src/__mocks__/expo-image-picker')
);

// Mock do axios
jest.mock('./src/services/api', () => require('./src/__mocks__/axios'));

// Mock do React Navigation
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: jest.fn(),
      goBack: jest.fn(),
      dispatch: jest.fn(),
    }),
    useRoute: () => ({
      params: {},
    }),
  };
});

// Mock do React Native Paper
jest.mock('react-native-paper', () => {
  const React = require('react');
  const { View, Text } = require('react-native');
  
  return {
    Provider: ({ children }) => children,
    Button: ({ children, onPress, ...props }) => (
      React.createElement(View, { onPress, ...props }, children)
    ),
    Card: ({ children, ...props }) => (
      React.createElement(View, { ...props }, children)
    ),
    TextInput: ({ ...props }) => (
      React.createElement(require('react-native').TextInput, { ...props })
    ),
    Portal: ({ children }) => children,
    Dialog: ({ children, visible, ...props }) => 
      visible ? React.createElement(View, { ...props }, children) : null,
  };
});

// Mock do Expo
jest.mock('expo-constants', () => ({
  default: {
    expoConfig: {
      extra: {},
    },
  },
}));

// Suprimir warnings do console durante testes
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
};

