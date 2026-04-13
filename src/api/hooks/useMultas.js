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

/**
 * Hook para obtener datos de multas con filtros y paginacion
 * @param {Object} params - Parametros de consulta
 * @returns {Object} Resultado de useQuery
 */
export function useMultas(params) {
  return useQuery({
    queryKey: ['multas', params],
    queryFn: () => obtenerMultas(params),
    select: (response) => ({
      data: response.data || [],
      pagination: response.pagination || null,
      success: response.success
    })
  });
}

/**
 * Hook para obtener detalle de una multa por ID
 * @param {string} id - ID de la multa
 * @returns {Object} Resultado de useQuery
 */
export function useMultaDetalle(id) {
  return useQuery({
    queryKey: ['multa-detalle', id],
    queryFn: () => obtenerMultaPorId(id),
    enabled: Boolean(id)
  });
}

/**
 * Hook para obtener estadisticas de multas
 * @param {Object} params - Parametros de consulta
 * @returns {Object} Resultado de useQuery
 */
export function useMultasEstadisticas(params = {}) {
  return useQuery({
    queryKey: ['multas-estadisticas', params],
    queryFn: () => obtenerEstadisticasMultas(params),
    staleTime: 5 * 60 * 1000
  });
}

/**
 * Hook para obtener ranking de ubicaciones con mas multas
 * @param {Object} params - Parametros de consulta
 * @returns {Object} Resultado de useQuery
 */
export function useMultasRanking(params = {}) {
  return useQuery({
    queryKey: ['multas-ranking', params],
    queryFn: () => obtenerRankingUbicaciones(params),
    staleTime: 5 * 60 * 1000
  });
}

/**
 * Hook para obtener analisis temporal de multas
 * @param {Object} params - Parametros de consulta
 * @returns {Object} Resultado de useQuery
 */
export function useMultasTemporal(params = {}) {
  return useQuery({
    queryKey: ['multas-temporal', params],
    queryFn: () => obtenerAnalisisTemporal(params),
    staleTime: 5 * 60 * 1000
  });
}

/**
 * Hook para obtener metricas del dashboard de multas
 * @param {Object} params - Parametros de consulta
 * @returns {Object} Resultado de useQuery
 */
export function useMultasDashboard(params = {}) {
  return useQuery({
    queryKey: ['multas-dashboard', params],
    queryFn: () => obtenerDashboardMultas(params),
    staleTime: 5 * 60 * 1000
  });
}
