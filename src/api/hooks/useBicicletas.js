/**
 * Hooks de React Query para Bicicletas (Disponibilidad)
 */

import { useQuery } from '@tanstack/react-query';
import {
  obtenerDisponibilidad, obtenerEstadisticas,
  obtenerTendenciasMensuales, obtenerMayorUso,
  obtenerComparativaSuscripciones
} from '../servicioBicicletas';

/**
 * Hook para obtener datos de disponibilidad de bicicletas con filtros
 * @param {Object} params - Parametros de consulta (page, limit, sortBy, sortOrder)
 * @returns {Object} Resultado de useQuery
 */
export function useBicicletas(params) {
  return useQuery({
    queryKey: ['bicicletas', params],
    queryFn: () => obtenerDisponibilidad(params),
    select: (response) => ({
      data: response.data || [],
      pagination: response.pagination || null,
      success: response.success
    })
  });
}

/**
 * Hook para obtener estadisticas de bicicletas
 * @param {Object} params - Parametros de consulta
 * @returns {Object} Resultado de useQuery
 */
export function useBicicletasEstadisticas(params = {}) {
  return useQuery({
    queryKey: ['bicicletas-estadisticas', params],
    queryFn: () => obtenerEstadisticas(params),
    staleTime: 5 * 60 * 1000
  });
}

/**
 * Hook para obtener tendencias mensuales de bicicletas
 * @param {Object} params - Parametros de consulta
 * @returns {Object} Resultado de useQuery
 */
export function useBicicletasTendencias(params = {}) {
  return useQuery({
    queryKey: ['bicicletas-tendencias', params],
    queryFn: () => obtenerTendenciasMensuales(params),
    staleTime: 5 * 60 * 1000
  });
}

/**
 * Hook para obtener ranking de mayor uso de bicicletas
 * @param {Object} params - Parametros de consulta
 * @returns {Object} Resultado de useQuery
 */
export function useBicicletasMayorUso(params = {}) {
  return useQuery({
    queryKey: ['bicicletas-mayor-uso', params],
    queryFn: () => obtenerMayorUso(params),
    staleTime: 5 * 60 * 1000
  });
}

/**
 * Hook para obtener comparativa entre tipos de suscripcion
 * @param {Object} params - Parametros de consulta
 * @returns {Object} Resultado de useQuery
 */
export function useBicicletasSuscripciones(params = {}) {
  return useQuery({
    queryKey: ['bicicletas-suscripciones', params],
    queryFn: () => obtenerComparativaSuscripciones(params),
    staleTime: 5 * 60 * 1000
  });
}
