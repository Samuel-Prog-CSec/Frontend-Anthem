/**
 * Servicio de Calidad del Aire
 *
 * Maneja todas las operaciones relacionadas con datos de calidad del aire:
 * - Consulta de mediciones
 * - Estadisticas y tendencias
 * - Filtros por magnitud, estacion y fecha
 *
 * Soporta AbortSignal vía options.signal para cancelacion via React Query.
 */

import apiClient from './axios';
import { PAGINATION, AIR_QUALITY_MAGNITUDES } from '../constants';
import { normalizarRespuestaLista } from './normalizarRespuesta';

/**
 * Obtiene datos de calidad del aire con filtros
 */
export async function obtenerDatosCalidadAire(params = {}, { signal } = {}) {
  const queryParams = {
    page: params.page || PAGINATION.DEFAULT_PAGE,
    limit: params.limit || PAGINATION.DEFAULT_LIMIT,
    ...params
  };

  const response = await apiClient.get('/calidad-aire', { params: queryParams, signal });
  return normalizarRespuestaLista(response);
}

/**
 * Obtiene estadisticas de calidad del aire
 */
export async function obtenerEstadisticasCalidadAire(params = {}, { signal } = {}) {
  const response = await apiClient.get('/calidad-aire/estadisticas', { params, signal });
  return response.data;
}

/**
 * Defaults geograficos del dataset Smart City Anthem 2051.
 * El dataset cubre exclusivamente Madrid capital, por lo que provincia=28
 * y municipio=79 son constantes salvo que el dataset se ample en el futuro.
 * El backend exige los 3 parametros (provincia, municipio, magnitud) para
 * activar la agregacion eficiente con indice compuesto.
 */
const PROVINCIA_MADRID = 28;
const MUNICIPIO_MADRID = 79;

/**
 * Obtiene tendencias de calidad del aire
 */
export async function obtenerTendenciasCalidadAire(params = {}, { signal } = {}) {
  const queryParams = {
    provincia: PROVINCIA_MADRID,
    municipio: MUNICIPIO_MADRID,
    ...params
  };
  const response = await apiClient.get('/calidad-aire/tendencias', { params: queryParams, signal });
  return response.data;
}

/**
 * Obtiene las estaciones de medicion de calidad del aire disponibles
 */
export async function obtenerEstacionesCalidadAire({ signal } = {}) {
  try {
    const response = await apiClient.get('/calidad-aire/estadisticas', {
      params: { groupBy: 'station' },
      signal
    });

    if (response.data?.success && response.data?.data?.data) {
      return response.data.data.data
        .map(s => ({
          estacion: s._id?.estacion,
          puntoMuestreo: s._id?.puntoMuestreo,
          totalMediciones: s.totalRegistros
        }))
        .filter(s => s.estacion != null)
        .sort((a, b) => a.estacion - b.estacion);
    }
  } catch {
    // Fallback: extraer de datos principales
  }

  const response = await apiClient.get('/calidad-aire', { params: { limit: 100 }, signal });
  const datos = response.data?.data?.data || response.data?.data || [];
  const estaciones = [...new Set(datos.map(d => d.estacion))].filter(Boolean);
  return estaciones.sort((a, b) => a - b).map(e => ({ estacion: e }));
}

/**
 * Obtiene las magnitudes disponibles desde las constantes del frontend
 */
export function obtenerMagnitudesDisponibles() {
  return Object.keys(AIR_QUALITY_MAGNITUDES).map(Number).sort((a, b) => a - b);
}
