/**
 * Hook helper para resolver un codigo de distrito (1-21) a su objeto distrito.
 *
 * El backend solo expone `cod_distrito` como clave numerica, mientras que
 * varios endpoints cross-domain esperan el `nombre` del distrito como filtro
 * (`?distrito=CENTRO`). Este hook hace de puente reutilizando el endpoint
 * `/censo/distritos/resumen` (que retorna codigo + nombre + totalPoblacion)
 * como fuente unica de verdad.
 *
 * Como `useCensoResumenDistritos` esta cacheado por React Query con
 * staleTime 10min, el lookup es practicamente gratis si el usuario ya visito
 * la pagina de Censo o Multas.
 */

import { useMemo } from 'react';
import { useCensoResumenDistritos } from './useCenso';
import { DATE_CONFIG } from '../../constants';

const CODIGO_MIN = 1;
const CODIGO_MAX = 21;

/**
 * Resuelve un codigo de distrito al objeto correspondiente.
 *
 * @param {string|number} codigo - Codigo del distrito (1-21). Acepta string o number.
 * @returns {{
 *   distrito: { codigo: number, nombre: string, totalPoblacion: number } | null,
 *   distritos: Array<{ codigo: number, nombre: string, totalPoblacion: number }>,
 *   isLoading: boolean,
 *   error: Error | null,
 *   esCodigoValido: boolean
 * }}
 */
export function useDistritoPorCodigo(codigo) {
  const { data: resumen, isLoading, error } = useCensoResumenDistritos({
    año: DATE_CONFIG.DATASET_YEAR
  });

  // El backend envuelve la respuesta como `{ data: { data: [...], totalDistritos, filtros } }`
  const distritos = useMemo(
    () => resumen?.data?.data || resumen?.data || [],
    [resumen]
  );

  const codNum = Number(codigo);
  const esCodigoValido = Number.isInteger(codNum) && codNum >= CODIGO_MIN && codNum <= CODIGO_MAX;

  const distrito = useMemo(() => {
    if (!esCodigoValido) return null;
    return distritos.find(d => Number(d.codigo) === codNum) || null;
  }, [distritos, codNum, esCodigoValido]);

  return {
    distrito,
    distritos,
    isLoading,
    error,
    esCodigoValido
  };
}
