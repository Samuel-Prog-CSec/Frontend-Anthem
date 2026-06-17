/**
 * Servicio de Contenedores de Residuos
 *
 * Cliente HTTP para los endpoints `/contenedores` de la API.
 * Soporta AbortSignal via options.signal para cancelacion via React Query.
 */

import apiClient from './axios';
import { normalizarRespuestaLista, normalizarRespuestaDetalle } from './normalizarRespuesta';
import { PAGINATION } from '../constants';

/**
 * Listado paginado de contenedores con filtros
 */
export async function obtenerContenedores(params = {}, { signal } = {}) {
  const queryParams = {
    page: params.page || PAGINATION.DEFAULT_PAGE,
    limit: params.limit || PAGINATION.CONTAINERS_DEFAULT_LIMIT,
    ...params
  };

  const response = await apiClient.get('/contenedores', { params: queryParams, signal });
  return normalizarRespuestaLista(response);
}

/**
 * Resumen general por tipo
 */
export async function obtenerEstadisticasContenedores(lote, { signal } = {}) {
  const params = (lote !== undefined && lote !== null && lote !== '') ? { lote } : {};
  const response = await apiClient.get('/contenedores/estadisticas', { params, signal });
  return normalizarRespuestaDetalle(response);
}

/**
 * Estadisticas por distrito (todos o uno especifico)
 */
export async function obtenerEstadisticasPorDistrito(distrito, lote, { signal } = {}) {
  const params = {};
  if (distrito) { params.distrito = distrito; }
  if (lote !== undefined && lote !== null && lote !== '') { params.lote = lote; }
  const response = await apiClient.get('/contenedores/estadisticas/distrito', { params, signal });
  return normalizarRespuestaDetalle(response);
}

/**
 * Estadisticas por barrio dentro de un distrito
 */
export async function obtenerEstadisticasPorBarrio(distrito, barrio, { signal } = {}) {
  const params = barrio ? { distrito, barrio } : { distrito };
  const response = await apiClient.get('/contenedores/estadisticas/barrio', { params, signal });
  return normalizarRespuestaDetalle(response);
}

/**
 * Contenedores cercanos a unas coordenadas
 *
 * @param {Object} coords - { longitude, latitude, maxDistance?, tipoContenedor? }
 */
export async function obtenerContenedoresCercanos(coords = {}, { signal } = {}) {
  const response = await apiClient.get('/contenedores/cercanos', { params: coords, signal });
  return normalizarRespuestaDetalle(response);
}

/**
 * Conteo agregado por tipo en un area (distrito o distrito+barrio)
 */
export async function contarContenedoresPorTipo(distrito, barrio, { signal } = {}) {
  const params = barrio ? { distrito, barrio } : { distrito };
  const response = await apiClient.get('/contenedores/conteo-por-tipo', { params, signal });
  return normalizarRespuestaDetalle(response);
}

/**
 * Lista distinct de distritos con contenedores
 */
export async function obtenerDistritosContenedores({ signal } = {}) {
  const response = await apiClient.get('/contenedores/distritos', { signal });
  return normalizarRespuestaDetalle(response);
}

/**
 * Lista distinct de barrios para un distrito
 */
export async function obtenerBarriosContenedores(distrito, { signal } = {}) {
  const response = await apiClient.get(`/contenedores/barrios/${encodeURIComponent(distrito)}`, { signal });
  return normalizarRespuestaDetalle(response);
}

/**
 * Busqueda textual por direccion (usa indice $text)
 *
 * @param {string} q - Texto de busqueda (min 3 chars)
 * @param {Object} opciones - { tipoContenedor?, limit? }
 */
export async function buscarContenedoresPorDireccion(q, opciones = {}, { signal } = {}) {
  const params = { q, ...opciones };
  const response = await apiClient.get('/contenedores/buscar', { params, signal });
  return normalizarRespuestaDetalle(response);
}

/**
 * Datos para mapa de calor (puntos crudos limitados a 5000)
 */
export async function obtenerMapaCalorContenedores(tipoContenedor, { signal } = {}) {
  const params = tipoContenedor ? { tipoContenedor } : {};
  const response = await apiClient.get('/contenedores/mapa-calor', { params, signal });
  return normalizarRespuestaDetalle(response);
}

/**
 * Analisis de cobertura por distrito y tipo
 */
export async function obtenerCoberturaContenedores(distrito, { signal } = {}) {
  const params = distrito ? { distrito } : {};
  const response = await apiClient.get('/contenedores/cobertura', { params, signal });
  return normalizarRespuestaDetalle(response);
}

/**
 * Analisis de densidad por distrito (con o sin desglose por barrios)
 */
export async function obtenerDensidadContenedores(params = {}, { signal } = {}) {
  const response = await apiClient.get('/contenedores/analisis/densidad', { params, signal });
  return normalizarRespuestaDetalle(response);
}
