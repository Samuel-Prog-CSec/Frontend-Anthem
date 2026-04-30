/**
 * Hooks de React Query para endpoints `/mapa`.
 *
 * Los FeatureCollection son relativamente estables (agrupaciones por
 * distrito o por dia), asi que se configura un `staleTime` alto.
 * Soportan AbortController via signal del context de React Query.
 */

import { useQuery } from '@tanstack/react-query';
import {
  obtenerMapaUbicaciones,
  obtenerMapaAccidentes,
  obtenerMapaPatinetes,
  obtenerMapaAforo,
  obtenerMapaRuido,
  obtenerMapaMultas
} from '../servicioMapas';

const OPCIONES_DEFECTO = {
  staleTime: 15 * 60 * 1000,
  gcTime: 30 * 60 * 1000
};

function extraerFeatureCollection(respuesta) {
  const data = respuesta?.data ?? respuesta;
  if (data?.type === 'FeatureCollection') {return data;}
  if (data?.data?.type === 'FeatureCollection') {return data.data;}
  return { type: 'FeatureCollection', features: [], metadata: { total: 0 } };
}

export function useMapaUbicaciones(params = {}, options = {}) {
  return useQuery({
    queryKey: ['mapa-ubicaciones', params],
    queryFn: ({ signal }) => obtenerMapaUbicaciones(params, { signal }),
    select: extraerFeatureCollection,
    ...OPCIONES_DEFECTO,
    ...options
  });
}

export function useMapaAccidentes(params = {}, options = {}) {
  return useQuery({
    queryKey: ['mapa-accidentes', params],
    queryFn: ({ signal }) => obtenerMapaAccidentes(params, { signal }),
    select: extraerFeatureCollection,
    ...OPCIONES_DEFECTO,
    ...options
  });
}

export function useMapaPatinetes(params = {}, options = {}) {
  return useQuery({
    queryKey: ['mapa-patinetes', params],
    queryFn: ({ signal }) => obtenerMapaPatinetes(params, { signal }),
    select: extraerFeatureCollection,
    ...OPCIONES_DEFECTO,
    ...options
  });
}

export function useMapaAforo(params = {}, options = {}) {
  return useQuery({
    queryKey: ['mapa-aforo-bicicletas', params],
    queryFn: ({ signal }) => obtenerMapaAforo(params, { signal }),
    select: extraerFeatureCollection,
    ...OPCIONES_DEFECTO,
    ...options
  });
}

export function useMapaRuido(params = {}, options = {}) {
  return useQuery({
    queryKey: ['mapa-ruido', params],
    queryFn: ({ signal }) => obtenerMapaRuido(params, { signal }),
    select: extraerFeatureCollection,
    ...OPCIONES_DEFECTO,
    ...options
  });
}

export function useMapaMultas(params = {}, options = {}) {
  return useQuery({
    queryKey: ['mapa-multas', params],
    queryFn: ({ signal }) => obtenerMapaMultas(params, { signal }),
    select: extraerFeatureCollection,
    ...OPCIONES_DEFECTO,
    ...options
  });
}
