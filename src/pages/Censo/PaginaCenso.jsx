/**
 * Pagina de Censo Demografico
 *
 * Refactorizada en sub-componentes (Estadisticas, Filtros, Graficos,
 * PanelDetalleDistrito, Tabla) siguiendo el patron de
 * CalidadAire/AforoPeatones/Multas.
 */

import { useState, useCallback, useMemo } from 'react';
import { PageLayout } from '../../components/layout';
import { useCenso, useCensoDashboard, useCensoDistritos, useCensoPiramide } from '../../api/hooks';
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
      const fechaFin = new Date(DATE_CONFIG.DATASET_YEAR, parseInt(filtros.mes, 10), 0, 23, 59, 59, 999);
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
    ...(filtros.distrito ? { distrito: parseInt(filtros.distrito) } : {}),
    // barrio y grupoEdad tambien acotan los KPIs (no solo la tabla), para que el
    // filtro tenga efecto sobre las cifras de cabecera. La piramide NO recibe
    // grupoEdad a proposito: colapsaria a un solo grupo (es el desglose por edad).
    ...(filtros.barrio ? { barrio: filtros.barrio } : {}),
    ...(filtros.grupoEdad ? { grupoEdad: filtros.grupoEdad } : {})
  }), [filtros.mes, filtros.distrito, filtros.barrio, filtros.grupoEdad]);

  // El resumen de distritos alimenta el grafico comparativo Y las opciones
  // del selector de distrito, asi que se mantiene SIN filtrar por distrito
  // (si no, el comparativo mostraria un solo distrito y el selector se
  // quedaria con una unica opcion).
  const distritosParams = useMemo(() => ({
    año: DATE_CONFIG.DATASET_YEAR,
    // Pedimos el desglose por barrios para alimentar el panel de detalle del
    // distrito (antes la tabla de barrios nunca se renderizaba porque ni se
    // solicitaba `incluirBarrios` ni se mapeaban los barrios al normalizar).
    incluirBarrios: 'true',
    ...(filtros.mes ? { mes: parseInt(filtros.mes) } : {})
  }), [filtros.mes]);

  // La piramide poblacional (hombres/mujeres por grupo de edad) respeta el
  // filtro de distrito. El endpoint agrega por año y distrito.
  const piramideParams = useMemo(() => ({
    año: DATE_CONFIG.DATASET_YEAR,
    // La piramide es una foto poblacional de UN mes; respeta el filtro de mes
    // (el servicio ya lo soporta) para ser coherente con los KPIs y la tabla.
    ...(filtros.mes ? { mes: parseInt(filtros.mes, 10) } : {}),
    ...(filtros.distrito ? { distrito: parseInt(filtros.distrito, 10) } : {})
  }), [filtros.mes, filtros.distrito]);

  const { data: censoResult, isLoading, error, refetch } = useCenso(queryParams);
  const { data: dashboardResult } = useCensoDashboard(dashboardParams);
  const { data: distritosResult } = useCensoDistritos(distritosParams);
  const { data: piramideResult } = useCensoPiramide(piramideParams);

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
    // Agrupar el desglose de barrios por codigo de distrito para adjuntarlo al
    // detalle. El backend emite `estadisticasBarrios` con shape anidado
    // ({ distrito:{codigo,nombre}, barrio:{codigo,nombre}, poblacionTotal,
    // porcentajeExtranjeros }); lo aplanamos a lo que espera PanelDetalleDistrito.
    const barriosPorDistrito = {};
    const listaBarrios = distritosStats?.estadisticasBarrios || [];
    for (const b of listaBarrios) {
      const cod = b.distrito?.codigo ?? b.codigoDistrito;
      if (cod == null) { continue; }
      if (!barriosPorDistrito[cod]) { barriosPorDistrito[cod] = []; }
      barriosPorDistrito[cod].push({
        codigo: b.barrio?.codigo,
        nombre: b.barrio?.nombre,
        poblacionTotal: b.poblacionTotal ?? 0,
        porcentajeExtranjeros: b.porcentajeExtranjeros ?? 0
      });
    }
    return lista.map(d => {
      const codigoDistrito = d.distrito?.codigo ?? d.codigoDistrito;
      return {
        codigoDistrito,
        distrito: d.distrito?.nombre ?? (typeof d.distrito === 'string' ? d.distrito : d.nombre),
        poblacionTotal: d.poblacion?.total ?? d.poblacionTotal ?? 0,
        totalEspañoles: d.poblacion?.españoles ?? d.totalEspañoles ?? 0,
        totalExtranjeros: d.poblacion?.extranjeros ?? d.totalExtranjeros ?? 0,
        porcentajeExtranjeros: d.porcentajes?.extranjeros ?? d.porcentajeExtranjeros ?? 0,
        porcentajeProductiva: d.porcentajes?.poblacionProductiva ?? d.porcentajeProductiva ?? 0,
        porcentajeTerceraEdad: d.porcentajes?.terceraEdad ?? d.porcentajeTerceraEdad ?? 0,
        barrios: barriosPorDistrito[codigoDistrito] || []
      };
    });
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

  // Piramide poblacional real: hombres a la izquierda (negativo), mujeres a la
  // derecha. Se ordena de mayor a menor edad para que los mas jovenes queden
  // en la base. Sustituye al antiguo donut por grupo de edad.
  const datosPiramide = useMemo(() => {
    const lista = piramideResult?.data?.piramideSimplificada || [];
    if (lista.length === 0) { return []; }
    return [...lista]
      .sort((a, b) => (b.rangoEdad?.minima ?? 0) - (a.rangoEdad?.minima ?? 0))
      .map((g) => ({
        grupo: ETIQUETAS_GRUPOS_EDAD[g.grupoEdad] || g.grupoEdad || 'Sin clasificar',
        hombres: -(g.poblacion?.hombres || 0),
        mujeres: g.poblacion?.mujeres || 0
      }));
  }, [piramideResult]);

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
      title="Censo"
      description={
        paginacion?.totalDocuments
          ? `${formatNumber(paginacion.totalDocuments)} registros con edad, sexo, nacionalidad y sección censal. Pirámides poblacionales y análisis por barrio para ${DATE_CONFIG.DATASET_YEAR}.`
          : `Registros con edad, sexo, nacionalidad y sección censal. Pirámides poblacionales y análisis por barrio para ${DATE_CONFIG.DATASET_YEAR}.`
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

      <GraficosCenso
        datosGraficoDistritos={datosGraficoDistritos}
        datosPiramide={datosPiramide}
      />

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
