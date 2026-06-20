/**
 * Servicio de Aforo de Bicicletas
 *
 * Soporta AbortSignal vía options.signal para cancelacion via React Query.
 */

import apiClient from './axios';
import { normalizarRespuestaLista, normalizarRespuestaDetalle } from './normalizarRespuesta';
import { PAGINATION } from '../constants';

export async function obtenerAforoBicicletas(params = {}, { signal } = {}) {
  const queryParams = {
    page: params.page || PAGINATION.DEFAULT_PAGE,
    limit: params.limit || PAGINATION.DEFAULT_LIMIT,
    ...params
  };

  const response = await apiClient.get('/aforo-bicicletas', { params: queryParams, signal });
  return normalizarRespuestaLista(response);
}

export async function obtenerEstacionAforo(identificador, params = {}, { signal } = {}) {
  const response = await apiClient.get(`/aforo-bicicletas/estacion/${identificador}`, { params, signal });
  return normalizarRespuestaDetalle(response);
}

export async function obtenerEstadisticasAforo(params = {}, { signal } = {}) {
  const response = await apiClient.get('/aforo-bicicletas/estadisticas', { params, signal });
  return normalizarRespuestaDetalle(response);
}

export async function obtenerDistribucionHoraria(params = {}, { signal } = {}) {
  const response = await apiClient.get('/aforo-bicicletas/distribucion-horaria', { params, signal });
  return normalizarRespuestaDetalle(response);
}

export async function obtenerEstacionesAforo(params = {}, { signal } = {}) {
  const response = await apiClient.get('/aforo-bicicletas/estaciones', { params, signal });
  return normalizarRespuestaDetalle(response);
}

export async function obtenerTendenciasDiarias(params = {}, { signal } = {}) {
  const response = await apiClient.get('/aforo-bicicletas/tendencias/diario', { params, signal });
  return normalizarRespuestaDetalle(response);
}
