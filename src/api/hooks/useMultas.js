/**
 * Hooks de React Query para Multas
 */

import { useQuery } from '@tanstack/react-query';
import {
  obtenerMultas,
  obtenerMultaPorId,
  obtenerEstadisticasMultas,
  obtenerRankingUbicaciones,
  obtenerAnalisisTemporal,
  obtenerDashboardMultas
} from '../servicioMultas';

export function useMultas(params) {
  return useQuery({
    queryKey: ['multas', params],
    queryFn: ({ signal }) => obtenerMultas(params, { signal }),
    select: (response) => ({
      data: response.data || [],
      pagination: response.pagination || null,
      success: response.success
    })
  });
}

export function useMultaDetalle(id) {
  return useQuery({
    queryKey: ['multa-detalle', id],
    queryFn: ({ signal }) => obtenerMultaPorId(id, { signal }),
    enabled: Boolean(id)
  });
}

export function useMultasEstadisticas(params = {}) {
  return useQuery({
    queryKey: ['multas-estadisticas', params],
    queryFn: ({ signal }) => obtenerEstadisticasMultas(params, { signal }),
    staleTime: 5 * 60 * 1000
  });
}

export function useMultasRanking(params = {}) {
  return useQuery({
    queryKey: ['multas-ranking', params],
    queryFn: ({ signal }) => obtenerRankingUbicaciones(params, { signal }),
    staleTime: 5 * 60 * 1000
  });
}

export function useMultasTemporal(params = {}) {
  return useQuery({
    queryKey: ['multas-temporal', params],
    queryFn: ({ signal }) => obtenerAnalisisTemporal(params, { signal }),
    staleTime: 5 * 60 * 1000
  });
}

export function useMultasDashboard(params = {}) {
  return useQuery({
    queryKey: ['multas-dashboard', params],
    queryFn: ({ signal }) => obtenerDashboardMultas(params, { signal }),
    staleTime: 5 * 60 * 1000
  });
}
