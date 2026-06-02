/**
 * Configuracion base de Axios
 *
 * Cliente HTTP configurado con interceptors para:
 * - Autenticacion automatica (JWT en cabecera Authorization)
 * - Manejo de errores centralizado
 * - Renovacion automatica de tokens via cookie httpOnly
 * - Refresh anticipado: decodifica `exp` y dispara refresh ~30s antes de
 *   expirar, evitando el primer 401 reactivo post-expiry
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
import { jwtDecode } from 'jwt-decode';
import { API_CONFIG, UI_MESSAGES } from '../constants';

// Margen para refrescar ANTES de que el token expire (segundos). Evita que
// el primer request post-expiry pague el coste del round trip extra del 401.
// El backend tiene clockTolerance de 5s, este buffer ofrece holgura adicional.
const REFRESH_SAFETY_MARGIN_SECONDS = 30;

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

// Handle del setTimeout que dispara el refresh anticipado. Se cancela cada vez
// que se rota el token para evitar timers huerfanos acumulandose.
let refreshTimerId = null;

/**
 * Cancela el timer de refresh anticipado si esta activo.
 */
function cancelarRefreshAnticipado() {
  if (refreshTimerId !== null) {
    clearTimeout(refreshTimerId);
    refreshTimerId = null;
  }
}

/**
 * Programa una llamada a /auth/refresh para que ocurra antes de que el token
 * expire. Decodifica `exp` (NO verifica firma; el backend es el unico que
 * valida tokens). Si el token ya esta muy cerca de expirar, refresca al
 * proximo tick.
 *
 * @param {string} token - Access token JWT recien emitido
 */
function programarRefreshAnticipado(token) {
  cancelarRefreshAnticipado();
  if (!token) {
    return;
  }
  try {
    const { exp } = jwtDecode(token);
    if (!exp) {
      return;
    }
    const nowSeconds = Math.floor(Date.now() / 1000);
    const segundosHastaRefresh = exp - nowSeconds - REFRESH_SAFETY_MARGIN_SECONDS;
    // Si el token caduca pronto (o ya esta vencido), refrescar en el siguiente
    // tick (10ms) para no bloquear el thread actual.
    const delayMs = Math.max(segundosHastaRefresh * 1000, 10);
    refreshTimerId = setTimeout(() => {
      refreshTimerId = null;
      refrescarAccessTokenSilencioso();
    }, delayMs);
  } catch {
    // Token malformado: el backend rechazara la primera request con 401 y se
    // activara el flujo reactivo de refresh. No es necesario hacer nada aqui.
  }
}

/**
 * Dispara /auth/refresh sin pasar por el interceptor de 401. Usado por el
 * timer del refresh anticipado.
 */
async function refrescarAccessTokenSilencioso() {
  // Si no hay sesion (no hay accessToken), no intentar; el usuario ya hizo logout.
  if (!accessToken) {
    return;
  }
  try {
    const response = await apiClient.post('/auth/refresh', {});
    const nuevoToken = response.data?.data?.accessToken;
    if (nuevoToken) {
      setAuthTokens(nuevoToken);
    }
  } catch {
    // Si falla (red caida, refresh expirado, etc.), el siguiente request
    // recibira 401 y el interceptor reactivo se encargara. No spammear logs.
  }
}

/**
 * Establece el access token en memoria. El refresh token se gestiona via cookie.
 * Tambien programa el refresh anticipado para esta nueva sesion.
 *
 * @param {string} token - Access token emitido por el backend
 */
export function setAuthTokens(token) {
  accessToken = token;
  programarRefreshAnticipado(token);
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
  cancelarRefreshAnticipado();
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
          // Marcar la request encolada como ya reintentada para que un eventual
          // 401 posterior no dispare un segundo ciclo de refresh (defensa contra
          // un race muy improbable pero posible si el token recien rotado fuera
          // rechazado por reloj o por revocacion concurrente).
          originalRequest._retry = true;
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
