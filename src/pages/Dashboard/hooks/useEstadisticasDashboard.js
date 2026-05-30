/**
 * Hook useEstadisticasDashboard
 *
 * Carga las metricas resumidas del dashboard en paralelo con
 * Promise.allSettled. Una llamada por modulo, con `limit: 1` para
 * minimizar payload: solo nos interesa `pagination.totalDocuments`.
 *
 * Cancela en desmontaje via AbortController (los servicios subyacentes
 * ya soportan AbortSignal). Si un endpoint falla, el resto sigue
 * mostrandose; solo esa tarjeta queda con su contador a 0 + error.
 */

import { useEffect, useState } from 'react';
import { obtenerUbicaciones } from '../../../api/servicioUbicaciones';
import { obtenerDatosCalidadAire } from '../../../api/servicioCalidadAire';
import { obtenerDatosRuido } from '../../../api/servicioRuido';
import { obtenerDatosAccidentes } from '../../../api/servicioAccidentes';
import { obtenerAsignaciones } from '../../../api/servicioPatinetes';
import { obtenerDisponibilidad } from '../../../api/servicioBicicletas';
import { obtenerDatosCenso } from '../../../api/servicioCenso';
import { obtenerMultas } from '../../../api/servicioMultas';
import { obtenerAforoBicicletas } from '../../../api/servicioAforoBicicletas';

const INICIAL = { total: 0, cargando: true, error: null };

const ESTADO_INICIAL = {
  ubicaciones: { ...INICIAL },
  calidadAire: { ...INICIAL },
  ruido: { ...INICIAL },
  accidentes: { ...INICIAL },
  patinetes: { ...INICIAL },
  bicicletas: { ...INICIAL },
  censo: { ...INICIAL },
  multas: { ...INICIAL },
  aforoBicicletas: { ...INICIAL }
};

const aEstado = (resultado) => resultado.status === 'fulfilled'
  ? { total: resultado.value?.pagination?.totalDocuments || 0, cargando: false, error: null }
  : { total: 0, cargando: false, error: resultado.reason?.message || 'Error al cargar datos' };

export function useEstadisticasDashboard() {
  const [estadisticas, setEstadisticas] = useState(ESTADO_INICIAL);

  useEffect(() => {
    const controlador = new AbortController();

    const cargarEstadisticas = async () => {
      const opts = { signal: controlador.signal };
      const args = [{ limit: 1 }, opts];

      const [
        rUbicaciones, rAire, rRuido, rAccidentes,
        rPatinetes, rBicicletas, rCenso, rMultas, rAforo
      ] = await Promise.allSettled([
        obtenerUbicaciones(...args),
        obtenerDatosCalidadAire(...args),
        obtenerDatosRuido(...args),
        obtenerDatosAccidentes(...args),
        obtenerAsignaciones(...args),
        obtenerDisponibilidad(...args),
        obtenerDatosCenso(...args),
        obtenerMultas(...args),
        obtenerAforoBicicletas(...args)
      ]);

      if (controlador.signal.aborted) { return; }

      setEstadisticas({
        ubicaciones: aEstado(rUbicaciones),
        calidadAire: aEstado(rAire),
        ruido: aEstado(rRuido),
        accidentes: aEstado(rAccidentes),
        patinetes: aEstado(rPatinetes),
        bicicletas: aEstado(rBicicletas),
        censo: aEstado(rCenso),
        multas: aEstado(rMultas),
        aforoBicicletas: aEstado(rAforo)
      });
    };

    cargarEstadisticas();

    return () => controlador.abort();
  }, []);

  return estadisticas;
}
