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
  } = useContenedoresEstadisticas();

  const {
    data: distritosResult,
    isLoading: cargandoDistritos
  } = useContenedoresPorDistrito(filtros.distrito || undefined);

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
      .map(b => ({ value: b, label: b }));
  }, [listaBarrios]);

  // KPIs de cabecera
  const kpis = useMemo(() => {
    if (!resumenGeneral) {
      return {
        totalContenedores: 0,
        totalUbicaciones: 0,
        totalTipos: 0,
        totalDistritos: 0
      };
    }
    return {
      totalContenedores: resumenGeneral.totalGeneral || 0,
      totalUbicaciones: resumenGeneral.totalUbicaciones || 0,
      totalTipos: Array.isArray(resumenGeneral.porTipo) ? resumenGeneral.porTipo.length : 0,
      totalDistritos
    };
  }, [resumenGeneral, totalDistritos]);

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
      eyebrow="Servicios urbanos / Residuos"
      title="Capilaridad de residuos"
      description={
        listadoResult?.pagination?.totalDocuments
          ? `${formatNumber(listadoResult.pagination.totalDocuments)} contenedores georreferenciados con tipo de residuo, lote y cobertura por distrito. Cobertura ${DATE_CONFIG.DATASET_YEAR}.`
          : `Contenedores georreferenciados con tipo de residuo, lote y cobertura por distrito. Cobertura ${DATE_CONFIG.DATASET_YEAR}.`
      }
      actions={
        <Button variant="outline" onClick={() => refetchListado()}>
          <RefreshCw className="size-4 mr-2" aria-hidden="true" />
          Actualizar
        </Button>
      }
    >
      <TarjetasEstadisticasContenedores
        totalContenedores={kpis.totalContenedores}
        totalUbicaciones={kpis.totalUbicaciones}
        totalTipos={kpis.totalTipos}
        totalDistritos={kpis.totalDistritos}
        isLoading={cargandoStats}
      />

      <MapaContenedores
        cargandoMapa={cargandoMapa}
        featureCollection={featureCollectionMapa}
        filtrosActivos={filtros}
      />

      <FiltrosContenedores
        filtros={filtros}
        opcionesDistrito={opcionesDistrito}
        opcionesBarrio={opcionesBarrio}
        cargandoBarrios={cargandoBarrios}
        manejarCambioFiltro={manejarCambioFiltro}
        limpiarFiltros={limpiarFiltros}
      />

      {filtros.distrito && (
        <div className="mb-6">
          <EnlacesCruzados
            distrito={filtros.distrito}
            barrio={filtros.barrio || undefined}
            modulosExcluidos={['contenedores']}
            titulo={`Ver "${filtros.distrito}${filtros.barrio ? ` / ${filtros.barrio}` : ''}" en otros modulos:`}
          />
        </div>
      )}

      <GraficosContenedores
        resumenPorTipo={resumenGeneral?.porTipo}
        estadisticasDistritos={datosDistritos}
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
