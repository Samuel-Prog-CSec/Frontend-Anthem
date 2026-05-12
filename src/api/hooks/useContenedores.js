/**
 * Hooks de React Query para Contenedores de Residuos.
 *
 * Datos estaticos en backend (TTL infinito). En frontend usamos
 * staleTime alto para evitar refetches innecesarios entre navegaciones.
 */

import { useQuery, keepPreviousData } from '@tanstack/react-query';
import {
  obtenerContenedores,
  obtenerEstadisticasContenedores,
  obtenerEstadisticasPorDistrito,
  obtenerEstadisticasPorBarrio,
  obtenerContenedoresCercanos,
  contarContenedoresPorTipo,
  obtenerDistritosContenedores,
  obtenerBarriosContenedores,
  buscarContenedoresPorDireccion,
  obtenerMapaCalorContenedores,
  obtenerCoberturaContenedores,
  obtenerDensidadContenedores
} from '../servicioContenedores';

const STALE_TIME_LARGO = 30 * 60 * 1000; // 30 min: datos estaticos

export function useContenedores(params) {
  return useQuery({
    queryKey: ['contenedores', params],
    queryFn: ({ signal }) => obtenerContenedores(params, { signal }),
    placeholderData: keepPreviousData,
    select: (response) => ({
      data: response.data || [],
      pagination: response.pagination || null,
      success: response.success
    })
  });
}

export function useContenedoresEstadisticas() {
  return useQuery({
    queryKey: ['contenedores-estadisticas'],
    queryFn: ({ signal }) => obtenerEstadisticasContenedores({ signal }),
    staleTime: STALE_TIME_LARGO
  });
}

export function useContenedoresPorDistrito(distrito) {
  return useQuery({
    queryKey: ['contenedores-distrito', distrito || null],
    queryFn: ({ signal }) => obtenerEstadisticasPorDistrito(distrito, { signal }),
    staleTime: STALE_TIME_LARGO
  });
}

export function useContenedoresPorBarrio(distrito, barrio) {
  return useQuery({
    queryKey: ['contenedores-barrio', distrito, barrio || null],
    queryFn: ({ signal }) => obtenerEstadisticasPorBarrio(distrito, barrio, { signal }),
    enabled: Boolean(distrito),
    staleTime: STALE_TIME_LARGO
  });
}

export function useContenedoresCercanos(coords, options = {}) {
  return useQuery({
    queryKey: ['contenedores-cercanos', coords],
    queryFn: ({ signal }) => obtenerContenedoresCercanos(coords, { signal }),
    enabled: Boolean(coords?.longitude && coords?.latitude),
    staleTime: 5 * 60 * 1000,
    ...options
  });
}

export function useConteoContenedoresPorTipo(distrito, barrio) {
  return useQuery({
    queryKey: ['contenedores-conteo-tipo', distrito, barrio || null],
    queryFn: ({ signal }) => contarContenedoresPorTipo(distrito, barrio, { signal }),
    enabled: Boolean(distrito),
    staleTime: STALE_TIME_LARGO
  });
}

export function useDistritosContenedores() {
  return useQuery({
    queryKey: ['contenedores-distritos'],
    queryFn: ({ signal }) => obtenerDistritosContenedores({ signal }),
    staleTime: STALE_TIME_LARGO
  });
}

export function useBarriosContenedores(distrito) {
  return useQuery({
    queryKey: ['contenedores-barrios', distrito],
    queryFn: ({ signal }) => obtenerBarriosContenedores(distrito, { signal }),
    enabled: Boolean(distrito),
    staleTime: STALE_TIME_LARGO
  });
}

export function useBuscarContenedores(q, opciones = {}, options = {}) {
  return useQuery({
    queryKey: ['contenedores-buscar', q, opciones],
    queryFn: ({ signal }) => buscarContenedoresPorDireccion(q, opciones, { signal }),
    enabled: Boolean(q && q.length >= 3),
    staleTime: 60 * 1000,
    ...options
  });
}

export function useMapaCalorContenedores(tipoContenedor) {
  return useQuery({
    queryKey: ['contenedores-mapa-calor', tipoContenedor || null],
    queryFn: ({ signal }) => obtenerMapaCalorContenedores(tipoContenedor, { signal }),
    staleTime: STALE_TIME_LARGO
  });
}

export function useCoberturaContenedores(distrito) {
  return useQuery({
    queryKey: ['contenedores-cobertura', distrito || null],
    queryFn: ({ signal }) => obtenerCoberturaContenedores(distrito, { signal }),
    staleTime: STALE_TIME_LARGO
  });
}

export function useDensidadContenedores(params = {}) {
  return useQuery({
    queryKey: ['contenedores-densidad', params],
    queryFn: ({ signal }) => obtenerDensidadContenedores(params, { signal }),
    staleTime: STALE_TIME_LARGO
  });
}
