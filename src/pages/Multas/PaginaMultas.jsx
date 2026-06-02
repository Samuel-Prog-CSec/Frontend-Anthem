/**
 * Pagina de Multas de Trafico
 *
 * Visualizacion de multas e infracciones de trafico. Refactorizada en
 * sub-componentes para acotar responsabilidades.
 *
 * Bug fix transversal:
 *   - El endpoint /multas/dashboard expone los conteos en
 *     `data.metricas.general.*` y los derivados en `data.resumen.*`.
 *     Antes la pagina leia `metricas.totalMultas` y los stat cards
 *     salian a 0. Ahora se centraliza la lectura aqui y se reparte a
 *     EstadisticasMultas y a las graficas via props ya normalizados.
 */

import { useState, useCallback, useMemo } from 'react';
import { PageLayout } from '../../components/layout';
import {
  useMultas, useMultasDashboard, useMultasRanking, useMultaDetalle,
  useMultasEstadisticas, useCensoResumenDistritos
} from '../../api/hooks';
import { useFiltroGeo } from '../../context/useFiltroGeo';
import { PAGINATION, DATE_CONFIG, ETIQUETAS_CALIFICACION_MULTA } from '../../constants';
import { formatNumber } from '../../utils';

import EstadisticasMultas from './EstadisticasMultas';
import FiltrosMultas from './FiltrosMultas';
import GraficosMultas from './GraficosMultas';
import PanelDetalleMulta from './PanelDetalleMulta';
import TablaMultas from './TablaMultas';
import { formatearLugar } from './helpers';

// Orden de severidad para ordenar las barras del grafico de distribucion.
const ORDEN_CALIFICACION = ['LEVE', 'GRAVE', 'MUY_GRAVE'];

