/**
 * Servicio de Censo
 *
 * Soporta AbortSignal vía options.signal para cancelacion via React Query.
 */

import apiClient from './axios';
import { normalizarRespuestaLista, normalizarRespuestaDetalle } from './normalizarRespuesta';
import { PAGINATION } from '../constants';

export async function obtenerDatosCenso(params = {}, { signal } = {}) {
  const queryParams = {
    page: params.page || PAGINATION.DEFAULT_PAGE,
    limit: params.limit || PAGINATION.DEFAULT_LIMIT,
    ...params
  };

  const response = await apiClient.get('/censo', { params: queryParams, signal });
  return normalizarRespuestaLista(response);
}

export async function obtenerPiramidePoblacion(params = {}, { signal } = {}) {
  const response = await apiClient.get('/censo/piramide', { params, signal });
  return normalizarRespuestaDetalle(response);
}

export async function obtenerEstadisticasDistritos(params = {}, { signal } = {}) {
  const response = await apiClient.get('/censo/distritos/estadisticas', { params, signal });
  return normalizarRespuestaDetalle(response);
}

export async function obtenerAnalisisDemografico(params = {}, { signal } = {}) {
  const response = await apiClient.get('/censo/analisis/demografico', { params, signal });
  return normalizarRespuestaDetalle(response);
}

export async function obtenerEvolucionCenso(params = {}, { signal } = {}) {
  const response = await apiClient.get('/censo/evolucion', { params, signal });
  return normalizarRespuestaDetalle(response);
}

export async function obtenerDashboardCenso(params = {}, { signal } = {}) {
  const response = await apiClient.get('/censo/dashboard', { params, signal });
  return normalizarRespuestaDetalle(response);
}

export async function obtenerResumenDistritos(params = {}, { signal } = {}) {
  const response = await apiClient.get('/censo/distritos/resumen', { params, signal });
  return normalizarRespuestaDetalle(response);
}
