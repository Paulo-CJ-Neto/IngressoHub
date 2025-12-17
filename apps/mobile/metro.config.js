const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Configurar resolver para path aliases
config.resolver.alias = {
  '@': path.resolve(__dirname, 'src'),
};

// Adicionar watchFolders mantendo os padrões do Expo
config.watchFolders = [
  ...config.watchFolders,
  path.resolve(__dirname, '../../packages/entities'),
];

module.exports = config;
