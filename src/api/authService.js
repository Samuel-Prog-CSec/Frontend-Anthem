/**
 * Servicio de Autenticacion
 * 
 * Maneja todas las operaciones relacionadas con la autenticacion:
 * - Login y logout
 * - Registro de usuarios
 * - Renovacion de tokens
 */

import apiClient, { setAuthTokens, clearAuthTokens, getStoredRefreshToken } from './axios';
import axios from 'axios';
import { API_CONFIG } from '../constants';

/**
 * Inicia sesion con credenciales
 * @param {string} identifier - Email o nombre de usuario
 * @param {string} password - Contrasena
 * @returns {Promise<Object>} Datos del usuario y tokens
 */
export async function login(identifier, password) {
  const response = await apiClient.post('/auth/login', { identifier, password });
  
  if (response.data.success) {
    const { accessToken, refreshToken, user } = response.data.data;
    setAuthTokens(accessToken, refreshToken);
    return { user, accessToken };
  }
  
  throw new Error(response.data.message);
}

/**
 * Registra un nuevo usuario
 * @param {Object} userData - Datos del usuario
 * @param {string} userData.username - Nombre de usuario
 * @param {string} userData.email - Email
 * @param {string} userData.password - Contrasena
 * @param {string} userData.fullName - Nombre completo
 * @returns {Promise<Object>} Datos del usuario creado
 */
export async function register(userData) {
  
  const response = await apiClient.post('/auth/register', userData);
  
  if (response.data.success) {
    const { accessToken, refreshToken, user } = response.data.data;
    setAuthTokens(accessToken, refreshToken);
    return { user, accessToken };
  }
  
  throw new Error(response.data.message);
}

/**
 * Cierra la sesion del usuario
 * @returns {Promise<void>}
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
 * Intenta restaurar la sesion usando el refresh token almacenado
 * @returns {Promise<Object|null>} Datos del usuario o null si no hay sesion
 */
export async function restoreSession() {
  const storedRefresh = getStoredRefreshToken();
  
  if (!storedRefresh) {
    return null;
  }
  
  try {
    // Usar axios directamente para evitar interceptores que podrian causar bucles
    const response = await axios.post(`${API_CONFIG.BASE_URL}/auth/refresh`, {
      refreshToken: storedRefresh
    });
    
    if (response.data.success) {
      const { accessToken, refreshToken, user } = response.data.data;
      setAuthTokens(accessToken, refreshToken);
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
