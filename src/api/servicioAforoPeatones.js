/**
 * Servicio de Aforo de Peatones
 *
 * Soporta AbortSignal via options.signal para cancelacion via React Query.
 * Estructura paralela a `servicioAforoBicicletas`.
 */

import apiClient from './axios';
import { normalizarRespuestaLista, normalizarRespuestaDetalle } from './normalizarRespuesta';
import { PAGINATION } from '../constants';

export async function obtenerAforoPeatones(params = {}, { signal } = {}) {
  const queryParams = {
    page: params.page || PAGINATION.DEFAULT_PAGE,
    limit: params.limit || PAGINATION.DEFAULT_LIMIT,
    ...params
  };

  const response = await apiClient.get('/aforo-peatones', { params: queryParams, signal });
  return normalizarRespuestaLista(response);
}

export async function obtenerEstacionPeatones(identificador, params = {}, { signal } = {}) {
  const response = await apiClient.get(`/aforo-peatones/estacion/${identificador}`, { params, signal });
  return normalizarRespuestaDetalle(response);
}

export async function obtenerEstadisticasPeatones(params = {}, { signal } = {}) {
  const response = await apiClient.get('/aforo-peatones/estadisticas', { params, signal });
  return normalizarRespuestaDetalle(response);
}

export async function obtenerDistribucionHorariaPeatones(params = {}, { signal } = {}) {
  const response = await apiClient.get('/aforo-peatones/distribucion-horaria', { params, signal });
  return normalizarRespuestaDetalle(response);
}

export async function obtenerEstacionesPeatones(params = {}, { signal } = {}) {
  const response = await apiClient.get('/aforo-peatones/estaciones', { params, signal });
  return normalizarRespuestaDetalle(response);
}

export async function obtenerTendenciasDiariasPeatones(params = {}, { signal } = {}) {
  const response = await apiClient.get('/aforo-peatones/tendencias/diario', { params, signal });
  return normalizarRespuestaDetalle(response);
}

export async function obtenerMapaPeatones(params = {}, { signal } = {}) {
  const response = await apiClient.get('/aforo-peatones/mapa', { params, signal });
  return normalizarRespuestaDetalle(response);
}
