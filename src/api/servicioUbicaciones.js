/**
 * Servicio de Ubicaciones
 *
 * Maneja todas las operaciones relacionadas con ubicaciones:
 * - Consulta de ubicaciones con filtros
 * - Puntos de medicion (acustica, trafico)
 * - Rutas de transporte publico
 *
 * Cada funcion acepta un `signal` opcional para soportar cancelacion via AbortController
 * (React Query lo provee automaticamente desde queryFn context para evitar race conditions
 * cuando el usuario navega o cambia filtros mientras hay requests en vuelo).
 */

import apiClient from './axios';
import { PAGINATION } from '../constants';
import { normalizarRespuestaLista } from './normalizarRespuesta';

/**
 * Obtiene ubicaciones con filtros opcionales
 * @param {Object} params - Parametros de consulta
 * @param {Object} [options] - { signal } AbortSignal opcional
 * @returns {Promise<Object>} Lista de ubicaciones con paginacion
 */
export async function obtenerUbicaciones(params = {}, { signal } = {}) {
  const queryParams = {
    page: params.page || PAGINATION.DEFAULT_PAGE,
    limit: params.limit || PAGINATION.LOCATIONS_DEFAULT_LIMIT,
    ...params
  };

  const response = await apiClient.get('/ubicaciones', { params: queryParams, signal });
  return normalizarRespuestaLista(response, 'ubicaciones');
}

/**
 * Obtiene puntos de medicion especificos
 * @param {string} measurementType - Tipo: 'acustica' o 'trafico'
 * @param {Object} [options] - { signal } AbortSignal opcional
 * @returns {Promise<Object>} Lista de puntos de medicion
 */
export async function obtenerPuntosMedicion(measurementType, { signal } = {}) {
  const response = await apiClient.get(`/ubicaciones/puntos-medicion/${measurementType}`, { signal });
  return response.data;
}

/**
 * Obtiene rutas de transporte publico
 * @param {string} transportType - Tipo: 'todos', 'cercanias', 'autobus', 'interurbano', 'metro', 'metro_ligero', 'taxi'
 * @param {Object} [options] - { signal } AbortSignal opcional
 * @returns {Promise<Object>} Datos de la ruta
 */
export async function obtenerRutasTransporte(transportType, { signal } = {}) {
  const response = await apiClient.get(`/ubicaciones/transporte/${transportType}`, { signal });
  return response.data;
}
