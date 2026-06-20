/**
 * Hooks de React Query para Aforo de Bicicletas
 */

import { useQuery, keepPreviousData } from '@tanstack/react-query';
import {
  obtenerAforoBicicletas,
  obtenerEstacionAforo,
  obtenerEstadisticasAforo,
  obtenerDistribucionHoraria,
  obtenerEstacionesAforo,
  obtenerTendenciasDiarias
} from '../servicioAforoBicicletas';

export function useAforoBicicletas(params) {
  return useQuery({
    queryKey: ['aforo-bicicletas', params],
    queryFn: ({ signal }) => obtenerAforoBicicletas(params, { signal }),
    placeholderData: keepPreviousData,
    select: (response) => ({
      data: response.data || [],
      pagination: response.pagination || null,
      success: response.success
    })
  });
}

export function useAforoEstacion(identificador, params = {}) {
  return useQuery({
    queryKey: ['aforo-estacion', identificador, params],
    queryFn: ({ signal }) => obtenerEstacionAforo(identificador, params, { signal }),
    enabled: Boolean(identificador)
  });
}

export function useAforoEstadisticas(params = {}) {
  return useQuery({
    queryKey: ['aforo-estadisticas', params],
    queryFn: ({ signal }) => obtenerEstadisticasAforo(params, { signal }),
    staleTime: 5 * 60 * 1000
  });
}

export function useAforoDistribucionHoraria(params = {}) {
  return useQuery({
    queryKey: ['aforo-distribucion-horaria', params],
    queryFn: ({ signal }) => obtenerDistribucionHoraria(params, { signal }),
    staleTime: 5 * 60 * 1000
  });
}

export function useAforoEstaciones(params = {}) {
  return useQuery({
    queryKey: ['aforo-estaciones', params],
    queryFn: ({ signal }) => obtenerEstacionesAforo(params, { signal }),
    staleTime: 5 * 60 * 1000
  });
}

export function useAforoTendencias(params = {}) {
  return useQuery({
    queryKey: ['aforo-tendencias', params],
    queryFn: ({ signal }) => obtenerTendenciasDiarias(params, { signal }),
    staleTime: 5 * 60 * 1000
  });
}
