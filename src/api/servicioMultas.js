/**
 * Servicio de Multas
 *
 * Maneja todas las operaciones relacionadas con datos de multas de trafico.
 * Soporta AbortSignal vía options.signal para cancelacion via React Query.
 */

import apiClient from './axios';
import { normalizarRespuestaLista, normalizarRespuestaDetalle } from './normalizarRespuesta';
import { PAGINATION } from '../constants';

export async function obtenerMultas(params = {}, { signal } = {}) {
  const queryParams = {
    page: params.page || PAGINATION.DEFAULT_PAGE,
    limit: params.limit || PAGINATION.DEFAULT_LIMIT,
    ...params
  };

  const response = await apiClient.get('/multas', { params: queryParams, signal });
  return normalizarRespuestaLista(response);
}

export async function obtenerMultaPorId(id, { signal } = {}) {
  const response = await apiClient.get(`/multas/${id}`, { signal });
  return normalizarRespuestaDetalle(response);
}

export async function obtenerEstadisticasMultas(params = {}, { signal } = {}) {
  const response = await apiClient.get('/multas/estadisticas', { params, signal });
  return normalizarRespuestaDetalle(response);
}

export async function obtenerRankingUbicaciones(params = {}, { signal } = {}) {
  const response = await apiClient.get('/multas/ubicaciones/ranking', { params, signal });
  return normalizarRespuestaDetalle(response);
}

export async function obtenerAnalisisTemporal(params = {}, { signal } = {}) {
  const response = await apiClient.get('/multas/analisis/temporal', { params, signal });
  return normalizarRespuestaDetalle(response);
}

export async function obtenerDashboardMultas(params = {}, { signal } = {}) {
  const response = await apiClient.get('/multas/dashboard', { params, signal });
  return normalizarRespuestaDetalle(response);
}
