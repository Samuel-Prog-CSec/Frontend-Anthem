/**
 * Configuracion base de Axios
 * 
 * Cliente HTTP configurado con interceptors para:
 * - Autenticacion automatica (JWT)
 * - Manejo de errores centralizado
 * - Renovacion automatica de tokens
 * - Retry logic para errores transitorios
 */

import axios from 'axios';
import { API_CONFIG, AUTH_CONFIG, UI_MESSAGES } from '../constants';

// Crear instancia de Axios con configuracion base
const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Variable para almacenar el token en memoria (mas seguro que localStorage)
let accessToken = null;
let refreshToken = null;

/**
 * Establece los tokens de autenticacion
 * @param {string} access - Access token
 * @param {string} refresh - Refresh token
 */
export function setAuthTokens(access, refresh) {
  accessToken = access;
  refreshToken = refresh;
  
  // Guardar refresh token en localStorage para persistencia
  // El access token se mantiene solo en memoria por seguridad
  if (refresh) {
    localStorage.setItem(AUTH_CONFIG.REFRESH_TOKEN_KEY, refresh);
  }
}

/**
 * Obtiene el access token actual
 * @returns {string|null} Access token o null
 */
export function getAccessToken() {
  return accessToken;
}

/**
 * Limpia los tokens de autenticacion
 */
export function clearAuthTokens() {
  accessToken = null;
  refreshToken = null;
  localStorage.removeItem(AUTH_CONFIG.REFRESH_TOKEN_KEY);
}

/**
 * Recupera el refresh token almacenado
 * @returns {string|null} Refresh token o null
 */
export function getStoredRefreshToken() {
  return localStorage.getItem(AUTH_CONFIG.REFRESH_TOKEN_KEY);
}

// ========================================
// INTERCEPTOR DE REQUEST
// ========================================

apiClient.interceptors.request.use(
  (config) => {
    // Agregar token de autenticacion si existe
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ========================================
// INTERCEPTOR DE RESPONSE
// ========================================

// Flag para evitar multiples intentos de refresh simultaneos
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => {
    // Retornar solo los datos de la respuesta
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Manejar error 401 (no autorizado)
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Si ya estamos refrescando, encolar la request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }
      
      originalRequest._retry = true;
      isRefreshing = true;
      
      const storedRefresh = refreshToken || getStoredRefreshToken();
      
      if (storedRefresh) {
        try {
          // Intentar renovar el token
          const response = await axios.post(`${API_CONFIG.BASE_URL}/auth/refresh`, {
            refreshToken: storedRefresh
          });
          
          const { accessToken: newAccess, refreshToken: newRefresh } = response.data.data;
          
          setAuthTokens(newAccess, newRefresh);
          processQueue(null, newAccess);
          
          originalRequest.headers.Authorization = `Bearer ${newAccess}`;
          return apiClient(originalRequest);
          
        } catch (refreshError) {
          processQueue(refreshError, null);
          clearAuthTokens();
          
          // Emitir evento para que la app maneje el logout
          window.dispatchEvent(new CustomEvent('auth:logout'));
          
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      } else {
        // No hay refresh token, emitir logout
        clearAuthTokens();
        window.dispatchEvent(new CustomEvent('auth:logout'));
      }
    }
    
    // Formatear error para consumo en la app
    const formattedError = {
      status: error.response?.status || 0,
      message: error.response?.data?.message || UI_MESSAGES.ERROR_NETWORK,
      errors: error.response?.data?.errors || [],
      isNetworkError: !error.response
    };
    
    return Promise.reject(formattedError);
  }
);

export default apiClient;
