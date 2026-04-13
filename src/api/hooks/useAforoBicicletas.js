/**
 * Hooks de React Query para Aforo de Bicicletas
 */

import { useQuery } from '@tanstack/react-query';
import {
  obtenerAforoBicicletas,
  obtenerEstacionAforo,
  obtenerEstadisticasAforo,
  obtenerDistribucionHoraria,
  obtenerEstacionesAforo,
  obtenerTendenciasDiarias
} from '../servicioAforoBicicletas';

/**
 * Hook para obtener datos de aforo con filtros y paginacion
 * @param {Object} params - Parametros de consulta
 * @returns {Object} Resultado de useQuery
 */
export function useAforoBicicletas(params) {
  return useQuery({
    queryKey: ['aforo-bicicletas', params],
    queryFn: () => obtenerAforoBicicletas(params),
    select: (response) => ({
      data: response.data || [],
      pagination: response.pagination || null,
      success: response.success
    })
  });
}

/**
 * Hook para obtener detalle de una estacion de aforo
 * @param {string} identificador - Identificador de la estacion
 * @param {Object} params - Parametros adicionales
 * @returns {Object} Resultado de useQuery
 */
export function useAforoEstacion(identificador, params = {}) {
  return useQuery({
    queryKey: ['aforo-estacion', identificador, params],
    queryFn: () => obtenerEstacionAforo(identificador, params),
    enabled: Boolean(identificador)
  });
}

/**
 * Hook para obtener estadisticas generales de aforo
 * @param {Object} params - Parametros de consulta
 * @returns {Object} Resultado de useQuery
 */
export function useAforoEstadisticas(params = {}) {
  return useQuery({
    queryKey: ['aforo-estadisticas', params],
    queryFn: () => obtenerEstadisticasAforo(params),
    staleTime: 5 * 60 * 1000
  });
}

/**
 * Hook para obtener distribucion horaria (patron 0-23h)
 * @param {Object} params - Parametros de consulta
 * @returns {Object} Resultado de useQuery
 */
export function useAforoDistribucionHoraria(params = {}) {
  return useQuery({
    queryKey: ['aforo-distribucion-horaria', params],
    queryFn: () => obtenerDistribucionHoraria(params),
    staleTime: 5 * 60 * 1000
  });
}

/**
 * Hook para obtener ranking de estaciones
 * @param {Object} params - Parametros de consulta
 * @returns {Object} Resultado de useQuery
 */
export function useAforoEstaciones(params = {}) {
  return useQuery({
    queryKey: ['aforo-estaciones', params],
    queryFn: () => obtenerEstacionesAforo(params),
    staleTime: 5 * 60 * 1000
  });
}

/**
 * Hook para obtener tendencias diarias
 * @param {Object} params - Parametros de consulta
 * @returns {Object} Resultado de useQuery
 */
export function useAforoTendencias(params = {}) {
  return useQuery({
    queryKey: ['aforo-tendencias', params],
    queryFn: () => obtenerTendenciasDiarias(params),
    staleTime: 5 * 60 * 1000
  });
}
