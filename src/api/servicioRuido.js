/**
 * Servicio de Contaminacion Acustica
 *
 * Maneja todas las operaciones relacionadas con datos de ruido.
 * Soporta AbortSignal vía options.signal para cancelacion via React Query.
 */

import apiClient from './axios';
import { PAGINATION } from '../constants';
import { normalizarRespuestaLista } from './normalizarRespuesta';

export async function obtenerDatosRuido(params = {}, { signal } = {}) {
  const queryParams = {
    page: params.page || PAGINATION.DEFAULT_PAGE,
    limit: params.limit || PAGINATION.DEFAULT_LIMIT,
    ...params
  };

  const response = await apiClient.get('/ruido', { params: queryParams, signal });
  return normalizarRespuestaLista(response);
}

export async function obtenerEstadisticasRuido(params = {}, { signal } = {}) {
  const response = await apiClient.get('/ruido/estadisticas', { params, signal });
  return response.data;
}

export async function obtenerRankingRuido(params = {}, { signal } = {}) {
  const response = await apiClient.get('/ruido/ranking', { params, signal });
  return response.data;
}

export async function obtenerCumplimientoRuido(params = {}, { signal } = {}) {
  const response = await apiClient.get('/ruido/cumplimiento/zona', { params, signal });
  return response.data;
}

export async function obtenerTendenciasRuido(params = {}, { signal } = {}) {
  const response = await apiClient.get('/ruido/tendencias/temporal', { params, signal });
  return response.data;
}

export async function obtenerListaEstacionesRuido({ signal } = {}) {
  try {
    const statsResponse = await apiClient.get('/ruido/estadisticas', {
      params: { groupBy: 'station' },
      signal
    });

    if (statsResponse.data?.success && statsResponse.data?.data?.data) {
      const statsData = statsResponse.data.data.data;
      return statsData
        .map(s => ({ nmt: s._id?.nmt, nombre: s._id?.nombre || `Estacion ${s._id?.nmt}` }))
        .filter(s => s.nmt != null)
        .sort((a, b) => a.nmt - b.nmt);
    }
  } catch {
    // Fallback: extraer de los datos principales
  }

  // El validator de /ruido cappea `limit` a 100 (PAGINATION.MAX_LIMIT).
  // Antes pediamos 200 y el endpoint devolvia 400. Si se necesitan mas
  // estaciones, consumir el endpoint dedicado de estaciones en lugar de
  // listar mediciones crudas.
  const response = await apiClient.get('/ruido', {
    params: { limit: 100 },
    signal
  });

  const datos = response.data?.data?.data || response.data?.data || [];
  const stationsMap = new Map();
  datos.forEach(d => {
    if (!stationsMap.has(d.nmt)) {
      stationsMap.set(d.nmt, { nmt: d.nmt, nombre: d.nombre || `Estacion ${d.nmt}` });
    }
  });
  return Array.from(stationsMap.values()).sort((a, b) => a.nmt - b.nmt);
}
