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
import { normalizarRespuestaLista } from './normalizarRespuesta';

/**
 * Obtiene datos de contaminacion acustica con filtros
 * @param {Object} params - Parametros de consulta
 * @param {number} [params.año] - Ano de los datos
 * @param {number} [params.mes] - Mes (1-12)
 * @param {number|number[]} [params.nmt] - ID(s) de estacion
 * @param {string} [params.nombre] - Busqueda por nombre
 * @param {number} [params.page] - Numero de pagina
 * @param {number} [params.limit] - Items por pagina
 * @param {string} [params.sortBy] - Campo para ordenar por: 'fecha', 'nmt', 'nombre', 'laeq24', 'año', 'mes'
 * @param {string} [params.sortOrder] - Orden: 'asc' o 'desc'
 * @param {boolean} [params.includeInvalid] - Incluir datos invalidos (true, false)
 * @returns {Promise<Object>} Lista de mediciones con paginacion
 */
export async function obtenerDatosRuido(params = {}) {
  const queryParams = {
    page: params.page || PAGINATION.DEFAULT_PAGE,
    limit: params.limit || PAGINATION.DEFAULT_LIMIT,
    ...params
  };
  
  const response = await apiClient.get('/ruido', { params: queryParams });
  return normalizarRespuestaLista(response);
}

/**
 * Obtiene estadisticas de ruido
 * @param {Object} params - Parametros de consulta
 * @param {string} [params.groupBy] - Campo para agrupar: 'station', 'month', 'year'
 * @param {number} [params.nmt] - ID de estacion
 * @returns {Promise<Object>} Estadisticas agregadas
 */
export async function obtenerEstadisticasRuido(params = {}) {
  const response = await apiClient.get('/ruido/estadisticas', { params });
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
export async function obtenerRankingRuido(params = {}) {
  const response = await apiClient.get('/ruido/ranking', { params });
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
export async function obtenerCumplimientoRuido(params = {}) {
  const response = await apiClient.get('/ruido/cumplimiento/zona', { params });
  return response.data;
}

/**
 * Obtiene tendencias temporales de ruido
 * @param {Object} params - Parametros de consulta
 * @param {string} params.startDate - Fecha inicio (ISO 8601)
 * @param {string} params.endDate - Fecha fin (ISO 8601)
 * @param {number} [params.nmt] - ID de estacion
 * @param {string} [params.groupBy] - Agrupacion: 'day', 'month', 'year'
 * @param {string} [params.metric] - Metrica: 'laeq24', 'nivelDiurno', 'nivelVespertino', 'nivelNocturno'
 * @returns {Promise<Object>} Datos de tendencias temporales
 */
export async function obtenerTendenciasRuido(params = {}) {
  const response = await apiClient.get('/ruido/tendencias/temporal', { params });
  return response.data;
}

/**
 * Obtiene lista de estaciones unicas
 * @returns {Promise<Array>} Lista de estaciones con nombre e ID
 */
export async function obtenerListaEstacionesRuido() {
  // Intentar obtener estaciones desde estadisticas agrupadas por estacion
  try {
    const statsResponse = await apiClient.get('/ruido/estadisticas', {
      params: { groupBy: 'station' }
    });

    if (statsResponse.data?.success && statsResponse.data?.data?.data) {
      const statsData = statsResponse.data.data.data;
      return statsData
        .map(s => ({ nmt: s._id?.nmt, nombre: s._id?.nombre || `Estacion ${s._id?.nmt}` }))
        .filter(s => s.nmt != null)
        .sort((a, b) => a.nmt - b.nmt);
    }
  } catch {
    // Fallback: extraer de los datos principales
  }

  // Fallback: obtener datos y extraer estaciones unicas
  const response = await apiClient.get('/ruido', {
    params: { limit: 200 }
  });

  const datos = response.data?.data?.data || response.data?.data || [];
  const stationsMap = new Map();
  datos.forEach(d => {
    if (!stationsMap.has(d.nmt)) {
      stationsMap.set(d.nmt, { nmt: d.nmt, nombre: d.nombre || `Estacion ${d.nmt}` });
    }
  });
  return Array.from(stationsMap.values()).sort((a, b) => a.nmt - b.nmt);
}
