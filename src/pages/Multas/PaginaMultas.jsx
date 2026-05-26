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
  useCensoResumenDistritos
} from '../../api/hooks';
import { PAGINATION, DATE_CONFIG } from '../../constants';

import EstadisticasMultas from './EstadisticasMultas';
import FiltrosMultas from './FiltrosMultas';
import GraficosMultas from './GraficosMultas';
import PanelDetalleMulta from './PanelDetalleMulta';
import TablaMultas from './TablaMultas';

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

  const { data: multasResult, isLoading, error, refetch } = useMultas(queryParams);
  const { data: dashboardResult } = useMultasDashboard({ periodo: 'year' });
  const { data: rankingResult } = useMultasRanking({ limit: 10 });
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

  // Grafico calificacion: aproximamos "leves" como (total - graves) porque el
  // endpoint solo expone los conteos de graves y velocidad.
  const datosGraficoCalificacion = useMemo(() => {
    if (!metricasGenerales.totalMultas) return [];
    const graves = metricasGenerales.multasGraves || 0;
    const leves = Math.max(metricasGenerales.totalMultas - graves, 0);
    return [
      { nombre: 'Leve', total: leves },
      { nombre: 'Grave', total: graves }
    ].filter(d => d.total > 0);
  }, [metricasGenerales]);

  const datosGraficoRanking = useMemo(() => {
    if (!ranking?.data) return [];
    return ranking.data.slice(0, 10).map(r => ({
      nombre: r.lugar ? (r.lugar.length > 30 ? r.lugar.substring(0, 30) + '...' : r.lugar) : r._id,
      total: r.totalMultas || r.count || 0
    }));
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

  return (
    <PageLayout
      eyebrow="Movilidad / Multas"
      title="Disuasion circulatoria"
      description={`1.36 millones de boletines con calificacion, importe, descuento aplicado y puntos detraidos durante ${DATE_CONFIG.DATASET_YEAR}.`}
    >
      <EstadisticasMultas
        totalMultas={totalMultas}
        importeMedio={importeMedio}
        puntosTotales={puntosTotales}
        porcentajeGraves={porcentajeGraves}
        multasPerCapita={multasPerCapita}
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
