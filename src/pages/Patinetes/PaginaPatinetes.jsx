/**
 * Pagina de Asignacion de Patinetes
 *
 * Visualizacion de datos de asignacion de patinetes por distrito/barrio:
 * - Estadisticas por area (total patinetes, proveedores, densidad)
 * - Distribucion por distrito (grafico de barras)
 * - Cuota de mercado por proveedor (grafico de pastel)
 * - Tabla detallada con filtros
 *
 * Esta pagina es solo orquestacion: estado, filtros, llamadas a React Query
 * y composicion de subcomponentes memoizados que viven en `./components/`.
 */

import { useState, useCallback, useMemo } from 'react';
import { RefreshCw } from 'lucide-react';
import { PageLayout } from '../../components/layout';
import { Button, EnlacesCruzados } from '../../components/common';
import { useSincronizarFiltroGeo } from '../../context';
import {
  usePatinetes, usePatinetesEstadisticas, usePatinetesMercado,
  usePatinetesZonas, usePatinetesDetallesArea, useMapaPatinetes
} from '../../api/hooks';
import { PAGINATION, DATE_CONFIG } from '../../constants';
import {
  TarjetasEstadisticasPatinetes,
  MapaDistribucionPatinetes,
  FiltrosPatinetes,
  EstadisticasMercadoPatinetes,
  ZonasConcentracionPatinetes,
  TablaPatinetes,
  DetalleAreaPatinetes
} from './components';

const FILTROS_INICIALES = { distrito: '', densidad: '', tipoZona: '' };

