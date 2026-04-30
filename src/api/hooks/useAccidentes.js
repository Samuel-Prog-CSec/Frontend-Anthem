/**
 * Hooks de React Query para Accidentes
 */

import { useQuery } from '@tanstack/react-query';
import {
  obtenerDatosAccidentes, obtenerAccidentePorExpediente,
  obtenerEstadisticasAccidentes, obtenerComparativaDistritos,
  obtenerMapaCalorAccidentes
} from '../servicioAccidentes';

export function useAccidentes(params) {
  return useQuery({
    queryKey: ['accidentes', params],
    queryFn: ({ signal }) => obtenerDatosAccidentes(params, { signal }),
    select: (response) => ({
      data: response.data || [],
      pagination: response.pagination || null,
      success: response.success
    })
  });
}

export function useAccidenteExpediente(numero, options = {}) {
  return useQuery({
    queryKey: ['accidente-expediente', numero],
    queryFn: ({ signal }) => obtenerAccidentePorExpediente(numero, { signal }),
    enabled: Boolean(numero),
    ...options
  });
}

export function useAccidentesEstadisticas(params = {}) {
  return useQuery({
    queryKey: ['accidentes-estadisticas', params],
    queryFn: ({ signal }) => obtenerEstadisticasAccidentes(params, { signal }),
    staleTime: 5 * 60 * 1000
  });
}

export function useAccidentesComparativa(params = {}) {
  return useQuery({
    queryKey: ['accidentes-comparativa', params],
    queryFn: ({ signal }) => obtenerComparativaDistritos(params, { signal }),
    staleTime: 5 * 60 * 1000
  });
}

export function useAccidentesMapaCalor(params = {}) {
  return useQuery({
    queryKey: ['accidentes-mapa-calor', params],
    queryFn: ({ signal }) => obtenerMapaCalorAccidentes(params, { signal }),
    staleTime: 5 * 60 * 1000
  });
}
