/**
 * Hooks de React Query para Calidad del Aire
 *
 * Cada queryFn recibe { signal } del context de React Query y lo propaga al servicio
 * para permitir cancelacion automatica y prevenir race conditions.
 */

import { useQuery } from '@tanstack/react-query';
import { obtenerDatosCalidadAire, obtenerEstadisticasCalidadAire, obtenerTendenciasCalidadAire } from '../servicioCalidadAire';

export function useCalidadAire(params) {
  return useQuery({
    queryKey: ['calidad-aire', params],
    queryFn: ({ signal }) => obtenerDatosCalidadAire(params, { signal }),
    select: (response) => ({
      data: response.data || [],
      pagination: response.pagination || null,
      filters: response.filters || null,
      success: response.success
    })
  });
}

export function useCalidadAireStats(params) {
  return useQuery({
    queryKey: ['calidad-aire-stats', params],
    queryFn: ({ signal }) => obtenerEstadisticasCalidadAire(params, { signal }),
    staleTime: 5 * 60 * 1000
  });
}

export function useCalidadAireTendencias(params, options = {}) {
  return useQuery({
    queryKey: ['calidad-aire-tendencias', params],
    queryFn: ({ signal }) => obtenerTendenciasCalidadAire(params, { signal }),
    staleTime: 5 * 60 * 1000,
    ...options
  });
}
