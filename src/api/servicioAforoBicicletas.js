/**
 * Servicio de Aforo de Bicicletas
 *
 * Maneja todas las operaciones relacionadas con datos de conteo
 * horario de trafico de bicicletas:
 * - Consulta de registros de aforo con filtros
 * - Detalle por estacion
 * - Estadisticas generales
 * - Distribucion horaria (patron 0-23h)
 * - Ranking de estaciones
 * - Tendencias diarias
 */

import apiClient from './axios';
import { normalizarRespuestaLista, normalizarRespuestaDetalle } from './normalizarRespuesta';
import { PAGINATION } from '../constants';

/**
 * Obtiene datos de aforo de bicicletas con filtros
 * @param {Object} params - Parametros de consulta
 * @param {number} [params.page] - Numero de pagina
 * @param {number} [params.limit] - Items por pagina
 * @param {string} [params.identificador] - Identificador de estacion
 * @param {string} [params.distrito] - Distrito
 * @param {number} [params.hora] - Hora (0-23)
 * @param {string} [params.startDate] - Fecha inicio (ISO 8601)
 * @param {string} [params.endDate] - Fecha fin (ISO 8601)
 * @returns {Promise<Object>} Lista de registros con paginacion
 */
export async function obtenerAforoBicicletas(params = {}) {
  const queryParams = {
    page: params.page || PAGINATION.DEFAULT_PAGE,
    limit: params.limit || PAGINATION.DEFAULT_LIMIT,
    ...params
  };

  const response = await apiClient.get('/aforo-bicicletas', { params: queryParams });
  return normalizarRespuestaLista(response);
}

/**
 * Obtiene detalle de una estacion de aforo
 * @param {string} identificador - Identificador de la estacion
 * @param {Object} params - Parametros adicionales
 * @param {string} [params.startDate] - Fecha inicio
 * @param {string} [params.endDate] - Fecha fin
 * @returns {Promise<Object>} Datos de la estacion con resumen
 */
export async function obtenerEstacionAforo(identificador, params = {}) {
  const response = await apiClient.get(`/aforo-bicicletas/estacion/${identificador}`, { params });
  return normalizarRespuestaDetalle(response);
}

/**
 * Obtiene estadisticas generales de aforo
 * @param {Object} params - Parametros de consulta
 * @param {string} [params.startDate] - Fecha inicio
 * @param {string} [params.endDate] - Fecha fin
 * @returns {Promise<Object>} Estadisticas agregadas
 */
export async function obtenerEstadisticasAforo(params = {}) {
  const response = await apiClient.get('/aforo-bicicletas/estadisticas', { params });
  return normalizarRespuestaDetalle(response);
}

/**
 * Obtiene distribucion horaria (patron 0-23h)
 * @param {Object} params - Parametros de consulta
 * @param {string} [params.identificador] - Estacion especifica
 * @param {string} [params.distrito] - Distrito especifico
 * @param {string} [params.startDate] - Fecha inicio
 * @param {string} [params.endDate] - Fecha fin
 * @returns {Promise<Object>} Patron horario con promedios por hora
 */
export async function obtenerDistribucionHoraria(params = {}) {
  const response = await apiClient.get('/aforo-bicicletas/distribucion-horaria', { params });
  return normalizarRespuestaDetalle(response);
}

/**
 * Obtiene ranking de estaciones por volumen de bicicletas
 * @param {Object} params - Parametros de consulta
 * @param {string} [params.distrito] - Filtrar por distrito
 * @param {number} [params.limit] - Numero de estaciones
 * @param {string} [params.startDate] - Fecha inicio
 * @param {string} [params.endDate] - Fecha fin
 * @returns {Promise<Object>} Ranking de estaciones
 */
export async function obtenerEstacionesAforo(params = {}) {
  const response = await apiClient.get('/aforo-bicicletas/estaciones', { params });
  return normalizarRespuestaDetalle(response);
}

/**
 * Obtiene tendencias diarias de aforo
 * @param {Object} params - Parametros de consulta
 * @param {string} [params.identificador] - Estacion especifica
 * @param {string} [params.distrito] - Distrito especifico
 * @param {string} [params.startDate] - Fecha inicio
 * @param {string} [params.endDate] - Fecha fin
 * @returns {Promise<Object>} Tendencias diarias con totales y promedios
 */
export async function obtenerTendenciasDiarias(params = {}) {
  const response = await apiClient.get('/aforo-bicicletas/tendencias/diario', { params });
  return normalizarRespuestaDetalle(response);
}
