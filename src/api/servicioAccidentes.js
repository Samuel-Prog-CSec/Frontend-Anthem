/**
 * Servicio de Accidentes
 *
 * Maneja todas las operaciones relacionadas con datos de accidentalidad:
 * - Consulta de accidentes con filtros
 * - Busqueda por numero de expediente
 * - Estadisticas y heatmaps
 * - Analisis de seguridad y comparativas por distrito
 */

import apiClient from './axios';
import { normalizarRespuestaLista } from './normalizarRespuesta';
import { PAGINATION } from '../constants';

/**
 * Obtiene datos de accidentes con filtros
 * @param {Object} params - Parametros de consulta
 * @param {number} [params.page] - Numero de pagina
 * @param {number} [params.limit] - Items por pagina
 * @param {string} [params.sortBy] - Campo para ordenar: 'fecha', 'gravedad', 'distrito', 'tipoAccidente', 'numeroExpediente'
 * @param {string} [params.sortOrder] - Orden: 'asc' o 'desc'
 * @param {string} [params.distrito] - Filtro por distrito
 * @param {string} [params.tipoAccidente] - Tipo de accidente
 * @param {string} [params.gravedad] - Nivel de gravedad
 * @param {string} [params.startDate] - Fecha inicio (ISO 8601)
 * @param {string} [params.endDate] - Fecha fin (ISO 8601)
 * @param {boolean} [params.conAlcohol] - Filtro por presencia de alcohol
 * @param {boolean} [params.conDrogas] - Filtro por presencia de drogas
 * @param {string} [params.tipoVehiculo] - Tipo de vehiculo involucrado
 * @returns {Promise<Object>} Lista de accidentes con paginacion
 */
export async function obtenerDatosAccidentes(params = {}) {
  const queryParams = {
    page: params.page || PAGINATION.DEFAULT_PAGE,
    limit: params.limit || PAGINATION.DEFAULT_LIMIT,
    ...params
  };

  const response = await apiClient.get('/accidentes', { params: queryParams });
  return normalizarRespuestaLista(response);
}

/**
 * Obtiene un accidente por numero de expediente
 * @param {string} numero - Numero de expediente del accidente
 * @returns {Promise<Object>} Datos del accidente
 */
export async function obtenerAccidentePorExpediente(numero) {
  const response = await apiClient.get(`/accidentes/expediente/${numero}`);
  return response.data;
}

/**
 * Obtiene estadisticas de accidentes
 * @param {Object} params - Parametros de consulta
 * @param {string} [params.startDate] - Fecha inicio
 * @param {string} [params.endDate] - Fecha fin
 * @returns {Promise<Object>} Estadisticas agregadas
 */
export async function obtenerEstadisticasAccidentes(params = {}) {
  const response = await apiClient.get('/accidentes/estadisticas', { params });
  return response.data;
}

/**
 * Obtiene comparativa de accidentes entre distritos
 * @param {Object} params - Parametros de consulta
 * @returns {Promise<Object>} Datos comparativos por distrito
 */
export async function obtenerComparativaDistritos(params = {}) {
  const response = await apiClient.get('/accidentes/comparativa-distritos', { params });
  return response.data;
}

/**
 * Obtiene datos para mapa de calor de accidentes
 * @param {Object} params - Parametros de consulta
 * @param {number} [params.limite] - Maximo de puntos (default 500)
 * @param {number} [params.precision] - Precision de agrupacion en metros (default 100)
 * @param {string} [params.distrito] - Filtro por distrito
 * @param {string} [params.gravedad] - Filtro por gravedad
 * @returns {Promise<Object>} Datos agrupados para mapa de calor
 */
export async function obtenerMapaCalorAccidentes(params = {}) {
  const response = await apiClient.get('/accidentes/mapa-calor', { params });
  return response.data;
}
