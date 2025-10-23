import axios, { AxiosError } from "axios";

// Base URL desde Vite env (VITE_API_BASE_URL). Si no existe, usa localhost por defecto.
const BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Helper para obtener el token desde localStorage
const getAccessToken = () => localStorage.getItem("access_token");

// Attach token a cada request si existe
api.interceptors.request.use((config) => {
  // No añadir token para login/refresh
  if (config.url?.includes('/token/')) {
    return config;
  }

  const token = localStorage.getItem('access_token');
  if (token && config.headers) {
    config.headers.Authorization = `Token ${token}`;
    console.log('🔒 Enviando request autenticado:', {
      url: config.url,
      method: config.method,
      tokenStart: token.substring(0, 10) + '...'
    });
  } else {
    console.log('⚠️ Request sin token:', {
      url: config.url,
      method: config.method
    });
  }
  return config;
});

// Interceptor simple para manejar errores
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    // Si recibimos un 401, limpiamos el token y rechazamos la promesa
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
    }
    return Promise.reject(error);
  }
);

export default api;
