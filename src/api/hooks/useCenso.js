/**
 * Hooks de React Query para Censo
 */

import { useQuery } from '@tanstack/react-query';
import {
  obtenerDatosCenso,
  obtenerPiramidePoblacion,
  obtenerEstadisticasDistritos,
  obtenerAnalisisDemografico,
  obtenerEvolucionCenso,
  obtenerDashboardCenso,
  obtenerResumenDistritos
} from '../servicioCenso';

export function useCenso(params) {
  return useQuery({
    queryKey: ['censo', params],
    queryFn: ({ signal }) => obtenerDatosCenso(params, { signal }),
    select: (response) => ({
      data: response.data || [],
      pagination: response.pagination || null,
      success: response.success
    })
  });
}

export function useCensoPiramide(params = {}) {
  return useQuery({
    queryKey: ['censo-piramide', params],
    queryFn: ({ signal }) => obtenerPiramidePoblacion(params, { signal }),
    staleTime: 5 * 60 * 1000
  });
}

export function useCensoDistritos(params = {}) {
  return useQuery({
    queryKey: ['censo-distritos', params],
    queryFn: ({ signal }) => obtenerEstadisticasDistritos(params, { signal }),
    staleTime: 5 * 60 * 1000
  });
}

export function useCensoAnalisis(params = {}) {
  return useQuery({
    queryKey: ['censo-analisis', params],
    queryFn: ({ signal }) => obtenerAnalisisDemografico(params, { signal }),
    staleTime: 5 * 60 * 1000
  });
}

export function useCensoEvolucion(params = {}) {
  return useQuery({
    queryKey: ['censo-evolucion', params],
    queryFn: ({ signal }) => obtenerEvolucionCenso(params, { signal }),
    staleTime: 5 * 60 * 1000
  });
}

export function useCensoDashboard(params = {}) {
  return useQuery({
    queryKey: ['censo-dashboard', params],
    queryFn: ({ signal }) => obtenerDashboardCenso(params, { signal }),
    staleTime: 5 * 60 * 1000
  });
}

export function useCensoResumenDistritos(params = {}) {
  return useQuery({
    queryKey: ['censo-resumen-distritos', params],
    queryFn: ({ signal }) => obtenerResumenDistritos(params, { signal }),
    staleTime: 10 * 60 * 1000
  });
}
