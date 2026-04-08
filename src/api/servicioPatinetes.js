/**
 * Servicio de Asignacion de Patinetes
 *
 * Maneja todas las operaciones relacionadas con asignacion de patinetes:
 * - Consulta de asignaciones con filtros
 * - Estadisticas por distrito
 * - Analisis de mercado y proveedores
 * - Zonas de concentracion y optimizacion
 * - Dashboard y comparativas temporales
 */

import apiClient from './axios';
import { normalizarRespuestaLista } from './normalizarRespuesta';
import { PAGINATION } from '../constants';

/**
 * Obtiene datos de asignacion de patinetes con filtros
 * @param {Object} params - Parametros de consulta
 * @param {number} [params.page] - Numero de pagina
 * @param {number} [params.limit] - Items por pagina
 * @param {string} [params.sortBy] - Campo para ordenar: 'totalPatinetes', 'distrito', 'barrio', 'fecha', 'densidad', 'proveedor'
 * @param {string} [params.sortOrder] - Orden: 'asc' o 'desc'
 * @param {string} [params.distrito] - Filtro por distrito
 * @param {string} [params.barrio] - Filtro por barrio
 * @param {string} [params.proveedor] - Filtro por proveedor
 * @param {string} [params.tipoZona] - Tipo de zona
 * @param {string} [params.densidad] - Nivel de densidad
 * @param {string} [params.demanda] - Nivel de demanda
 * @param {string} [params.concentracion] - Nivel de concentracion
 * @param {number} [params.minPatinetes] - Minimo de patinetes
 * @param {number} [params.maxPatinetes] - Maximo de patinetes
 * @returns {Promise<Object>} Lista de asignaciones con paginacion
 */
export async function obtenerAsignaciones(params = {}) {
  const queryParams = {
    page: params.page || PAGINATION.DEFAULT_PAGE,
    limit: params.limit || PAGINATION.DEFAULT_LIMIT,
    ...params
  };

  const response = await apiClient.get('/patinetes', { params: queryParams });
  return normalizarRespuestaLista(response);
}

/**
 * Obtiene estadisticas de patinetes por distrito
 * @param {Object} params - Parametros de consulta
 * @returns {Promise<Object>} Estadisticas agregadas por distrito
 */
export async function obtenerEstadisticasDistritos(params = {}) {
  const response = await apiClient.get('/patinetes/estadisticas/distritos', { params });
  return response.data;
}

/**
 * Obtiene analisis de mercado por proveedor
 * @param {Object} params - Parametros de consulta
 * @returns {Promise<Object>} Datos de analisis de mercado
 */
export async function obtenerAnalisisMercado(params = {}) {
  const response = await apiClient.get('/patinetes/analisis-mercado/proveedores', { params });
  return response.data;
}

/**
 * Obtiene zonas de concentracion de patinetes
 * @param {Object} params - Parametros de consulta
 * @param {number} [params.limite] - Numero maximo de zonas
 * @returns {Promise<Object>} Zonas con alta concentracion de patinetes
 */
export async function obtenerZonasConcentracion(params = {}) {
  const response = await apiClient.get('/patinetes/zonas-concentracion', { params });
  return response.data;
}

/**
 * Obtiene detalles de un area especifica (distrito/barrio)
 * @param {string} distrito - Nombre del distrito
 * @param {string} barrio - Nombre del barrio
 * @returns {Promise<Object>} Datos detallados del area
 */
export async function obtenerDetallesArea(distrito, barrio) {
  const response = await apiClient.get(`/patinetes/area/${distrito}/${barrio}`);
  return response.data;
}

