/**
 * Servicio de Censo
 *
 * Maneja todas las operaciones relacionadas con datos demograficos del censo:
 * - Consulta de datos censales con filtros
 * - Piramide poblacional
 * - Estadisticas y analisis por distrito
 * - Evolucion demografica temporal
 * - Resumen ligero de distritos (para metricas cruzadas)
 */

import apiClient from './axios';
import { normalizarRespuestaLista, normalizarRespuestaDetalle } from './normalizarRespuesta';
import { PAGINATION } from '../constants';

/**
 * Obtiene datos de censo con filtros
 * @param {Object} params - Parametros de consulta
 * @param {number} [params.page] - Numero de pagina
 * @param {number} [params.limit] - Items por pagina
 * @param {string} [params.sortBy] - Campo para ordenar
 * @param {string} [params.sortOrder] - Orden: 'asc' o 'desc'
 * @param {number|string} [params.distrito] - Codigo de distrito
 * @param {number|string} [params.barrio] - Codigo de barrio
 * @param {string} [params.grupoEdad] - Grupo de edad
 * @param {string} [params.startDate] - Fecha inicio (ISO 8601)
 * @param {string} [params.endDate] - Fecha fin (ISO 8601)
 * @param {number} [params.minEdad] - Edad minima
 * @param {number} [params.maxEdad] - Edad maxima
 * @param {boolean} [params.soloProductivos] - Solo poblacion productiva
 * @param {boolean} [params.soloTerceraEdad] - Solo tercera edad
 * @returns {Promise<Object>} Lista de registros censales con paginacion
 */
export async function obtenerDatosCenso(params = {}) {
  const queryParams = {
    page: params.page || PAGINATION.DEFAULT_PAGE,
    limit: params.limit || PAGINATION.DEFAULT_LIMIT,
    ...params
  };

  const response = await apiClient.get('/census', { params: queryParams });
  return normalizarRespuestaLista(response);
}

/**
 * Obtiene piramide poblacional
 * @param {Object} params - Parametros de consulta
 * @param {number} [params.distrito] - Codigo de distrito (opcional, todos si no se indica)
 * @param {number} [params.año] - Año de los datos (defecto: 2051)
 * @param {boolean} [params.incluirExtranjeros] - Incluir desglose de extranjeros
 * @returns {Promise<Object>} Piramide poblacional detallada y simplificada
 */
export async function obtenerPiramidePoblacion(params = {}) {
  const response = await apiClient.get('/census/pyramid', { params });
  return normalizarRespuestaDetalle(response);
}

/**
 * Obtiene estadisticas por distritos
 * @param {Object} params - Parametros de consulta
 * @param {number} [params.año] - Año de los datos
 * @param {number} [params.mes] - Mes de los datos
 * @param {boolean} [params.incluirBarrios] - Incluir desglose por barrios
 * @returns {Promise<Object>} Estadisticas por distrito con rankings
 */
export async function obtenerEstadisticasDistritos(params = {}) {
  const response = await apiClient.get('/census/districts/statistics', { params });
  return normalizarRespuestaDetalle(response);
}

/**
 * Obtiene analisis demografico avanzado
 * @param {Object} params - Parametros de consulta
 * @param {number} [params.año] - Año de los datos
 * @param {number} [params.mes] - Mes de los datos
 * @param {number} [params.distrito] - Codigo de distrito
 * @param {string} [params.tipoAnalisis] - Tipo: 'completo', 'edad', 'nacionalidad', 'genero'
 * @returns {Promise<Object>} Analisis demografico con indicadores
 */
export async function obtenerAnalisisDemografico(params = {}) {
  const response = await apiClient.get('/census/analysis/demographic', { params });
  return normalizarRespuestaDetalle(response);
}

/**
 * Obtiene evolucion demografica temporal
 * @param {Object} params - Parametros de consulta
 * @param {number} [params.distrito] - Codigo de distrito
 * @param {number} [params.startYear] - Año inicio
 * @param {number} [params.endYear] - Año fin
 * @param {string} [params.metrica] - Metrica: 'poblacionTotal', 'extranjeros', 'productiva'
 * @returns {Promise<Object>} Evolucion temporal con tendencia
 */
export async function obtenerEvolucionCenso(params = {}) {
  const response = await apiClient.get('/census/evolution', { params });
  return normalizarRespuestaDetalle(response);
}

/**
 * Obtiene metricas del dashboard demografico
 * @param {Object} params - Parametros de consulta
 * @param {number} [params.año] - Año de los datos
 * @param {number} [params.distrito] - Codigo de distrito
 * @returns {Promise<Object>} Dashboard con resumen general, top distritos, distribucion edad
 */
export async function obtenerDashboardCenso(params = {}) {
  const response = await apiClient.get('/census/dashboard', { params });
  return normalizarRespuestaDetalle(response);
}

/**
 * Obtiene resumen ligero de distritos con poblacion total.
 * Disenado para metricas cruzadas per capita desde otras paginas.
 * @param {Object} params - Parametros de consulta
 * @param {number} [params.año] - Año de los datos (defecto: 2051)
 * @param {number} [params.mes] - Mes de los datos
 * @returns {Promise<Object>} Array de {codigo, nombre, totalPoblacion} por distrito
 */
export async function obtenerResumenDistritos(params = {}) {
  const response = await apiClient.get('/census/distritos/resumen', { params });
  return normalizarRespuestaDetalle(response);
}
