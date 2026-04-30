/**
 * Hooks de React Query para Bicicletas (Disponibilidad)
 */

import { useQuery } from '@tanstack/react-query';
import {
  obtenerDisponibilidad, obtenerEstadisticas,
  obtenerTendenciasMensuales, obtenerMayorUso,
  obtenerComparativaSuscripciones
} from '../servicioBicicletas';

export function useBicicletas(params) {
  return useQuery({
    queryKey: ['bicicletas', params],
    queryFn: ({ signal }) => obtenerDisponibilidad(params, { signal }),
    select: (response) => ({
      data: response.data || [],
      pagination: response.pagination || null,
      success: response.success
    })
  });
}

export function useBicicletasEstadisticas(params = {}) {
  return useQuery({
    queryKey: ['bicicletas-estadisticas', params],
    queryFn: ({ signal }) => obtenerEstadisticas(params, { signal }),
    staleTime: 5 * 60 * 1000
  });
}

export function useBicicletasTendencias(params = {}) {
  return useQuery({
    queryKey: ['bicicletas-tendencias', params],
    queryFn: ({ signal }) => obtenerTendenciasMensuales(params, { signal }),
    staleTime: 5 * 60 * 1000
  });
}

export function useBicicletasMayorUso(params = {}) {
  return useQuery({
    queryKey: ['bicicletas-mayor-uso', params],
    queryFn: ({ signal }) => obtenerMayorUso(params, { signal }),
    staleTime: 5 * 60 * 1000
  });
}

export function useBicicletasSuscripciones(params = {}) {
  return useQuery({
    queryKey: ['bicicletas-suscripciones', params],
    queryFn: ({ signal }) => obtenerComparativaSuscripciones(params, { signal }),
    staleTime: 5 * 60 * 1000
  });
}
