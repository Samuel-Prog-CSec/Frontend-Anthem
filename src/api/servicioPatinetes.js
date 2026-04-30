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
  return normalizarRespuestaLista(response);
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
