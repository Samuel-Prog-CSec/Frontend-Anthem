/**
 * Hooks de React Query para Accidentes
 */

import { useQuery } from '@tanstack/react-query';
import {
  obtenerDatosAccidentes, obtenerAccidentePorExpediente,
  obtenerEstadisticasAccidentes, obtenerComparativaDistritos,
  obtenerMapaCalorAccidentes
} from '../servicioAccidentes';

/**
 * Hook para obtener datos de accidentes con filtros y paginacion
 * @param {Object} params - Parametros de consulta (page, limit, distrito, tipoAccidente, etc.)
 * @returns {Object} Resultado de useQuery
 */
export function useAccidentes(params) {
  return useQuery({
    queryKey: ['accidentes', params],
    queryFn: () => obtenerDatosAccidentes(params),
    select: (response) => ({
      data: response.data || [],
      pagination: response.pagination || null,
      success: response.success
    })
  });
}

/**
 * Hook para obtener un accidente por numero de expediente
 * @param {string} numero - Numero de expediente
 * @param {Object} options - Opciones adicionales de useQuery (enabled, etc.)
 * @returns {Object} Resultado de useQuery
 */
export function useAccidenteExpediente(numero, options = {}) {
  return useQuery({
    queryKey: ['accidente-expediente', numero],
    queryFn: () => obtenerAccidentePorExpediente(numero),
    enabled: Boolean(numero),
    ...options
  });
}

/**
 * Hook para obtener estadisticas de accidentes
 * @param {Object} params - Parametros de consulta (startDate, endDate)
 * @returns {Object} Resultado de useQuery
 */
export function useAccidentesEstadisticas(params = {}) {
  return useQuery({
    queryKey: ['accidentes-estadisticas', params],
    queryFn: () => obtenerEstadisticasAccidentes(params),
    staleTime: 5 * 60 * 1000
  });
}

/**
 * Hook para obtener comparativa de accidentes entre distritos
 * @param {Object} params - Parametros de consulta
 * @returns {Object} Resultado de useQuery
 */
export function useAccidentesComparativa(params = {}) {
  return useQuery({
    queryKey: ['accidentes-comparativa', params],
    queryFn: () => obtenerComparativaDistritos(params),
    staleTime: 5 * 60 * 1000
  });
}

/**
 * Hook para obtener datos del mapa de calor de accidentes
 * @param {Object} params - Parametros de consulta (limite, precision, distrito, gravedad)
 * @returns {Object} Resultado de useQuery
 */
export function useAccidentesMapaCalor(params = {}) {
  return useQuery({
    queryKey: ['accidentes-mapa-calor', params],
    queryFn: () => obtenerMapaCalorAccidentes(params),
    staleTime: 5 * 60 * 1000
  });
}
