import { getConfig } from './development';

// Configurações da API
export const API_CONFIG = {
  // URL base da API - pode ser alterada para diferentes ambientes
  BASE_URL: getConfig().API_BASE_URL,
  
  // Timeout das requisições (em milissegundos)
  TIMEOUT: getConfig().API_TIMEOUT,
  
  // Headers padrão
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
  },
  
  // Configurações de retry
  RETRY_CONFIG: {
    maxRetries: 3,
    retryDelay: 1000,
  },
};

// Função para obter a URL base baseada no ambiente
export const getApiBaseUrl = () => {
  // Em produção, você pode usar variáveis de ambiente
  // return process.env.API_BASE_URL || API_CONFIG.BASE_URL;
  
  // Para desenvolvimento local
  return API_CONFIG.BASE_URL;
};

// Função para obter headers baseados no ambiente
export const getApiHeaders = () => {
  const headers = { ...API_CONFIG.DEFAULT_HEADERS };
  
  // Adicionar token de autenticação se disponível
  // const token = getAuthToken();
  // if (token) {
  //   headers.Authorization = `Bearer ${token}`;
  // }
  
  return headers;
};
