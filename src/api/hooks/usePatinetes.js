/**
 * Hooks de React Query para Patinetes (Asignacion de scooters)
 */

import { useQuery } from '@tanstack/react-query';
import {
  obtenerAsignaciones, obtenerEstadisticasDistritos,
  obtenerAnalisisMercado, obtenerZonasConcentracion, obtenerDetallesArea
} from '../servicioPatinetes';

/**
 * Hook para obtener asignaciones de patinetes con filtros y paginacion
 * @param {Object} params - Parametros de consulta (page, limit, distrito, densidad, tipoZona, etc.)
 * @returns {Object} Resultado de useQuery
 */
export function usePatinetes(params) {
  return useQuery({
    queryKey: ['patinetes', params],
    queryFn: () => obtenerAsignaciones(params),
    select: (response) => ({
      data: response.data || [],
      pagination: response.pagination || null,
      success: response.success
    })
  });
}

/**
 * Hook para obtener estadisticas de patinetes por distrito
 * @param {Object} params - Parametros de consulta
 * @returns {Object} Resultado de useQuery
 */
export function usePatinetesEstadisticas(params = {}) {
  return useQuery({
    queryKey: ['patinetes-estadisticas', params],
    queryFn: () => obtenerEstadisticasDistritos(params),
    staleTime: 5 * 60 * 1000
  });
}

/**
 * Hook para obtener analisis de mercado de patinetes (proveedores)
 * @param {Object} params - Parametros de consulta
 * @returns {Object} Resultado de useQuery
 */
export function usePatinetesMercado(params = {}) {
  return useQuery({
    queryKey: ['patinetes-mercado', params],
    queryFn: () => obtenerAnalisisMercado(params),
    staleTime: 5 * 60 * 1000
  });
}

/**
 * Hook para obtener zonas de concentracion de patinetes
 * @param {Object} params - Parametros de consulta
 * @returns {Object} Resultado de useQuery
 */
export function usePatinetesZonas(params = {}) {
  return useQuery({
    queryKey: ['patinetes-zonas', params],
    queryFn: () => obtenerZonasConcentracion(params),
    staleTime: 5 * 60 * 1000
  });
}

/**
 * Hook para obtener detalles de un area especifica (distrito/barrio)
 * @param {string} distrito - Nombre del distrito
 * @param {string} barrio - Nombre del barrio
 * @param {Object} options - Opciones adicionales de useQuery (enabled, etc.)
 * @returns {Object} Resultado de useQuery
 */
export function usePatinetesDetallesArea(distrito, barrio, options = {}) {
  return useQuery({
    queryKey: ['patinetes-area', distrito, barrio],
    queryFn: () => obtenerDetallesArea(distrito, barrio),
    enabled: Boolean(distrito && barrio),
    staleTime: 5 * 60 * 1000,
    ...options
  });
}
