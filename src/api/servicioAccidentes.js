/**
 * Servicio de Accidentes
 *
 * Maneja todas las operaciones relacionadas con datos de accidentalidad.
 * Soporta AbortSignal vía options.signal para cancelacion via React Query.
 */

import apiClient from './axios';
import { normalizarRespuestaLista } from './normalizarRespuesta';
import { PAGINATION } from '../constants';

export async function obtenerDatosAccidentes(params, { signal } = {}) {
  // El default `= {}` solo cubre `undefined`, no `null`; se normaliza explicito
  // para que un params null (Distrito antes de resolver) no rompa con null.page.
  const p = params || {};
  const queryParams = {
    page: p.page || PAGINATION.DEFAULT_PAGE,
    limit: p.limit || PAGINATION.DEFAULT_LIMIT,
    ...p
  };

  const response = await apiClient.get('/accidentes', { params: queryParams, signal });
  return normalizarRespuestaLista(response);
}

export async function obtenerAccidentePorExpediente(numero, { signal } = {}) {
  const response = await apiClient.get(`/accidentes/expediente/${numero}`, { signal });
  return response.data;
}

export async function obtenerEstadisticasAccidentes(params = {}, { signal } = {}) {
  const response = await apiClient.get('/accidentes/estadisticas', { params, signal });
  return response.data;
}

export async function obtenerComparativaDistritos(params = {}, { signal } = {}) {
  const response = await apiClient.get('/accidentes/comparativa-distritos', { params, signal });
  return response.data;
}

export async function obtenerMapaCalorAccidentes(params = {}, { signal } = {}) {
  const response = await apiClient.get('/accidentes/mapa-calor', { params, signal });
  return response.data;
}
