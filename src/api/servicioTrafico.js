/**
 * Servicio de Trafico
 *
 * Cliente HTTP para los endpoints `/trafico` de la API.
 * Soporta AbortSignal via options.signal para cancelacion via React Query.
 *
 * Notas operativas:
 *  - El endpoint /trafico/estadisticas tiene rate limit estricto (5/min)
 *    porque es una query pesada sobre 138M docs.
 *  - El endpoint /trafico/mapa requiere startDate y endDate y limita el
 *    rango a 7 dias.
 */

import apiClient from './axios';
import { normalizarRespuestaLista, normalizarRespuestaDetalle } from './normalizarRespuesta';
import { PAGINATION } from '../constants';

/**
 * Listado paginado de mediciones (pesado, requiere filtros).
 */
export async function obtenerTrafico(params = {}, { signal } = {}) {
  const queryParams = {
    page: params.page || PAGINATION.DEFAULT_PAGE,
    limit: params.limit || PAGINATION.DEFAULT_LIMIT,
    ...params
  };

  const response = await apiClient.get('/trafico', { params: queryParams, signal });
  return normalizarRespuestaLista(response);
}

/**
 * Detalle e historial de un punto de medida.
 */
export async function obtenerPuntoTrafico(id, params = {}, { signal } = {}) {
  const response = await apiClient.get(`/trafico/punto/${encodeURIComponent(id)}`, { params, signal });
  return normalizarRespuestaDetalle(response);
}

/**
 * Estadisticas globales (HEAVY: rate limit 5/min).
 */
export async function obtenerEstadisticasTrafico(params = {}, { signal } = {}) {
  const response = await apiClient.get('/trafico/estadisticas', { params, signal });
  return normalizarRespuestaDetalle(response);
}

/**
 * Analisis de congestion agrupado por distrito o tipoElemento.
 */
export async function obtenerAnalisisCongestion(params = {}, { signal } = {}) {
  const response = await apiClient.get('/trafico/analisis-congestion', { params, signal });
  return normalizarRespuestaDetalle(response);
}

/**
 * Series temporales agregadas (hour/day/week/month).
 */
export async function obtenerHistoricoTrafico(params = {}, { signal } = {}) {
  const response = await apiClient.get('/trafico/historico', { params, signal });
  return normalizarRespuestaDetalle(response);
}
