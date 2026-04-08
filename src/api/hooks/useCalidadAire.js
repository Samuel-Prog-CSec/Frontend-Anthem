/**
 * Hooks de React Query para Calidad del Aire
 */

import { useQuery } from '@tanstack/react-query';
import { obtenerDatosCalidadAire, obtenerEstadisticasCalidadAire, obtenerTendenciasCalidadAire } from '../servicioCalidadAire';

/**
 * Hook para obtener datos de calidad del aire con filtros y paginacion
 * @param {Object} params - Parametros de consulta
 * @returns {Object} Resultado de useQuery
 */
export function useCalidadAire(params) {
  return useQuery({
    queryKey: ['calidad-aire', params],
    queryFn: () => obtenerDatosCalidadAire(params),
    select: (response) => ({
      data: response.data || [],
      pagination: response.pagination || null,
      filters: response.filters || null,
      success: response.success
    })
  });
}

/**
 * Hook para obtener estadisticas de calidad del aire
 * @param {Object} params - Parametros de consulta (groupBy, magnitud, etc.)
 * @returns {Object} Resultado de useQuery
 */
export function useCalidadAireStats(params) {
  return useQuery({
    queryKey: ['calidad-aire-stats', params],
    queryFn: () => obtenerEstadisticasCalidadAire(params),
    staleTime: 5 * 60 * 1000
  });
}

/**
 * Hook para obtener tendencias de calidad del aire
 * @param {Object} params - Parametros de consulta (magnitud, startDate, endDate)
 * @param {Object} options - Opciones adicionales de useQuery
 * @returns {Object} Resultado de useQuery
 */
export function useCalidadAireTrends(params, options = {}) {
  return useQuery({
    queryKey: ['calidad-aire-trends', params],
    queryFn: () => obtenerTendenciasCalidadAire(params),
    staleTime: 5 * 60 * 1000,
    ...options
  });
}
