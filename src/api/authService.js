/**
 * Servicio de Autenticacion
 *
 * Maneja todas las operaciones relacionadas con la autenticacion:
 * - Login y logout
 * - Registro de usuarios
 * - Restauracion de sesion via cookie httpOnly del refresh token
 *
 * Tras la migracion a cookie-based refresh, el frontend ya no almacena
 * el refresh token en memoria: lo gestiona el navegador como cookie httpOnly
 * emitida por el backend (no accesible desde JS).
 */

import apiClient, { setAuthTokens, clearAuthTokens } from './axios';

/**
 * Inicia sesion con credenciales
 * @param {string} identifier - Email o nombre de usuario
 * @param {string} password - Contrasena
 * @returns {Promise<Object>} Datos del usuario y access token
 */
export async function login(identifier, password) {
  const response = await apiClient.post('/auth/login', { identifier, password });

  if (response.data.success) {
    const { accessToken, user } = response.data.data;
    setAuthTokens(accessToken);
    return { user, accessToken };
  }

  throw new Error(response.data.message);
}

/**
 * Registra un nuevo usuario
 * @param {Object} userData - Datos del usuario { username, email, password, ... }
 * @returns {Promise<Object>} Datos del usuario creado y access token
 */
export async function register(userData) {
  const response = await apiClient.post('/auth/register', userData);

  if (response.data.success) {
    const { accessToken, user } = response.data.data;
    setAuthTokens(accessToken);
    return { user, accessToken };
  }

  throw new Error(response.data.message);
}

/**
 * Cierra la sesion del usuario. El backend invalida la cookie del refresh
 * token y la pone en lista negra; este lado limpia el access token en memoria
 */
export async function logout() {
  try {
    await apiClient.post('/auth/logout');
  } catch {
    // Ignorar errores de logout, limpiar tokens de todos modos
  } finally {
    clearAuthTokens();
  }
}

/**
 * Intenta restaurar la sesion usando la cookie httpOnly del refresh token.
 * Si el navegador tiene cookie valida, /auth/refresh devolvera un nuevo
 * access token. Si no, se considera sesion no autenticada.
 * @returns {Promise<Object|null>} Datos del usuario y access token, o null
 */
export async function restoreSession() {
  try {
    const response = await apiClient.post('/auth/refresh', {});

    if (response.data?.success) {
      const { accessToken, user } = response.data.data;
      setAuthTokens(accessToken);
      return { user, accessToken };
    }

    return null;
  } catch {
    clearAuthTokens();
    return null;
  }
}

/**
 * Obtiene el perfil del usuario autenticado
 * @returns {Promise<Object>} Datos del perfil
 */
export async function getProfile() {
  const response = await apiClient.get('/auth/profile');
  return response.data.data;
}
