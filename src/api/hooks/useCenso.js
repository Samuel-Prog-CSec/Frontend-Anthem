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

/**
 * Hook para obtener datos de censo con filtros y paginacion
 * @param {Object} params - Parametros de consulta (page, limit, distrito, grupoEdad, etc.)
 * @returns {Object} Resultado de useQuery
 */
export function useCenso(params) {
  return useQuery({
    queryKey: ['censo', params],
    queryFn: () => obtenerDatosCenso(params),
    select: (response) => ({
      data: response.data || [],
      pagination: response.pagination || null,
      success: response.success
    })
  });
}

/**
 * Hook para obtener piramide poblacional
 * @param {Object} params - Parametros (distrito, año, incluirExtranjeros)
 * @returns {Object} Resultado de useQuery
 */
export function useCensoPiramide(params = {}) {
  return useQuery({
    queryKey: ['censo-piramide', params],
    queryFn: () => obtenerPiramidePoblacion(params),
    staleTime: 5 * 60 * 1000
  });
}

/**
 * Hook para obtener estadisticas por distritos
 * @param {Object} params - Parametros (año, mes, incluirBarrios)
 * @returns {Object} Resultado de useQuery
 */
export function useCensoDistritos(params = {}) {
  return useQuery({
    queryKey: ['censo-distritos', params],
    queryFn: () => obtenerEstadisticasDistritos(params),
    staleTime: 5 * 60 * 1000
  });
}

/**
 * Hook para obtener analisis demografico avanzado
 * @param {Object} params - Parametros (año, mes, distrito, tipoAnalisis)
 * @returns {Object} Resultado de useQuery
 */
export function useCensoAnalisis(params = {}) {
  return useQuery({
    queryKey: ['censo-analisis', params],
    queryFn: () => obtenerAnalisisDemografico(params),
    staleTime: 5 * 60 * 1000
  });
}

/**
 * Hook para obtener evolucion demografica temporal
 * @param {Object} params - Parametros (distrito, startYear, endYear, metrica)
 * @returns {Object} Resultado de useQuery
 */
export function useCensoEvolucion(params = {}) {
  return useQuery({
    queryKey: ['censo-evolucion', params],
    queryFn: () => obtenerEvolucionCenso(params),
    staleTime: 5 * 60 * 1000
  });
}

/**
 * Hook para obtener metricas del dashboard demografico
 * @param {Object} params - Parametros (año, distrito)
 * @returns {Object} Resultado de useQuery
 */
export function useCensoDashboard(params = {}) {
  return useQuery({
    queryKey: ['censo-dashboard', params],
    queryFn: () => obtenerDashboardCenso(params),
    staleTime: 5 * 60 * 1000
  });
}

/**
 * Hook para obtener resumen ligero de distritos con poblacion total.
 * Disenado para metricas cruzadas per capita desde otras paginas.
 * staleTime mas largo (10min) porque es dato muy estable.
 * @param {Object} params - Parametros (año, mes)
 * @returns {Object} Resultado de useQuery
 */
export function useCensoResumenDistritos(params = {}) {
  return useQuery({
    queryKey: ['censo-resumen-distritos', params],
    queryFn: () => obtenerResumenDistritos(params),
    staleTime: 10 * 60 * 1000
  });
}
