/**
 * Servicio de Calidad del Aire
 * 
 * Maneja todas las operaciones relacionadas con datos de calidad del aire:
 * - Consulta de mediciones
 * - Estadisticas y tendencias
 * - Filtros por magnitud, estacion y fecha
 */

import apiClient from './axios';
import { PAGINATION, AIR_QUALITY_MAGNITUDES } from '../constants';
import { normalizarRespuestaLista } from './normalizarRespuesta';

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
export async function obtenerDatosCalidadAire(params = {}) {
  const queryParams = {
    page: params.page || PAGINATION.DEFAULT_PAGE,
    limit: params.limit || PAGINATION.DEFAULT_LIMIT,
    ...params
  };
  
  const response = await apiClient.get('/calidad-aire', { params: queryParams });
  return normalizarRespuestaLista(response);
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
export async function obtenerEstadisticasCalidadAire(params = {}) {
  const response = await apiClient.get('/calidad-aire/estadisticas', { params });
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
export async function obtenerTendenciasCalidadAire(params = {}) {
  const response = await apiClient.get('/calidad-aire/tendencias', { params });
  return response.data;
}

/**
 * Obtiene las estaciones de medicion de calidad del aire disponibles
 * @returns {Promise<Array>} Lista de estaciones unicas con su identificador
 */
export async function obtenerEstacionesCalidadAire() {
  try {
    const response = await apiClient.get('/calidad-aire/estadisticas', {
      params: { groupBy: 'station' }
    });

    if (response.data?.success && response.data?.data?.data) {
      return response.data.data.data
        .map(s => ({
          estacion: s._id?.estacion,
          puntoMuestreo: s._id?.puntoMuestreo,
          totalMediciones: s.totalRegistros
        }))
        .filter(s => s.estacion != null)
        .sort((a, b) => a.estacion - b.estacion);
    }
  } catch {
    // Fallback: extraer de datos principales
  }

  // Fallback: obtener una pagina de datos y extraer estaciones unicas
  const response = await apiClient.get('/calidad-aire', { params: { limit: 100 } });
  const datos = response.data?.data?.data || response.data?.data || [];
  const estaciones = [...new Set(datos.map(d => d.estacion))].filter(Boolean);
  return estaciones.sort((a, b) => a - b).map(e => ({ estacion: e }));
}

/**
 * Obtiene las magnitudes disponibles desde las constantes del frontend
 * @returns {Array} Lista de codigos de magnitud ordenados
 */
export function obtenerMagnitudesDisponibles() {
  // Las magnitudes estan definidas en las constantes del frontend (AIR_QUALITY_MAGNITUDES)
  // No es necesario hacer una llamada a la API para obtenerlas
  return Object.keys(AIR_QUALITY_MAGNITUDES).map(Number).sort((a, b) => a - b);
}
