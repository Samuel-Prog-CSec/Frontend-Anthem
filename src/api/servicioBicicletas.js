/**
 * Servicio de Bicicletas (Disponibilidad)
 *
 * Maneja todas las operaciones relacionadas con bicicletas:
 * - Consulta de disponibilidad con filtros
 * - Estadisticas y tendencias mensuales
 * - Top de uso y comparativas de suscripcion
 */

import apiClient from './axios';
import { normalizarRespuestaLista } from './normalizarRespuesta';
import { PAGINATION } from '../constants';

// ========================================
// DISPONIBILIDAD DE BICICLETAS
// ========================================

/**
 * Obtiene datos de disponibilidad de bicicletas con filtros
 * @param {Object} params - Parametros de consulta
 * @param {number} [params.page] - Numero de pagina
 * @param {number} [params.limit] - Items por pagina
 * @param {string} [params.sortBy] - Campo para ordenar
 * @param {string} [params.sortOrder] - Orden: 'asc' o 'desc'
 * @returns {Promise<Object>} Lista de datos de disponibilidad con paginacion
 */
export async function obtenerDisponibilidad(params = {}) {
  const queryParams = {
    page: params.page || PAGINATION.DEFAULT_PAGE,
    limit: params.limit || PAGINATION.BIKES_DEFAULT_LIMIT,
    ...params
  };

  const response = await apiClient.get('/bicicletas', { params: queryParams });
  return normalizarRespuestaLista(response);
}

/**
 * Obtiene estadisticas de disponibilidad de bicicletas
 * @param {Object} params - Parametros de consulta
 * @returns {Promise<Object>} Estadisticas agregadas
 */
export async function obtenerEstadisticas(params = {}) {
  const response = await apiClient.get('/bicicletas/estadisticas', { params });
  return response.data;
}

/**
 * Obtiene tendencias mensuales de disponibilidad
 * @param {Object} params - Parametros de consulta
 * @returns {Promise<Object>} Datos de tendencias por mes
 */
export async function obtenerTendenciasMensuales(params = {}) {
  const response = await apiClient.get('/bicicletas/tendencias/mensual', { params });
  return response.data;
}

/**
 * Obtiene ranking de mayor uso de bicicletas
 * @param {Object} params - Parametros de consulta
 * @returns {Promise<Object>} Top de uso de bicicletas
 */
export async function obtenerMayorUso(params = {}) {
  const response = await apiClient.get('/bicicletas/mayor-uso', { params });
  return response.data;
}

/**
 * Obtiene comparativa entre tipos de suscripcion
 * @param {Object} params - Parametros de consulta
 * @returns {Promise<Object>} Datos comparativos de suscripciones
 */
export async function obtenerComparativaSuscripciones(params = {}) {
  const response = await apiClient.get('/bicicletas/comparativa-suscripciones', { params });
  return response.data;
}

