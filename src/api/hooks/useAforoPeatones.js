/**
 * Hooks de React Query para Aforo de Peatones
 * Estructura paralela a `useAforoBicicletas`.
 */

import { useQuery } from '@tanstack/react-query';
import {
  obtenerAforoPeatones,
  obtenerEstacionPeatones,
  obtenerEstadisticasPeatones,
  obtenerDistribucionHorariaPeatones,
  obtenerEstacionesPeatones,
  obtenerTendenciasDiariasPeatones,
  obtenerMapaPeatones
} from '../servicioAforoPeatones';

export function useAforoPeatones(params) {
  return useQuery({
    queryKey: ['aforo-peatones', params],
    queryFn: ({ signal }) => obtenerAforoPeatones(params, { signal }),
    select: (response) => ({
      data: response.data || [],
      pagination: response.pagination || null,
      success: response.success
    })
  });
}

export function useAforoPeatonesEstacion(identificador, params = {}) {
  return useQuery({
    queryKey: ['aforo-peatones-estacion', identificador, params],
    queryFn: ({ signal }) => obtenerEstacionPeatones(identificador, params, { signal }),
    enabled: Boolean(identificador)
  });
}

export function useAforoPeatonesEstadisticas(params = {}) {
  return useQuery({
    queryKey: ['aforo-peatones-estadisticas', params],
    queryFn: ({ signal }) => obtenerEstadisticasPeatones(params, { signal }),
    staleTime: 5 * 60 * 1000
  });
}

export function useAforoPeatonesDistribucionHoraria(params = {}) {
  return useQuery({
    queryKey: ['aforo-peatones-distribucion-horaria', params],
    queryFn: ({ signal }) => obtenerDistribucionHorariaPeatones(params, { signal }),
    staleTime: 5 * 60 * 1000
  });
}

export function useAforoPeatonesEstaciones(params = {}) {
  return useQuery({
    queryKey: ['aforo-peatones-estaciones', params],
    queryFn: ({ signal }) => obtenerEstacionesPeatones(params, { signal }),
    staleTime: 5 * 60 * 1000
  });
}

export function useAforoPeatonesTendencias(params = {}) {
  return useQuery({
    queryKey: ['aforo-peatones-tendencias', params],
    queryFn: ({ signal }) => obtenerTendenciasDiariasPeatones(params, { signal }),
    staleTime: 5 * 60 * 1000
  });
}

export function useMapaAforoPeatones(params = {}) {
  return useQuery({
    queryKey: ['aforo-peatones-mapa', params],
    queryFn: ({ signal }) => obtenerMapaPeatones(params, { signal }),
    staleTime: 5 * 60 * 1000
  });
}