function PaginaMultas() {
  const [filtros, setFiltros] = useState({
    calificacion: '',
    denunciante: '',
    mes: '',
    tieneDescuento: ''
  });
  const [paginaActual, setPaginaActual] = useState(1);
  const [multaSeleccionada, setMultaSeleccionada] = useState(null);

  const queryParams = useMemo(() => {
    const params = {
      page: paginaActual,
      limit: PAGINATION.DEFAULT_LIMIT
    };
    if (filtros.calificacion) params.calificacion = filtros.calificacion;
    if (filtros.denunciante) params.denunciante = filtros.denunciante;
    if (filtros.tieneDescuento) params.tieneDescuento = filtros.tieneDescuento;
    if (filtros.mes) {
      const fecha = new Date(DATE_CONFIG.DATASET_YEAR, parseInt(filtros.mes) - 1, 1);
      params.startDate = fecha.toISOString();
      const fechaFin = new Date(DATE_CONFIG.DATASET_YEAR, parseInt(filtros.mes), 0);
      params.endDate = fechaFin.toISOString();
    }
    return params;
  }, [paginaActual, filtros]);

  // Parametros de filtro aplicables tambien a dashboard y ranking (sin
  // paginacion). Antes dashboard/ranking ignoraban los filtros y los KPIs
  // + grafico de calificacion no cambiaban al filtrar.
  const filtroAggParams = useMemo(() => {
    const params = { periodo: 'year' };
    if (filtros.calificacion) params.calificacion = filtros.calificacion;
    if (filtros.denunciante) params.denunciante = filtros.denunciante;
    if (filtros.tieneDescuento) params.tieneDescuento = filtros.tieneDescuento;
    if (filtros.mes) {
      const fecha = new Date(DATE_CONFIG.DATASET_YEAR, parseInt(filtros.mes) - 1, 1);
      params.startDate = fecha.toISOString();
      const fechaFin = new Date(DATE_CONFIG.DATASET_YEAR, parseInt(filtros.mes), 0);
      params.endDate = fechaFin.toISOString();
    }
    return params;
  }, [filtros]);

  // Distribucion real por calificacion (LEVE / GRAVE / MUY_GRAVE) via
  // /multas/estadisticas?groupBy=severity. Una distribucion no debe filtrarse
  // por calificacion (se colapsaria a una sola barra), pero si respeta el mes.
  const distribucionParams = useMemo(() => {
    const params = { groupBy: 'severity' };
    if (filtros.mes) {
      const fecha = new Date(DATE_CONFIG.DATASET_YEAR, parseInt(filtros.mes) - 1, 1);
      params.startDate = fecha.toISOString();
      params.endDate = new Date(DATE_CONFIG.DATASET_YEAR, parseInt(filtros.mes), 0, 23, 59, 59).toISOString();
    }
    return params;
  }, [filtros.mes]);

  const { data: multasResult, isLoading, error, refetch } = useMultas(queryParams);
  const { data: dashboardResult } = useMultasDashboard(filtroAggParams);
  const { data: distribucionResult } = useMultasEstadisticas(distribucionParams);
  const { data: rankingResult } = useMultasRanking({ limit: 10, ...filtroAggParams });
  const { data: detalleResult, isLoading: detalleLoading } = useMultaDetalle(multaSeleccionada);
  const { data: resumenCenso } = useCensoResumenDistritos({ año: DATE_CONFIG.DATASET_YEAR });

  const datos = useMemo(() => multasResult?.data || [], [multasResult?.data]);
  const paginacion = multasResult?.pagination || null;
  const dashboard = dashboardResult?.data || null;
  const ranking = rankingResult?.data || null;

  // Stats derivadas. La forma real del endpoint es:
  //   data.metricas.general.{ totalMultas, importeTotal, puntosTotal, multasGraves, ... }
  //   data.resumen.{ porcentajeGraves, importePromedioPorMulta, ... }
  // metricasGenerales se memoiza para tener referencia estable y no
  // invalidar `datosGraficoCalificacion` en cada render.
  const metricasGenerales = useMemo(
    () => dashboard?.metricas?.general || {},
    [dashboard]
  );
  const resumenDashboard = dashboard?.resumen || {};
  const totalMultas = metricasGenerales.totalMultas || 0;
  const importeMedio = Number(resumenDashboard.importePromedioPorMulta) || 0;
  const puntosTotales = metricasGenerales.puntosTotal || 0;
  const porcentajeGraves = Number(resumenDashboard.porcentajeGraves) || 0;

  // Grafico calificacion: distribucion real por severidad. El backend agrupa
  // por `$calificacion`, asi que cada barra es exacta (Leve / Grave / Muy grave)
  // en lugar de aproximar "leves" como total - graves (que colapsaba GRAVE y
  // MUY_GRAVE en una sola barra y absorberia cualquier calificacion nueva).
  const datosGraficoCalificacion = useMemo(() => {
    const lista = distribucionResult?.data?.estadisticas || [];
    return lista
      .map(item => {
        const cal = item._id?.calificacion ?? item.calificacion ?? item._id;
        return {
          nombre: ETIQUETAS_CALIFICACION_MULTA[cal] || cal,
          total: item.totalMultas || item.total || 0,
          orden: ORDEN_CALIFICACION.indexOf(cal)
        };
      })
      .filter(d => d.total > 0)
      .sort((a, b) => (a.orden < 0 ? 99 : a.orden) - (b.orden < 0 ? 99 : b.orden))
      .map(({ nombre, total }) => ({ nombre, total }));
  }, [distribucionResult]);

  const datosGraficoRanking = useMemo(() => {
    // El endpoint /multas/ubicaciones/ranking devuelve `data.ranking` (array
    // con _id = lugar). Antes se leia `ranking.data` (clave inexistente) y el
    // grafico de top ubicaciones nunca se renderizaba. Se mantiene el fallback
    // por tolerancia a cambios de shape.
    const lista = Array.isArray(ranking?.ranking)
      ? ranking.ranking
      : (Array.isArray(ranking?.data) ? ranking.data : []);
    if (lista.length === 0) return [];
    return lista.slice(0, 10).map(r => {
      const lugarRaw = r.lugar || r._id;
      const lugarLimpio = lugarRaw ? formatearLugar(lugarRaw) : null;
      const nombre = lugarLimpio && lugarLimpio !== '-'
        ? (lugarLimpio.length > 30 ? lugarLimpio.substring(0, 30) + '...' : lugarLimpio)
        : (lugarRaw || '-');
      return { nombre, total: r.totalMultas || r.count || 0 };
    });
  }, [ranking]);

  const multasPerCapita = useMemo(() => {
    if (!totalMultas || !resumenCenso?.data?.data) return null;
    const poblacionTotal = resumenCenso.data.data.reduce(
      (sum, d) => sum + (d.totalPoblacion || 0), 0
    );
    if (poblacionTotal === 0) return null;
    return ((totalMultas / poblacionTotal) * 1000).toFixed(1);
  }, [totalMultas, resumenCenso]);

  const manejarCambioFiltro = useCallback((nombre, valor) => {
    setFiltros(prev => ({ ...prev, [nombre]: valor }));
    setPaginaActual(1);
  }, []);

  const limpiarFiltros = useCallback(() => {
    setFiltros({ calificacion: '', denunciante: '', mes: '', tieneDescuento: '' });
    setPaginaActual(1);
  }, []);

  const manejarCambioPagina = useCallback((pagina) => {
    setPaginaActual(pagina);
  }, []);

  const manejarClickMulta = useCallback((id) => {
    setMultaSeleccionada(prev => prev === id ? null : id);
  }, []);

  const cerrarDetalle = useCallback(() => {
    setMultaSeleccionada(null);
  }, []);

  const refrescar = useCallback(() => {
    refetch();
  }, [refetch]);

  const hayFiltrosActivos = Boolean(
    filtros.calificacion || filtros.denunciante || filtros.mes || filtros.tieneDescuento
  );

  // Aviso explicito cuando el usuario tiene un filtro geografico activo:
  // las multas no tienen distrito normalizado en el dataset, asi que el
  // total no cambia y la per-capita global se interpretaria mal.
  const { distrito: distritoFiltrado } = useFiltroGeo();

  return (
    <PageLayout
      eyebrow="Movilidad / Multas"
      title="Disuasion circulatoria"
      description={
        paginacion?.totalDocuments
          ? `${formatNumber(paginacion.totalDocuments)} boletines con calificacion, importe, descuento aplicado y puntos detraidos durante ${DATE_CONFIG.DATASET_YEAR}.`
          : `Boletines con calificacion, importe, descuento aplicado y puntos detraidos durante ${DATE_CONFIG.DATASET_YEAR}.`
      }
    >
      <EstadisticasMultas
        totalMultas={totalMultas}
        importeMedio={importeMedio}
        puntosTotales={puntosTotales}
        porcentajeGraves={porcentajeGraves}
        multasPerCapita={multasPerCapita}
        distritoFiltrado={distritoFiltrado}
        isLoading={!dashboard}
      />

      <FiltrosMultas
        filtros={filtros}
        hayFiltrosActivos={hayFiltrosActivos}
        onCambioFiltro={manejarCambioFiltro}
        onLimpiar={limpiarFiltros}
        onRefrescar={refrescar}
      />

      {!isLoading && (
        <GraficosMultas
          datosGraficoCalificacion={datosGraficoCalificacion}
          datosGraficoRanking={datosGraficoRanking}
        />
      )}

      <PanelDetalleMulta
        detalle={detalleResult?.data}
        isLoading={detalleLoading}
        onCerrar={cerrarDetalle}
      />

      <TablaMultas
        datos={datos}
        paginacion={paginacion}
        paginaActual={paginaActual}
        isLoading={isLoading}
        error={error}
        onCambioPagina={manejarCambioPagina}
        onClickMulta={manejarClickMulta}
        onReintentar={refrescar}
      />
    </PageLayout>
  );
}

export default PaginaMultas;
