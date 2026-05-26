/**
 * Pagina de Censo Demografico
 *
 * Refactorizada en sub-componentes (Estadisticas, Filtros, Graficos,
 * PanelDetalleDistrito, Tabla) siguiendo el patron de
 * CalidadAire/AforoPeatones/Multas.
 */

import { useState, useCallback, useMemo } from 'react';
import { PageLayout } from '../../components/layout';
import { useCenso, useCensoDashboard, useCensoDistritos } from '../../api/hooks';
import { PAGINATION, DATE_CONFIG, ETIQUETAS_GRUPOS_EDAD } from '../../constants';

import EstadisticasCenso from './EstadisticasCenso';
import FiltrosCenso from './FiltrosCenso';
import GraficosCenso from './GraficosCenso';
import PanelDetalleDistrito from './PanelDetalleDistrito';
import TablaCenso from './TablaCenso';

function PaginaCenso() {
  const [filtros, setFiltros] = useState({
    distrito: '',
    barrio: '',
    grupoEdad: '',
    mes: ''
  });
  const [paginaActual, setPaginaActual] = useState(1);
  const [distritoDetalle, setDistritoDetalle] = useState(null);

  const queryParams = useMemo(() => {
    const params = {
      page: paginaActual,
      limit: PAGINATION.DEFAULT_LIMIT
    };
    if (filtros.distrito) params.distrito = filtros.distrito;
    if (filtros.barrio) params.barrio = filtros.barrio;
    if (filtros.grupoEdad) params.grupoEdad = filtros.grupoEdad;
    if (filtros.mes) {
      const fecha = new Date(DATE_CONFIG.DATASET_YEAR, parseInt(filtros.mes) - 1, 1);
      params.startDate = fecha.toISOString();
      const fechaFin = new Date(DATE_CONFIG.DATASET_YEAR, parseInt(filtros.mes), 0);
      params.endDate = fechaFin.toISOString();
    }
    return params;
  }, [paginaActual, filtros]);

  const statsParams = useMemo(() => ({
    año: DATE_CONFIG.DATASET_YEAR,
    ...(filtros.mes ? { mes: parseInt(filtros.mes) } : {})
  }), [filtros.mes]);

  const { data: censoResult, isLoading, error, refetch } = useCenso(queryParams);
  const { data: dashboardResult } = useCensoDashboard(statsParams);
  const { data: distritosResult } = useCensoDistritos(statsParams);

  const datos = useMemo(() => censoResult?.data || [], [censoResult?.data]);
  const paginacion = censoResult?.pagination || null;
  const dashboard = dashboardResult?.data || null;
  const distritosStats = distritosResult?.data || null;

  const datosGraficoDistritos = useMemo(() => {
    if (!distritosStats?.districtStatistics) return [];
    return distritosStats.districtStatistics
      .sort((a, b) => b.poblacionTotal - a.poblacionTotal)
      .slice(0, 10)
      .map(d => ({
        nombre: d.distrito || d.nombre || `Distrito ${d.codigoDistrito}`,
        espanoles: d.totalEspañoles || d.poblacionTotal - (d.totalExtranjeros || 0),
        extranjeros: d.totalExtranjeros || 0
      }));
  }, [distritosStats]);

  const datosGraficoEdad = useMemo(() => {
    if (!dashboard?.distribucionEdad) return [];
    return dashboard.distribucionEdad.map(g => ({
      name: ETIQUETAS_GRUPOS_EDAD[g.grupoEdad] || g.grupoEdad || g._id,
      value: g.totalPoblacion || g.total || g.count || 0
    }));
  }, [dashboard]);

  const opcionesDistrito = useMemo(() => {
    if (!distritosStats?.districtStatistics) return [];
    return distritosStats.districtStatistics.map(d => ({
      value: String(d.codigoDistrito),
      label: d.distrito || d.nombre || `Distrito ${d.codigoDistrito}`
    }));
  }, [distritosStats]);

  const detalleDistritoData = useMemo(() => {
    if (!distritoDetalle || !distritosStats?.districtStatistics) return null;
    return distritosStats.districtStatistics.find(
      d => d.codigoDistrito === distritoDetalle
    );
  }, [distritoDetalle, distritosStats]);

  const manejarCambioFiltro = useCallback((nombre, valor) => {
    setFiltros(prev => {
      const nuevos = { ...prev, [nombre]: valor };
      if (nombre === 'distrito') {
        nuevos.barrio = '';
      }
      return nuevos;
    });
    setPaginaActual(1);
  }, []);

  const limpiarFiltros = useCallback(() => {
    setFiltros({ distrito: '', barrio: '', grupoEdad: '', mes: '' });
    setPaginaActual(1);
  }, []);

  const manejarCambioPagina = useCallback((pagina) => {
    setPaginaActual(pagina);
  }, []);

  const manejarClickDistrito = useCallback((codigoDistrito) => {
    setDistritoDetalle(prev => prev === codigoDistrito ? null : codigoDistrito);
  }, []);

  const cerrarDetalle = useCallback(() => {
    setDistritoDetalle(null);
  }, []);

  const refrescar = useCallback(() => {
    refetch();
  }, [refetch]);

  const resumen = dashboard?.resumenGeneral || {};
  const hayFiltrosActivos = Boolean(
    filtros.distrito || filtros.barrio || filtros.grupoEdad || filtros.mes
  );

  return (
    <PageLayout
      eyebrow="Demografia / Censo"
      title="Pulso demografico"
      description={`1.81 millones de registros con edad, sexo, nacionalidad y seccion censal. Piramides poblacionales y analisis por barrio para ${DATE_CONFIG.DATASET_YEAR}.`}
    >
      <EstadisticasCenso
        poblacionTotal={resumen.poblacionTotal || 0}
        porcentajeExtranjeros={resumen.porcentajeExtranjeros || resumen.diversidad || 0}
        ratioGenero={resumen.ratioGenero || 0}
        totalDistritos={resumen.totalDistritos || resumen.distritos || 0}
        isLoading={!dashboard}
      />

      <FiltrosCenso
        filtros={filtros}
        opcionesDistrito={opcionesDistrito}
        hayFiltrosActivos={hayFiltrosActivos}
        onCambioFiltro={manejarCambioFiltro}
        onLimpiar={limpiarFiltros}
        onRefrescar={refrescar}
      />

      {!isLoading && (
        <GraficosCenso
          datosGraficoDistritos={datosGraficoDistritos}
          datosGraficoEdad={datosGraficoEdad}
        />
      )}

      <PanelDetalleDistrito
        detalle={detalleDistritoData}
        onCerrar={cerrarDetalle}
      />

      <TablaCenso
        datos={datos}
        paginacion={paginacion}
        paginaActual={paginaActual}
        isLoading={isLoading}
        error={error}
        onCambioPagina={manejarCambioPagina}
        onClickFila={manejarClickDistrito}
        onReintentar={refrescar}
      />
    </PageLayout>
  );
}

export default PaginaCenso;
