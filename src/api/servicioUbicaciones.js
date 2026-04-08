/**
 * Servicio de Ubicaciones
 * 
 * Maneja todas las operaciones relacionadas con ubicaciones:
 * - Consulta de ubicaciones con filtros
 * - Puntos de medicion (acustica, trafico)
 * - Rutas de transporte publico
 */

import apiClient from './axios';
import { PAGINATION } from '../constants';
import { normalizarRespuestaLista } from './normalizarRespuesta';

/**
 * Obtiene ubicaciones con filtros opcionales
 * @param {Object} params - Parametros de consulta
 * @param {string} [params.type] - Tipo de ubicacion
 * @param {number} [params.page] - Numero de pagina
 * @param {number} [params.limit] - Items por pagina
 * @param {string} [params.bbox] - Bounding box (minX,minY,maxX,maxY)
 * @param {string} [params.near] - Proximidad (x,y,radio_metros)
 * @returns {Promise<Object>} Lista de ubicaciones con paginacion
 */
export async function getLocations(params = {}) {
  const queryParams = {
    page: params.page || PAGINATION.DEFAULT_PAGE,
    limit: params.limit || PAGINATION.LOCATIONS_DEFAULT_LIMIT,
    ...params
  };
  
  const response = await apiClient.get('/ubicaciones', { params: queryParams });
  return normalizarRespuestaLista(response, 'ubicaciones');
}

/**
 * Obtiene puntos de medicion especificos
 * @param {string} measurementType - Tipo: 'acustica' o 'trafico'
 * @returns {Promise<Object>} Lista de puntos de medicion
 */
export async function getMeasurementPoints(measurementType) {
  const response = await apiClient.get(`/ubicaciones/puntos-medicion/${measurementType}`);
  return response.data;
}

/**
 * Obtiene rutas de transporte publico
 * @param {string} transportType - Tipo: 'todos', 'cercanias', 'autobus', 'interurbano', 'metro', 'metro_ligero', 'taxi'
 * @returns {Promise<Object>} Datos de la ruta
 */
export async function getTransportRoutes(transportType) {
  const response = await apiClient.get(`/ubicaciones/transporte/${transportType}`);
  return response.data;
}
