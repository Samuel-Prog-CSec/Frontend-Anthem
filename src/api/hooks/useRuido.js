/**
 * Hooks de React Query para Contaminacion Acustica
 */

import { useQuery } from '@tanstack/react-query';
import { obtenerDatosRuido, obtenerEstadisticasRuido, obtenerListaEstacionesRuido, obtenerRankingRuido, obtenerCumplimientoRuido, obtenerTendenciasRuido } from '../servicioRuido';

export function useRuido(params) {
  return useQuery({
    queryKey: ['ruido', params],
    queryFn: ({ signal }) => obtenerDatosRuido(params, { signal }),
    select: (response) => ({
      data: response.data || [],
      pagination: response.pagination || null,
      filters: response.filters || null,
      success: response.success
    })
  });
}

export function useEstacionesRuido() {
  return useQuery({
    queryKey: ['ruido-estaciones'],
    queryFn: ({ signal }) => obtenerListaEstacionesRuido({ signal }),
    staleTime: 30 * 60 * 1000,
    select: (stations) => stations.map(s => ({
      value: String(s.nmt),
      label: s.nombre || `Estacion ${s.nmt}`
    }))
  });
}

export function useRuidoStats(params) {
  return useQuery({
    queryKey: ['ruido-stats', params],
    queryFn: ({ signal }) => obtenerEstadisticasRuido(params, { signal }),
    staleTime: 5 * 60 * 1000
  });
}

export function useRuidoRanking(params) {
  return useQuery({
    queryKey: ['ruido-ranking', params],
    queryFn: ({ signal }) => obtenerRankingRuido(params, { signal }),
    staleTime: 5 * 60 * 1000
  });
}

export function useRuidoCumplimiento(params) {
  return useQuery({
    queryKey: ['ruido-cumplimiento', params],
    queryFn: ({ signal }) => obtenerCumplimientoRuido(params, { signal }),
    staleTime: 5 * 60 * 1000
  });
}

export function useRuidoTendencias(params, options = {}) {
  return useQuery({
    queryKey: ['ruido-tendencias', params],
    queryFn: ({ signal }) => obtenerTendenciasRuido(params, { signal }),
    staleTime: 5 * 60 * 1000,
    ...options
  });
}
