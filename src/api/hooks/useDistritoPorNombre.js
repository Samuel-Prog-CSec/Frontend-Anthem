/**
 * Hook helper para resolver un nombre de distrito a su objeto distrito (con codigo).
 *
 * Util para drill-downs cross-domain donde un dataset solo expone el nombre
 * (Accidentes con `nombreDistrito`, Patinetes con `distrito.nombre`) y queremos
 * navegar a `/distritos/:codigo`. Usa `useCensoResumenDistritos` como fuente
 * unica de verdad y normaliza el nombre (uppercase, sin tildes) para tolerar
 * variaciones de capitalizacion o acentos en los datos de origen.
 *
 * Cacheado por React Query (staleTime 10min en useCensoResumenDistritos), asi
 * el lookup es practicamente gratis si el usuario ya visito Censo o Multas.
 */

import { useMemo } from 'react';
import { useCensoResumenDistritos } from './useCenso';
import { DATE_CONFIG } from '../../constants';

function normalizar(texto) {
  if (typeof texto !== 'string') return '';
  return texto
    .toUpperCase()
    .trim()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, ''); // quitar diacriticos
}

/**
 * Resuelve un nombre de distrito al objeto correspondiente.
 *
 * @param {string} nombre - Nombre del distrito (admite tildes/case mixto).
 * @returns {{
 *   distrito: { codigo: number, nombre: string, totalPoblacion: number } | null,
 *   isLoading: boolean,
 *   error: Error | null
 * }}
 */
export function useDistritoPorNombre(nombre) {
  const { data: resumen, isLoading, error } = useCensoResumenDistritos({
    año: DATE_CONFIG.DATASET_YEAR
  });

  const distritos = useMemo(
    () => resumen?.data?.data || resumen?.data || [],
    [resumen]
  );

  const distrito = useMemo(() => {
    const clave = normalizar(nombre);
    if (!clave) return null;
    return distritos.find(d => normalizar(d.nombre) === clave) || null;
  }, [distritos, nombre]);

  return { distrito, isLoading, error };
}