function PaginaPatinetes() {
  const [filtros, setFiltros] = useState(FILTROS_INICIALES);
  const [paginacion, setPaginacion] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: PAGINATION.DEFAULT_LIMIT
  });
  const [areaQuery, setAreaQuery] = useState(null);

  // BI cross-project: sincronizar filtro de distrito local con el global
  const aplicarDistritoLocal = useCallback((d) => {
    setFiltros(prev => ({ ...prev, distrito: d || '' }));
    setPaginacion(prev => ({ ...prev, currentPage: 1 }));
  }, []);
  useSincronizarFiltroGeo(filtros.distrito, aplicarDistritoLocal);

  // Parametros de consulta para la query principal
  const queryParams = useMemo(() => {
    const params = {
      page: paginacion.currentPage,
      limit: paginacion.itemsPerPage
    };
    if (filtros.distrito) params.distrito = filtros.distrito;
    if (filtros.densidad) params.densidad = filtros.densidad;
    if (filtros.tipoZona) params.tipoZona = filtros.tipoZona;
    return params;
  }, [paginacion.currentPage, paginacion.itemsPerPage, filtros]);

  // React Query hooks (se ejecutan en paralelo automaticamente)
  const {
    data: assignmentsResult,
    isLoading,
    error: mainError,
    refetch
  } = usePatinetes(queryParams);

  const { data: statsResult } = usePatinetesEstadisticas();
  const { data: mercadoResult } = usePatinetesMercado();
  const { data: zonasResult } = usePatinetesZonas();
  const { data: featureCollectionMapa, isLoading: cargandoMapa } = useMapaPatinetes();
  const {
    data: areaResult,
    isLoading: cargandoArea
  } = usePatinetesDetallesArea(areaQuery?.distrito, areaQuery?.barrio);

  // Extraer datos de las respuestas (estabilizar referencias para useMemo).
  // Los endpoints pueden devolver `data` como array plano o envuelto en
  // distintas claves segun la version del controller. Helper local para
  // tolerar ambos shapes y no romper los .map() de abajo.
  const datos = useMemo(() => assignmentsResult?.data || [], [assignmentsResult?.data]);
  const estadisticasDistritos = useMemo(() => {
    const raw = statsResult?.data;
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw?.estadisticas)) return raw.estadisticas;
    if (Array.isArray(raw?.districtStatistics)) return raw.districtStatistics;
    if (Array.isArray(raw?.data)) return raw.data;
    return [];
  }, [statsResult?.data]);
  const datosMercado = useMemo(() => {
    const raw = mercadoResult?.data;
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw?.data)) return raw.data;
    return [];
  }, [mercadoResult?.data]);
  const zonasConcentracion = useMemo(() => {
    const raw = zonasResult?.data;
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw?.data)) return raw.data;
    return [];
  }, [zonasResult?.data]);
  const areaSeleccionada = areaQuery ? (areaResult?.data || null) : null;
  const error = mainError?.message || null;

  // Actualizar paginacion cuando cambian los datos
  const paginacionActual = useMemo(() => ({
    ...paginacion,
    totalPages: assignmentsResult?.pagination?.totalPages || 1,
    totalItems: assignmentsResult?.pagination?.totalDocuments || assignmentsResult?.pagination?.totalItems || 0
  }), [paginacion, assignmentsResult?.pagination]);

  // Handlers estables (se pasan como props memo)
  const manejarCambioPagina = useCallback((page) => {
    setPaginacion(prev => ({ ...prev, currentPage: page }));
  }, []);

  const manejarCambioFiltro = useCallback((name, value) => {
    setFiltros(prev => ({ ...prev, [name]: value }));
    setPaginacion(prev => ({ ...prev, currentPage: 1 }));
  }, []);

  const limpiarFiltros = useCallback(() => {
    setFiltros(FILTROS_INICIALES);
    setPaginacion(prev => ({ ...prev, currentPage: 1 }));
  }, []);

  const manejarClickArea = useCallback((distrito, barrio) => {
    if (!distrito || !barrio) return;

    setAreaQuery(prev => {
      if (prev?.distrito === distrito && prev?.barrio === barrio) {
        return null;
      }
      return { distrito, barrio };
    });
  }, []);

  const cerrarArea = useCallback(() => setAreaQuery(null), []);

  // Estadisticas derivadas (preferir agregado global de estadisticasDistritos
  // sobre la pagina actual de `datos`, que era solo el primer page de 50
  // registros). Antes el KPI mostraba 182 (suma de la primera pagina) en
  // vez del total real (~4821) y el promedio coincidia raro con el total.
  const estadisticas = useMemo(() => {
    const totalAreas = paginacionActual.totalItems || datos.length;

    // Total agregado: usar estadisticasDistritos si esta disponible
    // (suma todos los distritos), caer a datos como fallback.
    const totalPatinetes = estadisticasDistritos.length > 0
      ? estadisticasDistritos.reduce((sum, d) => sum + (d.totalPatinetes || 0), 0)
      : datos
          .filter(d => d.estadisticas?.totalPatinetes != null)
          .reduce((sum, d) => sum + d.estadisticas.totalPatinetes, 0);

    // Proveedores: media de proveedores activos por area (de la pagina
    // actual; aproximacion razonable).
    const proveedoresValues = datos
      .filter(d => d.estadisticas?.proveedoresActivos != null)
      .map(d => d.estadisticas.proveedoresActivos);
    const proveedoresActivos = proveedoresValues.length > 0
      ? proveedoresValues.reduce((a, b) => a + b, 0) / proveedoresValues.length
      : 0;

    // Promedio por area: total agregado / numero total de areas registradas
    const promedioPorBarrio = totalAreas > 0 ? totalPatinetes / totalAreas : 0;

    return {
      totalPatinetes,
      proveedoresActivos,
      promedioPorBarrio,
      totalAreas
    };
  }, [datos, paginacionActual.totalItems, estadisticasDistritos]);

  // Opciones de distrito derivadas de estadisticasDistritos
  const districtOptions = useMemo(() => {
    return estadisticasDistritos.map(d => ({
      value: d._id,
      label: d._id
    }));
  }, [estadisticasDistritos]);

  // Datos para grafico de barras (patinetes por distrito)
  const datosGrafico = useMemo(() => {
    return estadisticasDistritos.map(d => ({
      name: d._id,
      totalPatinetes: d.totalPatinetes || 0
    }));
  }, [estadisticasDistritos]);

  // Datos para grafico de pastel (cuota de mercado por proveedor, top 8)
  const pieChartData = useMemo(() => {
    return datosMercado
      .slice(0, 8)
      .map(d => ({
        name: d._id,
        value: d.totalPatinetes || 0
      }));
  }, [datosMercado]);

  return (
    <PageLayout
      eyebrow="Movilidad / Micromovilidad"
      title="Flota de micromovilidad"
      description={estadisticas.totalPatinetes > 0
        ? `${estadisticas.totalPatinetes.toLocaleString('es-ES')} patinetes desplegados en ${estadisticas.totalAreas} areas de la ciudad. Densidad, dominancia HHI y zonas de concentracion en ${DATE_CONFIG.DATASET_YEAR}.`
        : `Flota de micromovilidad agregada por distrito y barrio. Densidad, dominancia HHI y zonas de concentracion en ${DATE_CONFIG.DATASET_YEAR}.`}
      actions={
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCw className="size-4 mr-2" />
          Actualizar
        </Button>
      }
    >
      <TarjetasEstadisticasPatinetes estadisticas={estadisticas} />

      <MapaDistribucionPatinetes
        cargandoMapa={cargandoMapa}
        featureCollectionMapa={featureCollectionMapa}
      />

      <FiltrosPatinetes
        filtros={filtros}
        districtOptions={districtOptions}
        manejarCambioFiltro={manejarCambioFiltro}
        limpiarFiltros={limpiarFiltros}
      />

      {filtros.distrito && (
        <div className="mb-6">
          <EnlacesCruzados
            distrito={filtros.distrito}
            modulosExcluidos={['patinetes']}
            titulo={`Ver "${filtros.distrito}" en otros modulos:`}
          />
        </div>
      )}

      {!isLoading && (
        <EstadisticasMercadoPatinetes
          datosGrafico={datosGrafico}
          pieChartData={pieChartData}
        />
      )}

      {!isLoading && (
        <ZonasConcentracionPatinetes zonas={zonasConcentracion} />
      )}

      <TablaPatinetes
        isLoading={isLoading}
        error={error}
        datos={datos}
        paginacionActual={paginacionActual}
        totalDocuments={assignmentsResult?.pagination?.totalDocuments}
        onCambioPagina={manejarCambioPagina}
        onClickArea={manejarClickArea}
        onRetry={refetch}
      />

      <DetalleAreaPatinetes
        area={areaSeleccionada}
        cargando={cargandoArea}
        onCerrar={cerrarArea}
      />
    </PageLayout>
  );
}

export default PaginaPatinetes;
