/**
 * Configuracion base de Axios
 *
 * Cliente HTTP configurado con interceptors para:
 * - Autenticacion automatica (JWT en cabecera Authorization)
 * - Manejo de errores centralizado
 * - Renovacion automatica de tokens via cookie httpOnly
 * - Cancelacion de requests via AbortSignal
 *
 * Estrategia de tokens (post-refactor):
 *   - accessToken: vive en memoria de JS, se inyecta en cabecera Authorization
 *   - refreshToken: vive solo en cookie httpOnly emitida por el backend (no
 *     accesible desde JS). El navegador la envia automaticamente cuando se
 *     llama a /auth/refresh con withCredentials, eliminando la superficie de
 *     ataque XSS sobre el refresh token.
 */

import axios from 'axios';
import { API_CONFIG, UI_MESSAGES } from '../constants';

const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  // withCredentials envia/recibe cookies httpOnly cross-origin (refresh token)
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Solo el access token vive en memoria. El refresh token lo gestiona el
// navegador a traves de la cookie httpOnly que emite el backend
let accessToken = null;

/**
 * Establece el access token en memoria. El refresh token se gestiona via cookie.
 * @param {string} token - Access token emitido por el backend
 */
export function setAuthTokens(token) {
  accessToken = token;
}

/**
 * Obtiene el access token actual en memoria
 * @returns {string|null}
 */
export function getAccessToken() {
  return accessToken;
}

/**
 * Limpia el access token en memoria. La cookie del refresh token se borra
 * server-side via /auth/logout
 */
export function clearAuthTokens() {
  accessToken = null;
}

// ========================================
// INTERCEPTOR DE REQUEST
// ========================================

apiClient.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ========================================
// INTERCEPTOR DE RESPONSE
// ========================================

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Manejar 401: intentar refrescar via cookie httpOnly
    if (error.response?.status === 401 && !originalRequest._retry) {
      // No intentar refrescar la propia llamada de refresh para evitar bucles
      if (originalRequest.url?.includes('/auth/refresh')) {
        clearAuthTokens();
        window.dispatchEvent(new CustomEvent('auth:logout'));
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // El navegador envia automaticamente la cookie del refresh token
        // cuando withCredentials esta activo en la instancia axios
        const response = await apiClient.post('/auth/refresh', {});
        const newAccessToken = response.data?.data?.accessToken;

        if (!newAccessToken) {
          throw new Error('Respuesta de refresh sin accessToken');
        }

        setAuthTokens(newAccessToken);
        processQueue(null, newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearAuthTokens();
        window.dispatchEvent(new CustomEvent('auth:logout'));
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Formatear error para consumo en la app
    const formattedError = {
      status: error.response?.status || 0,
      message: error.response?.data?.message || UI_MESSAGES.ERROR_NETWORK,
      code: error.response?.data?.code,
      errors: error.response?.data?.errors || [],
      isNetworkError: !error.response
    };

    return Promise.reject(formattedError);
  }
);

export default apiClient;
