/**
 * Servicio de Asignacion de Patinetes
 *
 * Soporta AbortSignal vía options.signal para cancelacion via React Query.
 */

import apiClient from './axios';
import { normalizarRespuestaLista } from './normalizarRespuesta';
import { PAGINATION } from '../constants';

export async function obtenerAsignaciones(params = {}, { signal } = {}) {
  const queryParams = {
    page: params.page || PAGINATION.DEFAULT_PAGE,
    limit: params.limit || PAGINATION.DEFAULT_LIMIT,
    ...params
  };

  const response = await apiClient.get('/patinetes', { params: queryParams, signal });
  // El endpoint /patinetes envuelve la lista en `data.asignaciones`, no en
  // `data.data`. Sin este dataKey el normalizer no encontraba el array y
  // todas las stats de PaginaPatinetes salian a 0.
  return normalizarRespuestaLista(response, 'asignaciones');
}

export async function obtenerEstadisticasDistritos(params = {}, { signal } = {}) {
  const response = await apiClient.get('/patinetes/estadisticas/distritos', { params, signal });
  return response.data;
}

export async function obtenerAnalisisMercado(params = {}, { signal } = {}) {
  const response = await apiClient.get('/patinetes/analisis-mercado/proveedores', { params, signal });
  return response.data;
}

export async function obtenerZonasConcentracion(params = {}, { signal } = {}) {
  const response = await apiClient.get('/patinetes/zonas-concentracion', { params, signal });
  return response.data;
}

export async function obtenerDetallesArea(distrito, barrio, { signal } = {}) {
  const response = await apiClient.get(`/patinetes/area/${distrito}/${barrio}`, { signal });
  return response.data;
}
