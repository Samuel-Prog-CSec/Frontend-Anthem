/**
 * Hooks de React Query para Ubicaciones
 */

import { useQuery } from '@tanstack/react-query';
import { getLocations, getMeasurementPoints, getTransportRoutes } from '../servicioUbicaciones';

/**
 * Hook para obtener ubicaciones con filtros y paginacion
 * @param {Object} params - Parametros de consulta (type, page, limit, etc.)
 * @returns {Object} Resultado de useQuery con data, isLoading, error, refetch
 */
export function useUbicaciones(params) {
  return useQuery({
    queryKey: ['ubicaciones', params],
    queryFn: () => getLocations(params),
    select: (response) => ({
      data: response.data || [],
      pagination: response.pagination || null,
      success: response.success
    })
  });
}

/**
 * Hook para obtener estadisticas de conteo por tipo de ubicacion
 * @returns {Object} Resultado con stats: { total, estacion_acustica, punto_trafico, rutas_transporte }
 */
export function useUbicacionesStats() {
  return useQuery({
    queryKey: ['ubicaciones-stats'],
    queryFn: async () => {
      const [totalRes, acusticaRes, traficoRes, metroRes, busRes, cercaniasRes] = await Promise.all([
        getLocations({ limit: 1 }),
        getLocations({ limit: 1, type: 'estacion_acustica' }),
        getLocations({ limit: 1, type: 'punto_trafico' }),
        getLocations({ limit: 1, type: 'ruta_metro' }),
        getLocations({ limit: 1, type: 'ruta_autobus' }),
        getLocations({ limit: 1, type: 'ruta_cercanias' })
      ]);

      return {
        total: totalRes.pagination?.totalDocuments || 0,
        estacion_acustica: acusticaRes.pagination?.totalDocuments || 0,
        punto_trafico: traficoRes.pagination?.totalDocuments || 0,
        rutas_transporte: (metroRes.pagination?.totalDocuments || 0) +
                          (busRes.pagination?.totalDocuments || 0) +
                          (cercaniasRes.pagination?.totalDocuments || 0)
      };
    },
    staleTime: 10 * 60 * 1000 // 10 minutos - los conteos de ubicaciones cambian poco
  });
}

/**
 * Hook para obtener puntos de medicion por tipo
 * @param {string} measurementType - Tipo: 'acustica' o 'trafico'
 * @param {Object} options - Opciones adicionales de useQuery
 * @returns {Object} Resultado de useQuery
 */
export function usePuntosMedicion(measurementType, options = {}) {
  return useQuery({
    queryKey: ['puntos-medicion', measurementType],
    queryFn: () => getMeasurementPoints(measurementType),
    staleTime: 10 * 60 * 1000,
    enabled: !!measurementType,
    ...options
  });
}

/**
 * Hook para obtener rutas de transporte publico
 * @param {string} transportType - Tipo: 'cercanias', 'autobus', 'metro', etc.
 * @param {Object} options - Opciones adicionales de useQuery
 * @returns {Object} Resultado de useQuery
 */
export function useRutasTransporte(transportType, options = {}) {
  return useQuery({
    queryKey: ['rutas-transporte', transportType],
    queryFn: () => getTransportRoutes(transportType),
    staleTime: 10 * 60 * 1000,
    enabled: !!transportType,
    ...options
  });
}
