/**
 * Servicio de Multas
 *
 * Maneja todas las operaciones relacionadas con datos de multas de trafico:
 * - Consulta de multas con filtros
 * - Detalle individual por ID
 * - Estadisticas y rankings
 * - Analisis temporal
 * - Dashboard de metricas
 */

import apiClient from './axios';
import { normalizarRespuestaLista, normalizarRespuestaDetalle } from './normalizarRespuesta';
import { PAGINATION } from '../constants';

/**
 * Obtiene datos de multas con filtros
 * @param {Object} params - Parametros de consulta
 * @param {number} [params.page] - Numero de pagina
 * @param {number} [params.limit] - Items por pagina
 * @param {string} [params.calificacion] - Calificacion: LEVE, GRAVE, MUY_GRAVE
 * @param {string} [params.tipoInfraccion] - Tipo de infraccion
 * @param {string} [params.denunciante] - Denunciante
 * @param {string} [params.startDate] - Fecha inicio (ISO 8601)
 * @param {string} [params.endDate] - Fecha fin (ISO 8601)
 * @param {boolean} [params.tieneDescuento] - Filtro por descuento
 * @param {boolean} [params.esGrave] - Solo infracciones graves
 * @returns {Promise<Object>} Lista de multas con paginacion
 */
export async function obtenerMultas(params = {}) {
  const queryParams = {
    page: params.page || PAGINATION.DEFAULT_PAGE,
    limit: params.limit || PAGINATION.DEFAULT_LIMIT,
    ...params
  };

  const response = await apiClient.get('/multas', { params: queryParams });
  return normalizarRespuestaLista(response);
}

/**
 * Obtiene una multa por su ID
 * @param {string} id - ID de la multa
 * @returns {Promise<Object>} Datos de la multa
 */
export async function obtenerMultaPorId(id) {
  const response = await apiClient.get(`/multas/${id}`);
  return normalizarRespuestaDetalle(response);
}

/**
 * Obtiene estadisticas de multas
 * @param {Object} params - Parametros de consulta
 * @param {string} [params.startDate] - Fecha inicio
 * @param {string} [params.endDate] - Fecha fin
 * @param {string} [params.groupBy] - Agrupacion: day, month, year, type, location, severity
 * @param {number} [params.limit] - Limite de resultados
 * @returns {Promise<Object>} Estadisticas agregadas
 */
export async function obtenerEstadisticasMultas(params = {}) {
  const response = await apiClient.get('/multas/estadisticas', { params });
  return normalizarRespuestaDetalle(response);
}

/**
 * Obtiene ranking de ubicaciones con mas multas
 * @param {Object} params - Parametros de consulta
 * @param {string} [params.startDate] - Fecha inicio
 * @param {string} [params.endDate] - Fecha fin
 * @param {string} [params.tipoInfraccion] - Tipo de infraccion
 * @param {number} [params.limit] - Limite de resultados
 * @returns {Promise<Object>} Ranking de ubicaciones
 */
export async function obtenerRankingUbicaciones(params = {}) {
  const response = await apiClient.get('/multas/ubicaciones/ranking', { params });
  return normalizarRespuestaDetalle(response);
}

/**
 * Obtiene analisis temporal de multas
 * @param {Object} params - Parametros de consulta
 * @param {string} [params.startDate] - Fecha inicio
 * @param {string} [params.endDate] - Fecha fin
 * @param {string} [params.tipoAnalisis] - Tipo: hourly, daily, monthly, yearly
 * @returns {Promise<Object>} Analisis temporal con tendencias
 */
export async function obtenerAnalisisTemporal(params = {}) {
  const response = await apiClient.get('/multas/analisis/temporal', { params });
  return normalizarRespuestaDetalle(response);
}

/**
 * Obtiene metricas del dashboard de multas
 * @param {Object} params - Parametros de consulta
 * @param {string} [params.periodo] - Periodo: 7days, 30days, 90days, year
 * @returns {Promise<Object>} Dashboard con metricas generales
 */
export async function obtenerDashboardMultas(params = {}) {
  const response = await apiClient.get('/multas/dashboard', { params });
  return normalizarRespuestaDetalle(response);
}
