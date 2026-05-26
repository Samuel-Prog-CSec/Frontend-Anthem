/**
 * Hooks de React Query para Patinetes (Asignacion de scooters)
 */

import { useQuery, keepPreviousData } from '@tanstack/react-query';
import {
  obtenerAsignaciones, obtenerEstadisticasDistritos,
  obtenerAnalisisMercado, obtenerZonasConcentracion, obtenerDetallesArea
} from '../servicioPatinetes';

export function usePatinetes(params) {
  return useQuery({
    queryKey: ['patinetes', params],
    queryFn: ({ signal }) => obtenerAsignaciones(params, { signal }),
    placeholderData: keepPreviousData,
    select: (response) => ({
      data: response.data || [],
      pagination: response.pagination || null,
      success: response.success
    })
  });
}

export function usePatinetesEstadisticas(params = {}) {
  return useQuery({
    queryKey: ['patinetes-estadisticas', params],
    queryFn: ({ signal }) => obtenerEstadisticasDistritos(params, { signal }),
    staleTime: 5 * 60 * 1000
  });
}

export function usePatinetesMercado(params = {}) {
  return useQuery({
    queryKey: ['patinetes-mercado', params],
    queryFn: ({ signal }) => obtenerAnalisisMercado(params, { signal }),
    staleTime: 5 * 60 * 1000
  });
}

export function usePatinetesZonas(params = {}) {
  return useQuery({
    queryKey: ['patinetes-zonas', params],
    queryFn: ({ signal }) => obtenerZonasConcentracion(params, { signal }),
    staleTime: 5 * 60 * 1000
  });
}

export function usePatinetesDetallesArea(distrito, barrio, options = {}) {
  return useQuery({
    queryKey: ['patinetes-area', distrito, barrio],
    queryFn: ({ signal }) => obtenerDetallesArea(distrito, barrio, { signal }),
    enabled: Boolean(distrito && barrio),
    staleTime: 5 * 60 * 1000,
    ...options
  });
}
