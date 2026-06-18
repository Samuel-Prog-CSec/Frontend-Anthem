/**
 * Pagina de Contenedores de Residuos
 *
 * Visualizacion del modulo de contenedores: tipos de residuo, distribucion
 * geografica, estadisticas por distrito/barrio, busqueda textual y analisis
 * de densidad/cobertura.
 *
 * Esta pagina es solo orquestacion: estado, filtros, llamadas a React Query
 * y composicion de subcomponentes memoizados que viven en `./components/`.
 *
 * Filtros persisten en URL (useSearchParams) para shareable links y para
 * funcionar como destino del filtro global de distrito (BI cross-project).
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import { PageLayout } from '../../components/layout';
import { Button, EnlacesCruzados } from '../../components/common';
import { useSincronizarFiltroGeo } from '../../context';
import {
  useContenedores,
  useContenedoresEstadisticas,
  useContenedoresPorDistrito,
  useDistritosContenedores,
  useBarriosContenedores,
  useDensidadContenedores,
  useMapaContenedores
} from '../../api/hooks';
import { PAGINATION, DATE_CONFIG } from '../../constants';
import { formatNumber } from '../../utils';
import {
  TarjetasEstadisticasContenedores,
  FiltrosContenedores,
  MapaContenedores,
  GraficosContenedores,
  BusquedaContenedores,
  AnalisisDensidadContenedores,
  TablaContenedores
} from './components';

const FILTROS_INICIALES = { tipoContenedor: '', lote: '', distrito: '', barrio: '' };

/**
 * Lee filtros iniciales desde la URL para soportar deep-linking
 */
function leerFiltrosDesdeUrl(searchParams) {
  return {
    tipoContenedor: searchParams.get('tipoContenedor') || '',
    lote: searchParams.get('lote') || '',
    distrito: searchParams.get('distrito') || '',
    barrio: searchParams.get('barrio') || ''
  };
}

/**
 * Convierte el `distribucionTipos` de una fila de analisis de densidad
 * ({ [TIPO]: { cantidad, puntos } }) a la forma `porTipo`
 * ([{ tipo, total, ubicaciones }]) que consumen los KPIs y el pie de tipos.
 */
function porTipoDesdeDensidad(filaBarrio) {
  return Object.entries(filaBarrio?.distribucionTipos || {}).map(([tipo, v]) => ({
    tipo,
    total: v?.cantidad || 0,
    ubicaciones: v?.puntos || 0
  }));
}

