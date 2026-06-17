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
import { formatearNombreDistrito } from '../../utils';
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

  // Filtros (sin paginacion) para los endpoints agregados: KPIs, barras por
  // distrito, donut de proveedores, zonas y mapa. Sin esto mostraban siempre la
  // ciudad entera aunque se filtrara por distrito/densidad/tipoZona.
  const filtrosAgregados = useMemo(() => {
    const params = {};
    if (filtros.distrito) params.distrito = filtros.distrito;
    if (filtros.densidad) params.densidad = filtros.densidad;
    if (filtros.tipoZona) params.tipoZona = filtros.tipoZona;
    return params;
  }, [filtros]);

  // React Query hooks (se ejecutan en paralelo automaticamente)
  const {
    data: assignmentsResult,
    isLoading,
    error: mainError,
    refetch
  } = usePatinetes(queryParams);

  const { data: statsResult } = usePatinetesEstadisticas(filtrosAgregados);
  const { data: mercadoResult } = usePatinetesMercado(filtrosAgregados);
  const { data: zonasResult } = usePatinetesZonas(filtrosAgregados);
  const { data: featureCollectionMapa, isLoading: cargandoMapa } = useMapaPatinetes(filtrosAgregados);

  // Catalogo de distritos para el desplegable: agregado SIN filtrar, para que el
  // selector no se reduzca a una sola opcion al elegir un distrito (efecto
  // trinquete). React Query cachea esta consulta (ademas viene precalentada).
  const { data: statsCatalogoResult } = usePatinetesEstadisticas();
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
    // El endpoint /analisis-mercado/proveedores envuelve el array en `analisis`.
    if (Array.isArray(raw?.analisis)) return raw.analisis;
    if (Array.isArray(raw?.data)) return raw.data;
    return [];
  }, [mercadoResult?.data]);
  const zonasConcentracion = useMemo(() => {
    const raw = zonasResult?.data;
    if (Array.isArray(raw)) return raw;
    // El endpoint /zonas-concentracion envuelve el array en `zonas`.
    if (Array.isArray(raw?.zonas)) return raw.zonas;
    if (Array.isArray(raw?.data)) return raw.data;
    return [];
  }, [zonasResult?.data]);
  // El endpoint /area/:distrito/:barrio envuelve el detalle en `data.area`.
  const areaSeleccionada = areaQuery ? (areaResult?.data?.area || null) : null;
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

    // Proveedores activos promedio por area, sobre TODO el conjunto (no la
    // pagina): suma de proveedores activos / suma de areas a partir de las
    // estadisticas por distrito. Asi el KPI no cambia al paginar. Cae a la
    // media de la pagina solo si no hay stats por distrito.
    let proveedoresActivos = 0;
    if (estadisticasDistritos.length > 0) {
      const sumaProveedores = estadisticasDistritos.reduce((s, d) => s + (d.sumaProveedoresActivos || 0), 0);
      const sumaAreas = estadisticasDistritos.reduce((s, d) => s + (d.totalBarrios || 0), 0);
      proveedoresActivos = sumaAreas > 0 ? sumaProveedores / sumaAreas : 0;
    } else {
      const proveedoresValues = datos
        .filter(d => d.estadisticas?.proveedoresActivos != null)
        .map(d => d.estadisticas.proveedoresActivos);
      proveedoresActivos = proveedoresValues.length > 0
        ? proveedoresValues.reduce((a, b) => a + b, 0) / proveedoresValues.length
        : 0;
    }

    // Promedio por area: total agregado / numero total de areas registradas
    const promedioPorBarrio = totalAreas > 0 ? totalPatinetes / totalAreas : 0;

    return {
      totalPatinetes,
      proveedoresActivos,
      promedioPorBarrio,
      totalAreas
    };
  }, [datos, paginacionActual.totalItems, estadisticasDistritos]);

  // Opciones de distrito derivadas de estadisticasDistritos. El value se
  // mantiene como viene del backend (lo usa el filtro para casar); solo la
  // etiqueta se normaliza para no mostrar el nombre en mayusculas crudas.
  const districtOptions = useMemo(() => {
    const raw = statsCatalogoResult?.data;
    const catalogo = Array.isArray(raw) ? raw
      : Array.isArray(raw?.estadisticas) ? raw.estadisticas
        : Array.isArray(raw?.data) ? raw.data : [];
    return catalogo.map(d => ({
      value: d._id,
      label: formatearNombreDistrito(d._id)
    }));
  }, [statsCatalogoResult?.data]);

  // Datos para grafico de barras (patinetes por distrito)
  const datosGrafico = useMemo(() => {
    return estadisticasDistritos.map(d => ({
      name: formatearNombreDistrito(d._id),
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
      title="Patinetes"
      description={estadisticas.totalPatinetes > 0
        ? `${estadisticas.totalPatinetes.toLocaleString('es-ES')} patinetes desplegados en ${estadisticas.totalAreas} áreas de la ciudad. Densidad, concentración por proveedor y zonas de mayor concentración en ${DATE_CONFIG.DATASET_YEAR}.`
        : `Patinetes agregados por distrito y barrio. Densidad, concentración por proveedor y zonas de mayor concentración en ${DATE_CONFIG.DATASET_YEAR}.`}
      actions={
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCw className="size-4 mr-2" />
          Recargar datos
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
            titulo={`Ver "${filtros.distrito}" en otros módulos:`}
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
