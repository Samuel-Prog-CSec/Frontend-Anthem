/**
 * Servicio de Bicicletas (Disponibilidad)
 *
 * Soporta AbortSignal vía options.signal para cancelacion via React Query.
 */

import apiClient from './axios';
import { normalizarRespuestaLista } from './normalizarRespuesta';
import { PAGINATION } from '../constants';

export async function obtenerDisponibilidad(params = {}, { signal } = {}) {
  const queryParams = {
    page: params.page || PAGINATION.DEFAULT_PAGE,
    limit: params.limit || PAGINATION.BIKES_DEFAULT_LIMIT,
    ...params
  };

  const response = await apiClient.get('/bicicletas', { params: queryParams, signal });
  return normalizarRespuestaLista(response);
}

export async function obtenerEstadisticas(params = {}, { signal } = {}) {
  const response = await apiClient.get('/bicicletas/estadisticas', { params, signal });
  return response.data;
}

export async function obtenerTendenciasMensuales(params = {}, { signal } = {}) {
  const response = await apiClient.get('/bicicletas/tendencias/mensual', { params, signal });
  return response.data;
}

export async function obtenerMayorUso(params = {}, { signal } = {}) {
  const response = await apiClient.get('/bicicletas/mayor-uso', { params, signal });
  return response.data;
}

export async function obtenerComparativaSuscripciones(params = {}, { signal } = {}) {
  const response = await apiClient.get('/bicicletas/comparativa-suscripciones', { params, signal });
  return response.data;
}
