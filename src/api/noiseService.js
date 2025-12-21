/**
 * Servicio de Contaminacion Acustica
 * 
 * Maneja todas las operaciones relacionadas con datos de ruido:
 * - Consulta de mediciones
 * - Estadisticas por estacion
 * - Rankings y comparativas
 * - Busqueda de estaciones
 */

import apiClient from './axios';
import { PAGINATION } from '../constants';

/**
 * Obtiene datos de contaminacion acustica con filtros
 * @param {Object} params - Parametros de consulta
 * @param {number} [params.year] - Ano de los datos
 * @param {number} [params.month] - Mes (1-12)
 * @param {number|number[]} [params.nmt] - ID(s) de estacion
 * @param {string} [params.name] - Busqueda por nombre
 * @param {number} [params.page] - Numero de pagina
 * @param {number} [params.limit] - Items por pagina
 * @param {string} [params.sortBy] - Campo para ordenar por: 'fecha', 'nmt', 'nombre', 'laeq24', 'año', 'mes'
 * @param {string} [params.sortOrder] - Orden: 'asc' o 'desc'
 * @param {boolean} [params.includeInvalid] - Incluir datos invalidos (true, false)
 * @returns {Promise<Object>} Lista de mediciones con paginacion
 */
export async function getNoiseData(params = {}) {
  const queryParams = {
    page: params.page || PAGINATION.DEFAULT_PAGE,
    limit: params.limit || PAGINATION.DEFAULT_LIMIT,
    ...params
  };
  
  const response = await apiClient.get('/noise-monitoring', { params: queryParams });
  
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
export async function getNoiseById(id) {
  const response = await apiClient.get(`/noise-monitoring/${id}`);
  return response.data;
}

/**
 * Obtiene estadisticas de ruido
 * @param {Object} params - Parametros de consulta
 * @param {string} [params.groupBy] - Campo para agrupar: 'station', 'month', 'year'
 * @param {number} [params.nmt] - ID de estacion
 * @returns {Promise<Object>} Estadisticas agregadas
 */
export async function getNoiseStatistics(params = {}) {
  const response = await apiClient.get('/noise-monitoring/statistics', { params });
  return response.data;
}

/**
 * Obtiene ranking de estaciones por nivel de ruido
 * @param {Object} params - Parametros de consulta
 * @param {number} [params.startDate] - Fecha de inicio
 * @param {number} [params.endDate] - Fecha de fin
 * @param {string} [params.orderBy] - Campo para ordenar: 'laeq24', 'diurno', 'vespertino', 'nocturno'
 * @param {number} [params.limit] - Numero de estaciones a retornar
 * @returns {Promise<Object>} Ranking de estaciones
 */
export async function getNoiseRanking(params = {}) {
  const response = await apiClient.get('/noise-monitoring/ranking', { params });
  return response.data;
}

/**
 * Busca estaciones de ruido por nombre
 * @param {Object} params - Parametros de consulta
 * @param {string} [params.query] - Termino de busqueda
 * @param {number} [params.limit] - Numero maximo de resultados
 * @returns {Promise<Object>} Estaciones encontradas
 */
export async function searchNoiseStations(params = {}) {
  const response = await apiClient.get('/noise-monitoring/stations/search', { params });
  return response.data;
}

/**
 * Comparar niveles de ruido entre estaciones
 * @param {number[]} stations - IDs de estaciones a comparar
 * @param {Object} params - Parametros adicionales
 * @param {number} [params.startDate] - Fecha de inicio
 * @param {number} [params.endDate] - Fecha de fin
 * @param {string} [params.metric] - Metricas a comparar: 'laeq24', 'diurno', 'vespertino', 'nocturno'
 * @returns {Promise<Object>} Datos comparativos
 */
export async function compareStations(stations, params = {}) {
  const response = await apiClient.get('/noise-monitoring/stations/compare', {
    params: { stations: stations, ...params }
  });
  return response.data;
}

/**
 * Obtiene tendencias temporales de ruido
 * @param {Object} params - Parametros de consulta
 * @param {number} [params.nmt] - ID de estacion
 * @param {number} [params.startDate] - Fecha de inicio
 * @param {number} [params.endDate] - Fecha de fin
 * @param {string} [params.groupBy] - Agrupacion: 'day', 'week', 'month', 'year'
 * @param {string} [params.metric] - Metricas a analizar: 'laeq24', 'diurno', 'vespertino', 'nocturno'
 * @returns {Promise<Object>} Datos de tendencias
 */
export async function getNoiseTrends(params = {}) {
  const response = await apiClient.get('/noise-monitoring/trends/temporal', { params });
  return response.data;
}

/**
 * Obtiene cumplimiento normativo por zona
 * @param {Object} params - Parametros de consulta
 * @param {number} [params.startDate] - Fecha de inicio
 * @param {number} [params.endDate] - Fecha de fin
 * @param {string} [params.threshold] - Umbral de cumplimiento en dB (40-100)
 * @param {string} [params.zoneType] - Tipo de zona geografica: 'residential', 'commercial', 'industrial', 'mixed'
 * @returns {Promise<Object>} Datos de cumplimiento
 */
export async function getNoiseCompliance(params = {}) {
  const response = await apiClient.get('/noise-monitoring/compliance/zone', { params });
  return response.data;
}

/**
 * Obtiene lista de estaciones unicas
 * @returns {Promise<Array>} Lista de estaciones con nombre e ID
 */
export async function getNoiseStationsList() {
  const response = await apiClient.get('/noise-monitoring', {
    params: { limit: 200 }
  });
  
  if (response.data.success && response.data.data) {
    // Extraer estaciones unicas
    const stationsMap = new Map();
    response.data.data.forEach(d => {
      if (!stationsMap.has(d.nmt)) {
        stationsMap.set(d.nmt, { nmt: d.nmt, name: d.name });
      }
    });
    return Array.from(stationsMap.values()).sort((a, b) => a.nmt - b.nmt);
  }
  
  return [];
}
