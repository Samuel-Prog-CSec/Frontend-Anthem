/**
 * Hooks de React Query para Ubicaciones
 *
 * Cada queryFn recibe { signal } del context de React Query y lo propaga al servicio,
 * permitiendo cancelar requests automaticamente cuando el componente desmonta o
 * los queryKeys cambian (evita race conditions).
 */

import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { obtenerUbicaciones, obtenerPuntosMedicion, obtenerRutasTransporte } from '../servicioUbicaciones';

/**
 * Hook para obtener ubicaciones con filtros y paginacion
 * @param {Object} params - Parametros de consulta (type, page, limit, etc.)
 * @returns {Object} Resultado de useQuery con data, isLoading, error, refetch
 */
export function useUbicaciones(params) {
  return useQuery({
    queryKey: ['ubicaciones', params],
    queryFn: ({ signal }) => obtenerUbicaciones(params, { signal }),
    // Evita parpadeo al paginar 82K ubicaciones (824 paginas)
    placeholderData: keepPreviousData,
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
    queryFn: async ({ signal }) => {
      const [totalRes, acusticaRes, traficoRes, metroRes, busRes, cercaniasRes] = await Promise.all([
        obtenerUbicaciones({ limit: 1 }, { signal }),
        obtenerUbicaciones({ limit: 1, type: 'estacion_acustica' }, { signal }),
        obtenerUbicaciones({ limit: 1, type: 'punto_trafico' }, { signal }),
        obtenerUbicaciones({ limit: 1, type: 'ruta_metro' }, { signal }),
        obtenerUbicaciones({ limit: 1, type: 'ruta_autobus' }, { signal }),
        obtenerUbicaciones({ limit: 1, type: 'ruta_cercanias' }, { signal })
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
    staleTime: 10 * 60 * 1000
  });
}

/**
 * Hook para obtener puntos de medicion por tipo
 * @param {string} measurementType - Tipo: 'acustica' o 'trafico'
 * @param {Object} options - Opciones adicionales de useQuery
 */
export function usePuntosMedicion(measurementType, options = {}) {
  return useQuery({
    queryKey: ['puntos-medicion', measurementType],
    queryFn: ({ signal }) => obtenerPuntosMedicion(measurementType, { signal }),
    staleTime: 10 * 60 * 1000,
    enabled: !!measurementType,
    ...options
  });
}

/**
 * Hook para obtener rutas de transporte publico
 * @param {string} transportType - Tipo: 'cercanias', 'autobus', 'metro', etc.
 * @param {Object} options - Opciones adicionales de useQuery
 */
export function useRutasTransporte(transportType, options = {}) {
  return useQuery({
    queryKey: ['rutas-transporte', transportType],
    queryFn: ({ signal }) => obtenerRutasTransporte(transportType, { signal }),
    staleTime: 10 * 60 * 1000,
    enabled: !!transportType,
    ...options
  });
}
