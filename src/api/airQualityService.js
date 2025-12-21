/**
 * Servicio de Calidad del Aire
 * 
 * Maneja todas las operaciones relacionadas con datos de calidad del aire:
 * - Consulta de mediciones
 * - Estadisticas y tendencias
 * - Filtros por magnitud, estacion y fecha
 */

import apiClient from './axios';
import { PAGINATION } from '../constants';

/**
 * Obtiene datos de calidad del aire con filtros
 * @param {Object} params - Parametros de consulta
 * @param {string} [params.startDate] - Fecha inicio (ISO 8601)
 * @param {string} [params.endDate] - Fecha fin (ISO 8601)
 * @param {number} [params.provincia] - Codigo de provincia
 * @param {number} [params.municipio] - Codigo de municipio
 * @param {number} [params.estacion] - ID de estacion de medicion
 * @param {number} [params.magnitud] - Codigo de magnitud (contaminante)
 * @param {number} [params.page] - Numero de pagina
 * @param {number} [params.limit] - Items por pagina
 * @param {string} [params.sortBy] - Campo para ordenar: 'fecha', 'estacion', 'magnitud', 'provincia', 'municipio'
 * @param {string} [params.sortOrder] - Orden de ordenacion (asc, desc)
 * @param {boolean} [params.includeInvalid] - Incluir datos invalidos (true, false)
 * @returns {Promise<Object>} Lista de mediciones con paginacion
 */
export async function getAirQualityData(params = {}) {
  const queryParams = {
    page: params.page || PAGINATION.DEFAULT_PAGE,
    limit: params.limit || PAGINATION.DEFAULT_LIMIT,
    ...params
  };
  
  const response = await apiClient.get('/air-quality', { params: queryParams });
  
  // Normalizar respuesta para el frontend
  if (response.data && response.data.data && response.data.data.data) {
    const { data, ...rest } = response.data;
    return {
      ...rest,
      data: data.data,
      pagination: data.pagination,
      filters: data.filters
    };
  }

  return response.data;
}

/**
 * Obtiene una medicion por ID
 * @param {string} id - ID de la medicion
 * @returns {Promise<Object>} Datos de la medicion
 */
export async function getAirQualityById(id) {
  const response = await apiClient.get(`/air-quality/${id}`);
  return response.data;
}

/**
 * Obtiene estadisticas de calidad del aire
 * @param {Object} params - Parametros de consulta
 * @param {string} [params.startDate] - Fecha inicio
 * @param {string} [params.endDate] - Fecha fin
 * @param {string} [params.groupBy] - Periodo de agrupacion (DIARIO, MENSUAL, ANUAL, STATION)
 * @param {number} [params.provincia] - Codigo de provincia
 * @param {number} [params.municipio] - Codigo de municipio
 * @param {number} [params.magnitud] - Codigo de magnitud
 * @returns {Promise<Object>} Estadisticas agregadas
 */
export async function getAirQualityStatistics(params = {}) {
  const response = await apiClient.get('/air-quality/statistics', { params });
  return response.data;
}

/**
 * Obtiene tendencias de calidad del aire
 * @param {Object} params - Parametros de consulta
 * @param {string} [params.startDate] - Fecha inicio
 * @param {string} [params.endDate] - Fecha fin
 * @param {number} [params.provincia] - Codigo de provincia
 * @param {number} [params.municipio] - Codigo de municipio
 * @param {number} [params.magnitud] - Codigo de magnitud
 * @returns {Promise<Object>} Datos de tendencias
 */
export async function getAirQualityTrends(params = {}) {
  const response = await apiClient.get('/air-quality/trends', { params });
  return response.data;
}

/**
 * Obtiene las estaciones de medicion disponibles
 * @returns {Promise<Array>} Lista de estaciones unicas
 */
export async function getAirQualityStations() {
  // Obtener ubicaciones de tipo punto_trafico que miden calidad del aire
  // Nota: Podria necesitar un endpoint dedicado en el backend
  const response = await apiClient.get('/locations', {
    params: { tipo: 'estacion_acustica' }
  });
  return response.data;
}

/**
 * Obtiene las magnitudes disponibles
 * @returns {Promise<Array>} Lista de magnitudes con mediciones
 */
export async function getAvailableMagnitudes() {
  // Obtener una muestra de datos para extraer magnitudes unicas
  const response = await apiClient.get('/air-quality');
  
  if (response.data.success && response.data.data) {
    const magnitudes = [...new Set(response.data.data.map(d => d.magnitud))];
    return magnitudes.sort((a, b) => a - b);
  }
  
  return [];
}
