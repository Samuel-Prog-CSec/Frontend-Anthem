/**
 * Hooks de React Query para Contaminacion Acustica
 */

import { useQuery } from '@tanstack/react-query';
import { getNoiseData, getNoiseStatistics, getNoiseStationsList, getNoiseRanking, getNoiseCompliance, getNoiseTrends } from '../servicioRuido';

/**
 * Hook para obtener datos de contaminacion acustica con filtros y paginacion
 * @param {Object} params - Parametros de consulta
 * @returns {Object} Resultado de useQuery
 */
export function useRuido(params) {
  return useQuery({
    queryKey: ['ruido', params],
    queryFn: () => getNoiseData(params),
    select: (response) => ({
      data: response.data || [],
      pagination: response.pagination || null,
      filters: response.filters || null,
      success: response.success
    })
  });
}

/**
 * Hook para obtener la lista de estaciones de ruido (independiente de filtros)
 * @returns {Object} Resultado de useQuery con array de estaciones { nmt, nombre }
 */
export function useEstacionesRuido() {
  return useQuery({
    queryKey: ['ruido-estaciones'],
    queryFn: () => getNoiseStationsList(),
    staleTime: 30 * 60 * 1000, // 30 minutos - las estaciones no cambian
    select: (stations) => stations.map(s => ({
      value: String(s.nmt),
      label: s.nombre || `Estacion ${s.nmt}`
    }))
  });
}

/**
 * Hook para obtener estadisticas de ruido
 * @param {Object} params - Parametros (groupBy, nmt, etc.)
 * @returns {Object} Resultado de useQuery
 */
export function useRuidoStats(params) {
  return useQuery({
    queryKey: ['ruido-stats', params],
    queryFn: () => getNoiseStatistics(params),
    staleTime: 5 * 60 * 1000
  });
}

/**
 * Hook para obtener ranking de estaciones por nivel de ruido
 * @param {Object} params - Parametros (orderBy, limit, etc.)
 * @returns {Object} Resultado de useQuery
 */
export function useRuidoRanking(params) {
  return useQuery({
    queryKey: ['ruido-ranking', params],
    queryFn: () => getNoiseRanking(params),
    staleTime: 5 * 60 * 1000
  });
}

/**
 * Hook para obtener cumplimiento normativo por zona
 * @param {Object} params - Parametros (threshold, zoneType, etc.)
 * @returns {Object} Resultado de useQuery
 */
export function useRuidoCumplimiento(params) {
  return useQuery({
    queryKey: ['ruido-cumplimiento', params],
    queryFn: () => getNoiseCompliance(params),
    staleTime: 5 * 60 * 1000
  });
}

/**
 * Hook para obtener tendencias temporales de ruido
 * @param {Object} params - Parametros (startDate, endDate, nmt, groupBy, metric)
 * @param {Object} options - Opciones de React Query (enabled, etc.)
 * @returns {Object} Resultado de useQuery
 */
export function useRuidoTendencias(params, options = {}) {
  return useQuery({
    queryKey: ['ruido-tendencias', params],
    queryFn: () => getNoiseTrends(params),
    staleTime: 5 * 60 * 1000,
    ...options
  });
}
