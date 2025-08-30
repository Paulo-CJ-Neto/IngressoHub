import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApiBaseUrl, getApiHeaders } from '../config/api';
import { getConfig } from '../config/development';

// Configuração base do Axios
const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: getConfig().API_TIMEOUT,
  headers: getApiHeaders(),
});

// Interceptor para requisições
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('auth:token');
      if (token) {
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {}
    if (getConfig().DEBUG.SHOW_NETWORK_LOGS) {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error) => {
    if (getConfig().DEBUG.SHOW_ERROR_DETAILS) {
      console.error('❌ API Request Error:', error);
    }
    return Promise.reject(error);
  }
);

// Interceptor para respostas
api.interceptors.response.use(
  (response) => {
    if (getConfig().DEBUG.SHOW_NETWORK_LOGS) {
      console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    }
    return response;
  },
  (error) => {
    if (getConfig().DEBUG.SHOW_ERROR_DETAILS) {
      console.error('❌ API Response Error:', error.response?.data || error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
