/**
 * Hooks de React Query para Trafico.
 *
 * IMPORTANTE: las queries solo se activan cuando el usuario aplica filtros
 * obligatorios (rango de fechas). Por eso todos usan `enabled` explicito
 * para evitar disparar queries pesadas en mount.
 */

import { useQuery, keepPreviousData } from '@tanstack/react-query';
import {
  obtenerTrafico,
  obtenerPuntoTrafico,
  obtenerEstadisticasTrafico,
  obtenerAnalisisCongestion,
  obtenerHistoricoTrafico
} from '../servicioTrafico';

const STALE_TIME = 5 * 60 * 1000; // 5 minutos coincide con cache backend

/**
 * Listado paginado. Solo se ejecuta si hay startDate y endDate.
 */
export function useTrafico(params, { enabled = true } = {}) {
  const tieneFechas = Boolean(params?.startDate && params?.endDate);
  return useQuery({
    queryKey: ['trafico', params],
    queryFn: ({ signal }) => obtenerTrafico(params, { signal }),
    placeholderData: keepPreviousData,
    enabled: tieneFechas && enabled,
    staleTime: STALE_TIME,
    select: (response) => ({
      data: response.data || [],
      pagination: response.pagination || null,
      stats: response.stats || null,
      success: response.success
    })
  });
}

/**
 * Detalle e historial de un punto.
 */
export function usePuntoTrafico(id, params = {}, options = {}) {
  return useQuery({
    queryKey: ['trafico-punto', id, params],
    queryFn: ({ signal }) => obtenerPuntoTrafico(id, params, { signal }),
    enabled: Boolean(id),
    staleTime: STALE_TIME,
    ...options
  });
}

/**
 * Estadisticas globales (HEAVY query).
 * Manualmente disparable: el componente decide cuando ejecutar.
 */
export function useEstadisticasTrafico(params, { enabled = false } = {}) {
  const tieneFechas = Boolean(params?.startDate && params?.endDate);
  return useQuery({
    queryKey: ['trafico-estadisticas', params],
    queryFn: ({ signal }) => obtenerEstadisticasTrafico(params, { signal }),
    enabled: tieneFechas && enabled,
    staleTime: STALE_TIME,
    // No reintentar si recibimos 429 (rate limit): el usuario debe esperar
    retry: (failureCount, error) => {
      if (error?.response?.status === 429) {return false;}
      return failureCount < 2;
    }
  });
}

/**
 * Analisis de congestion por distrito o tipoElemento.
 */
export function useAnalisisCongestion(params, { enabled = true } = {}) {
  const tieneFechas = Boolean(params?.startDate && params?.endDate);
  return useQuery({
    queryKey: ['trafico-congestion', params],
    queryFn: ({ signal }) => obtenerAnalisisCongestion(params, { signal }),
    enabled: tieneFechas && enabled,
    staleTime: STALE_TIME
  });
}

/**
 * Series temporales agregadas.
 */
export function useHistoricoTrafico(params, { enabled = true } = {}) {
  const tieneFechas = Boolean(params?.startDate && params?.endDate);
  return useQuery({
    queryKey: ['trafico-historico', params],
    queryFn: ({ signal }) => obtenerHistoricoTrafico(params, { signal }),
    enabled: tieneFechas && enabled,
    staleTime: STALE_TIME
  });
}
