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
import { formatNumber, formatearNombreDistrito } from '../../utils';

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

  // El dashboard (tarjetas de resumen + piramide de edad) SI se filtra por
  // distrito para que las metricas reflejen el distrito seleccionado y el
  // filtro tenga efecto completo, no solo sobre la tabla.
  const dashboardParams = useMemo(() => ({
    año: DATE_CONFIG.DATASET_YEAR,
    ...(filtros.mes ? { mes: parseInt(filtros.mes) } : {}),
    ...(filtros.distrito ? { distrito: parseInt(filtros.distrito) } : {})
  }), [filtros.mes, filtros.distrito]);

  // El resumen de distritos alimenta el grafico comparativo Y las opciones
  // del selector de distrito, asi que se mantiene SIN filtrar por distrito
  // (si no, el comparativo mostraria un solo distrito y el selector se
  // quedaria con una unica opcion).
  const distritosParams = useMemo(() => ({
    año: DATE_CONFIG.DATASET_YEAR,
    ...(filtros.mes ? { mes: parseInt(filtros.mes) } : {})
  }), [filtros.mes]);

  const { data: censoResult, isLoading, error, refetch } = useCenso(queryParams);
  const { data: dashboardResult } = useCensoDashboard(dashboardParams);
  const { data: distritosResult } = useCensoDistritos(distritosParams);

  const datos = useMemo(() => censoResult?.data || [], [censoResult?.data]);
  const paginacion = censoResult?.pagination || null;
  const dashboard = dashboardResult?.data || null;
  const distritosStats = distritosResult?.data || null;

  // El endpoint /censo/distritos/estadisticas devuelve `estadisticasDistritos`
  // con shape anidado ({ distrito: {codigo, nombre}, poblacion: {total, ...},
  // porcentajes: {...} }). Lo normalizamos UNA vez a la forma plana que esperan
  // el grafico comparativo, el selector de distrito y el panel de detalle.
  // Antes la pagina leia `districtStatistics` (clave que el backend nunca emite)
  // y con shape plano, por lo que el selector quedaba sin opciones, el grafico
  // comparativo vacio y el panel de detalle nunca encontraba el distrito.
  const distritosNormalizados = useMemo(() => {
    const lista = distritosStats?.estadisticasDistritos
      || distritosStats?.districtStatistics
      || [];
    return lista.map(d => ({
      codigoDistrito: d.distrito?.codigo ?? d.codigoDistrito,
      distrito: d.distrito?.nombre ?? (typeof d.distrito === 'string' ? d.distrito : d.nombre),
      poblacionTotal: d.poblacion?.total ?? d.poblacionTotal ?? 0,
      totalEspañoles: d.poblacion?.españoles ?? d.totalEspañoles ?? 0,
      totalExtranjeros: d.poblacion?.extranjeros ?? d.totalExtranjeros ?? 0,
      porcentajeExtranjeros: d.porcentajes?.extranjeros ?? d.porcentajeExtranjeros ?? 0,
      porcentajeProductiva: d.porcentajes?.poblacionProductiva ?? d.porcentajeProductiva ?? 0,
      porcentajeTerceraEdad: d.porcentajes?.terceraEdad ?? d.porcentajeTerceraEdad ?? 0
    }));
  }, [distritosStats]);

  const datosGraficoDistritos = useMemo(() => {
    return [...distritosNormalizados]
      .sort((a, b) => b.poblacionTotal - a.poblacionTotal)
      .slice(0, 10)
      .map(d => ({
        nombre: formatearNombreDistrito(d.distrito),
        espanoles: d.totalEspañoles || (d.poblacionTotal - d.totalExtranjeros),
        extranjeros: d.totalExtranjeros || 0
      }));
  }, [distritosNormalizados]);

  const datosGraficoEdad = useMemo(() => {
    if (!dashboard?.distribucionEdad) return [];
    // Backend devuelve items `{_id: 'ADULTO_JOVEN', poblacionTotal: 7436645}`.
    // Antes el componente leia `g.totalPoblacion` (con sufijo invertido) y
    // siempre obtenia 0 → grafico vacio en negro.
    return dashboard.distribucionEdad.map(g => {
      const key = g.grupoEdad || g._id;
      const total = g.poblacionTotal ?? g.totalPoblacion ?? g.total ?? g.count ?? 0;
      return {
        name: ETIQUETAS_GRUPOS_EDAD[key] || key || 'Sin clasificar',
        value: total
      };
    });
  }, [dashboard]);

  const opcionesDistrito = useMemo(() =>
    distritosNormalizados.map(d => ({
      value: String(d.codigoDistrito),
      label: formatearNombreDistrito(d.distrito)
    })),
  [distritosNormalizados]);

  const detalleDistritoData = useMemo(() => {
    if (!distritoDetalle) return null;
    return distritosNormalizados.find(d => d.codigoDistrito === distritoDetalle) || null;
  }, [distritoDetalle, distritosNormalizados]);

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
      description={
        paginacion?.totalDocuments
          ? `${formatNumber(paginacion.totalDocuments)} registros con edad, sexo, nacionalidad y seccion censal. Piramides poblacionales y analisis por barrio para ${DATE_CONFIG.DATASET_YEAR}.`
          : `Registros con edad, sexo, nacionalidad y seccion censal. Piramides poblacionales y analisis por barrio para ${DATE_CONFIG.DATASET_YEAR}.`
      }
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
