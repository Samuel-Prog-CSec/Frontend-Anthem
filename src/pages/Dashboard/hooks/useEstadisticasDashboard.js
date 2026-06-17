/**
 * Hook useEstadisticasDashboard
 *
 * Carga las metricas resumidas del dashboard (una por modulo, con `limit: 1`
 * para traer solo `pagination.totalDocuments`) usando React Query (useQueries).
 * Asi se obtiene cache, deduplicacion y cancelacion automatica via el `signal`
 * que React Query inyecta en cada queryFn.
 *
 * Antes se lanzaban 9 fetch sueltos en un useEffect con Promise.allSettled, sin
 * cache: cada visita al dashboard repetia las 9 peticiones. Con React Query las
 * respuestas quedan cacheadas (staleTime 5 min) y se comparten/deduplican.
 *
 * Si un endpoint falla, el resto sigue mostrandose; solo esa tarjeta queda con
 * su contador a 0 y su mensaje de error.
 */

import { useQueries } from '@tanstack/react-query';
import { obtenerUbicaciones } from '../../../api/servicioUbicaciones';
import { obtenerDatosCalidadAire } from '../../../api/servicioCalidadAire';
import { obtenerDatosRuido } from '../../../api/servicioRuido';
import { obtenerDatosAccidentes } from '../../../api/servicioAccidentes';
import { obtenerAsignaciones } from '../../../api/servicioPatinetes';
import { obtenerDisponibilidad } from '../../../api/servicioBicicletas';
import { obtenerDatosCenso } from '../../../api/servicioCenso';
import { obtenerMultas } from '../../../api/servicioMultas';
import { obtenerAforoBicicletas } from '../../../api/servicioAforoBicicletas';

// Orden estable: clave de estado + servicio que devuelve `pagination.totalDocuments`.
const RECURSOS = [
  { clave: 'ubicaciones', fn: obtenerUbicaciones },
  { clave: 'calidadAire', fn: obtenerDatosCalidadAire },
  { clave: 'ruido', fn: obtenerDatosRuido },
  { clave: 'accidentes', fn: obtenerDatosAccidentes },
  { clave: 'patinetes', fn: obtenerAsignaciones },
  { clave: 'bicicletas', fn: obtenerDisponibilidad },
  { clave: 'censo', fn: obtenerDatosCenso },
  { clave: 'multas', fn: obtenerMultas },
  { clave: 'aforoBicicletas', fn: obtenerAforoBicicletas }
];

const STALE_TIME = 5 * 60 * 1000;

export function useEstadisticasDashboard() {
  const resultados = useQueries({
    queries: RECURSOS.map(({ clave, fn }) => ({
      queryKey: ['dashboard-conteo', clave],
      queryFn: ({ signal }) => fn({ limit: 1 }, { signal }),
      staleTime: STALE_TIME,
      // Solo interesa el total de documentos del recurso.
      select: (data) => data?.pagination?.totalDocuments || 0
    }))
  });

  return RECURSOS.reduce((acc, { clave }, i) => {
    const q = resultados[i];
    acc[clave] = {
      total: q.data || 0,
      cargando: q.isLoading,
      error: q.error ? (q.error.message || 'Error al cargar datos') : null
    };
    return acc;
  }, {});
}
