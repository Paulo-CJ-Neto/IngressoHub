// Configurações específicas para desenvolvimento
export const DEV_CONFIG = {
  // Habilitar logs detalhados
  ENABLE_LOGS: true,
  
  // URL da API para desenvolvimento
  API_BASE_URL: `http://192.168.1.200:3000/api`,
  
  // Timeout reduzido para desenvolvimento
  API_TIMEOUT: 5000,
  
  // Configurações de mock para desenvolvimento
  MOCK_DATA: {
    ENABLED: false, // Desabilitar em produção
    DELAY: 1000, // Delay simulado para requisições
  },
  
  // Configurações de debug
  DEBUG: {
    SHOW_NETWORK_LOGS: true,
    SHOW_ERROR_DETAILS: true,
    SHOW_PERFORMANCE_METRICS: false,
  },
  
  // Configurações de cache
  CACHE: {
    ENABLED: true,
    TTL: 5 * 60 * 1000, // 5 minutos
    MAX_SIZE: 50, // Máximo de itens em cache
  },
};

// Função para verificar se está em modo de desenvolvimento
export const isDevelopment = () => {
  return __DEV__;
};

// Função para obter configurações baseadas no ambiente
export const getConfig = () => {
  if (isDevelopment()) {
    return DEV_CONFIG;
  }
  
  // Configurações de produção
  return {
    ENABLE_LOGS: false,
    API_BASE_URL: 'https://api.ingressohub.com/api',
    API_TIMEOUT: 10000,
    MOCK_DATA: {
      ENABLED: false,
      DELAY: 0,
    },
    DEBUG: {
      SHOW_NETWORK_LOGS: false,
      SHOW_ERROR_DETAILS: false,
      SHOW_PERFORMANCE_METRICS: false,
    },
    CACHE: {
      ENABLED: true,
      TTL: 10 * 60 * 1000, // 10 minutos
      MAX_SIZE: 100,
    },
  };
};