function PaginaContenedores() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filtros, setFiltros] = useState(() => leerFiltrosDesdeUrl(searchParams));
  const [paginacion, setPaginacion] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: PAGINATION.CONTAINERS_DEFAULT_LIMIT
  });

  // BI cross-project: sincronizar filtro distrito local con global
  const aplicarDistritoLocal = useCallback((d) => {
    setFiltros(prev => ({ ...prev, distrito: d || '', barrio: '' }));
    setPaginacion(prev => ({ ...prev, currentPage: 1 }));
  }, []);
  useSincronizarFiltroGeo(filtros.distrito, aplicarDistritoLocal);

  // Sincronizar filtros -> URL (sin disparar nuevo set si nada cambia)
  useEffect(() => {
    const next = new URLSearchParams();
    if (filtros.tipoContenedor) {next.set('tipoContenedor', filtros.tipoContenedor);}
    if (filtros.lote) {next.set('lote', filtros.lote);}
    if (filtros.distrito) {next.set('distrito', filtros.distrito);}
    if (filtros.barrio) {next.set('barrio', filtros.barrio);}
    const nextStr = next.toString();
    const currentStr = searchParams.toString();
    if (nextStr !== currentStr) {
      setSearchParams(next, { replace: true });
    }
  }, [filtros, searchParams, setSearchParams]);

  // Parametros para la query principal (tabla)
  const queryParams = useMemo(() => {
    const params = {
      page: paginacion.currentPage,
      limit: paginacion.itemsPerPage
    };
    if (filtros.tipoContenedor) {params.tipoContenedor = filtros.tipoContenedor;}
    if (filtros.lote) {params.lote = filtros.lote;}
    if (filtros.distrito) {params.distrito = filtros.distrito;}
    if (filtros.barrio) {params.barrio = filtros.barrio;}
    return params;
  }, [paginacion.currentPage, paginacion.itemsPerPage, filtros]);

  // Filtros que usa el mapa (sin paginacion)
  const filtrosMapa = useMemo(() => {
    const params = {};
    if (filtros.tipoContenedor) {params.tipoContenedor = filtros.tipoContenedor;}
    if (filtros.lote) {params.lote = filtros.lote;}
    if (filtros.distrito) {params.distrito = filtros.distrito;}
    if (filtros.barrio) {params.barrio = filtros.barrio;}
    return params;
  }, [filtros]);

  // ----- Queries -----
  const {
    data: listadoResult,
    isLoading: cargandoListado,
    error: errorListado,
    refetch: refetchListado
  } = useContenedores(queryParams);

  const {
    data: statsResult,
    isLoading: cargandoStats
  } = useContenedoresEstadisticas(filtros.lote || undefined);

  // Estadisticas por distrito SIN acotar al distrito filtrado: el Bar "Top
  // distritos" es una comparativa entre distritos (no debe colapsar a 1 al
  // seleccionar uno) y los KPIs/Pie localizan el suyo con .find() sobre la lista
  // completa. La reactividad por tipo del Bar se resuelve en cliente desde
  // contenedoresPorTipo (que el endpoint ya entrega por distrito).
  const {
    data: distritosResult,
    isLoading: cargandoDistritos
  } = useContenedoresPorDistrito(undefined, filtros.lote || undefined);

  const {
    data: listaDistritos
  } = useDistritosContenedores();

  const {
    data: listaBarrios,
    isLoading: cargandoBarrios
  } = useBarriosContenedores(filtros.distrito);

  const {
    data: densidadResult,
    isLoading: cargandoDensidad
  } = useDensidadContenedores({
    distrito: filtros.distrito || undefined,
    tipoContenedor: filtros.tipoContenedor || undefined,
    lote: filtros.lote || undefined,
    includeBarrios: 'true'
  });

  const {
    data: featureCollectionMapa,
    isLoading: cargandoMapa
  } = useMapaContenedores(filtrosMapa);

  // ----- Datos derivados -----
  const datosListado = useMemo(() => listadoResult?.data || [], [listadoResult?.data]);
  const resumenGeneral = statsResult?.data || null;
  const datosDistritos = useMemo(
    () => distritosResult?.data?.estadisticas || [],
    [distritosResult?.data?.estadisticas]
  );
  const datosDensidad = useMemo(
    () => densidadResult?.data?.analisisDensidad || [],
    [densidadResult?.data?.analisisDensidad]
  );

  const totalDistritos = useMemo(() => {
    return listaDistritos?.data?.total || 0;
  }, [listaDistritos]);

  const opcionesDistrito = useMemo(() => {
    const distritos = listaDistritos?.data?.distritos || [];
    return distritos.map(d => ({ value: d, label: d }));
  }, [listaDistritos]);

  const opcionesBarrio = useMemo(() => {
    const barrios = listaBarrios?.data?.barrios || [];
    return barrios
      .filter(b => b && b !== 'NO_ESPECIFICADO')
      // El dato de contenedores solo trae el CODIGO de barrio (3 digitos:
      // distrito*10 + barrio local), no el nombre. Se etiqueta como "Barrio NNN"
      // para que el desplegable sea legible en vez de un numero suelto; el value
      // sigue siendo el codigo (el backend filtra por el).
      .map(b => ({ value: b, label: /^\d+$/.test(String(b)) ? `Barrio ${b}` : b }));
  }, [listaBarrios]);

  // KPIs de cabecera. Reaccionan a los filtros activos (barrio / distrito /
  // tipo de contenedor): con barrio se derivan del desglose por tipo de ese
  // barrio (analisisDensidad, ya cargado con includeBarrios); con distrito del
  // desglose del distrito; con tipo se filtra ese tipo. Sin filtros, totales
  // globales.
  const kpis = useMemo(() => {
    const hayFiltro = Boolean(filtros.distrito || filtros.tipoContenedor || filtros.barrio);

    if (!hayFiltro) {
      if (!resumenGeneral) {
        return { totalContenedores: 0, totalUbicaciones: 0, totalTipos: 0, totalDistritos: 0 };
      }
      return {
        totalContenedores: resumenGeneral.totalGeneral || 0,
        totalUbicaciones: resumenGeneral.totalUbicaciones || 0,
        totalTipos: Array.isArray(resumenGeneral.porTipo) ? resumenGeneral.porTipo.length : 0,
        totalDistritos
      };
    }

    // Desglose por tipo. Prioridad: barrio (si seleccionado y su fila de
    // densidad ya esta cargada) > distrito > global. Si el barrio aun no tiene
    // fila cargada se cae al desglose del distrito para no mostrar 0 transitorio.
    let porTipo;
    let distritosKpi = totalDistritos;
    const filaBarrio = filtros.barrio
      ? datosDensidad.find(f => f.barrio === filtros.barrio)
      : null;
    if (filaBarrio) {
      porTipo = porTipoDesdeDensidad(filaBarrio);
      distritosKpi = 1;
    } else if (filtros.distrito) {
      // Sin fallback a datosDistritos[0]: si el distrito filtrado no aparece
      // (p.ej. un lote sin datos en ese distrito) los KPIs muestran 0, no los
      // numeros equivocados del primer distrito de la lista.
      const entry = datosDistritos.find(d => (d.distrito || d._id) === filtros.distrito);
      porTipo = entry?.contenedoresPorTipo || [];
      distritosKpi = 1;
    } else {
      porTipo = resumenGeneral?.porTipo || [];
    }
    if (filtros.tipoContenedor) {
      porTipo = porTipo.filter(t => t.tipo === filtros.tipoContenedor);
    }
    return {
      totalContenedores: porTipo.reduce((s, t) => s + (t.total || 0), 0),
      totalUbicaciones: porTipo.reduce((s, t) => s + (t.ubicaciones || 0), 0),
      totalTipos: porTipo.length,
      totalDistritos: distritosKpi
    };
  }, [resumenGeneral, totalDistritos, filtros.distrito, filtros.tipoContenedor, filtros.barrio, datosDistritos, datosDensidad]);

  // Pie "por tipo": con barrio filtrado el desglose es el de ESE barrio; con
  // distrito, el del distrito; si no, el global. Reutiliza breakdowns ya
  // cargados (datosDensidad / datosDistritos) -- igual que los KPIs -- en vez de
  // resumenGeneral.porTipo (que solo reacciona a `lote`). No se filtra por
  // tipoContenedor a nivel distrito/global (colapsaria el grafico a 1 sector);
  // a nivel barrio la densidad ya viene acotada por tipo si hay tipo filtrado.
  const datosPorTipoPie = useMemo(() => {
    if (filtros.barrio) {
      const filaBarrio = datosDensidad.find(f => f.barrio === filtros.barrio);
      if (filaBarrio) {
        return porTipoDesdeDensidad(filaBarrio);
      }
      // densidad aun no cargada: caer al desglose del distrito mas abajo.
    }
    if (filtros.distrito) {
      const entry = datosDistritos.find(d => (d.distrito || d._id) === filtros.distrito);
      return entry?.contenedoresPorTipo || [];
    }
    return resumenGeneral?.porTipo || [];
  }, [filtros.barrio, filtros.distrito, datosDensidad, datosDistritos, resumenGeneral]);

  const paginacionActual = useMemo(() => ({
    ...paginacion,
    totalPages: listadoResult?.pagination?.totalPages || 1,
    totalItems: listadoResult?.pagination?.totalDocuments || 0
  }), [paginacion, listadoResult?.pagination]);

  // ----- Handlers -----
  const manejarCambioPagina = useCallback((page) => {
    setPaginacion(prev => ({ ...prev, currentPage: page }));
  }, []);

  const manejarCambioFiltro = useCallback((nombre, valor) => {
    setFiltros(prev => {
      const next = { ...prev, [nombre]: valor };
      // Si cambia el distrito, limpiar barrio (cascada)
      if (nombre === 'distrito' && valor !== prev.distrito) {
        next.barrio = '';
      }
      return next;
    });
    setPaginacion(prev => ({ ...prev, currentPage: 1 }));
  }, []);

  const limpiarFiltros = useCallback(() => {
    setFiltros(FILTROS_INICIALES);
    setPaginacion(prev => ({ ...prev, currentPage: 1 }));
  }, []);

  return (
    <PageLayout
      title="Contenedores"
      description={
        listadoResult?.pagination?.totalDocuments
          ? `${formatNumber(listadoResult.pagination.totalDocuments)} contenedores georreferenciados con tipo de residuo, lote y cobertura por distrito. Cobertura ${DATE_CONFIG.DATASET_YEAR}.`
          : `Contenedores georreferenciados con tipo de residuo, lote y cobertura por distrito. Cobertura ${DATE_CONFIG.DATASET_YEAR}.`
      }
      actions={
        <Button variant="outline" onClick={() => refetchListado()}>
          <RefreshCw className="size-4 mr-2" aria-hidden="true" />
          Recargar datos
        </Button>
      }
    >
      <MapaContenedores
        cargandoMapa={cargandoMapa}
        featureCollection={featureCollectionMapa}
        filtrosActivos={filtros}
      />

      {/* Filtros justo bajo el mapa-hero: el control queda pegado a lo que
          afecta (mapa + KPIs + tabla), sin bajar hasta el final. */}
      <FiltrosContenedores
        filtros={filtros}
        opcionesDistrito={opcionesDistrito}
        opcionesBarrio={opcionesBarrio}
        cargandoBarrios={cargandoBarrios}
        manejarCambioFiltro={manejarCambioFiltro}
        limpiarFiltros={limpiarFiltros}
      />

      <TarjetasEstadisticasContenedores
        totalContenedores={kpis.totalContenedores}
        totalUbicaciones={kpis.totalUbicaciones}
        totalTipos={kpis.totalTipos}
        totalDistritos={kpis.totalDistritos}
        isLoading={cargandoStats}
      />

      {filtros.distrito && (
        <div className="mb-6">
          <EnlacesCruzados
            distrito={filtros.distrito}
            barrio={filtros.barrio || undefined}
            modulosExcluidos={['contenedores']}
            titulo={`Ver "${filtros.distrito}${filtros.barrio ? ` / ${filtros.barrio}` : ''}" en otras áreas:`}
          />
        </div>
      )}

      <GraficosContenedores
        resumenPorTipo={datosPorTipoPie}
        estadisticasDistritos={datosDistritos}
        tipoFiltro={filtros.tipoContenedor}
        isLoading={cargandoStats || cargandoDistritos}
      />

      <BusquedaContenedores tipoContenedorActivo={filtros.tipoContenedor} />

      <AnalisisDensidadContenedores
        datos={datosDensidad}
        isLoading={cargandoDensidad}
        distritoFiltro={filtros.distrito}
        tipoFiltro={filtros.tipoContenedor}
      />

      <TablaContenedores
        isLoading={cargandoListado}
        error={errorListado}
        datos={datosListado}
        paginacionActual={paginacionActual}
        totalDocuments={listadoResult?.pagination?.totalDocuments}
        onCambioPagina={manejarCambioPagina}
        onRetry={refetchListado}
      />
    </PageLayout>
  );
}

export default PaginaContenedores;
