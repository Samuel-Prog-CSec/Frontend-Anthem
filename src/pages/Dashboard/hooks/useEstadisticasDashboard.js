/**
 * Hook useEstadisticasDashboard
 *
 * Carga las metricas resumidas del dashboard (ubicaciones, calidad aire, ruido)
 * en paralelo con Promise.allSettled. Cancela en desmontaje via AbortController
 * (los servicios subyacentes ya soportan AbortSignal).
 */

import { useEffect, useState } from 'react';
import { obtenerUbicaciones } from '../../../api/servicioUbicaciones';
import { obtenerDatosCalidadAire } from '../../../api/servicioCalidadAire';
import { obtenerDatosRuido } from '../../../api/servicioRuido';

const ESTADO_INICIAL = {
  ubicaciones: { total: 0, cargando: true, error: null },
  calidadAire: { total: 0, cargando: true, error: null },
  ruido: { total: 0, cargando: true, error: null }
};

const aEstado = (resultado) => resultado.status === 'fulfilled'
  ? { total: resultado.value?.pagination?.totalDocuments || 0, cargando: false, error: null }
  : { total: 0, cargando: false, error: resultado.reason?.message || 'Error al cargar datos' };

export function useEstadisticasDashboard() {
  const [estadisticas, setEstadisticas] = useState(ESTADO_INICIAL);

  useEffect(() => {
    const controlador = new AbortController();

    const cargarEstadisticas = async () => {
      const [resultadoUbicaciones, resultadoAire, resultadoRuido] = await Promise.allSettled([
        obtenerUbicaciones({ limit: 1 }, { signal: controlador.signal }),
        obtenerDatosCalidadAire({ limit: 1 }, { signal: controlador.signal }),
        obtenerDatosRuido({ limit: 1 }, { signal: controlador.signal })
      ]);

      if (controlador.signal.aborted) {return;}

      setEstadisticas({
        ubicaciones: aEstado(resultadoUbicaciones),
        calidadAire: aEstado(resultadoAire),
        ruido: aEstado(resultadoRuido)
      });
    };

    cargarEstadisticas();

    return () => controlador.abort();
  }, []);

  return estadisticas;
}
