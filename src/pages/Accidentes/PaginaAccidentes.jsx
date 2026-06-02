/**
 * Pagina de Accidentalidad
 *
 * Visualizacion de datos de accidentes de trafico:
 * - Personas afectadas por accidentes
 * - Distribucion por tipo de accidente y gravedad
 * - Comparativa por distritos
 * - Analisis de presencia de alcohol
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
  useAccidentes, useAccidentesComparativa,
  useAccidentesEstadisticas, useAccidenteExpediente,
  useMapaAccidentes
} from '../../api/hooks';
import { PAGINATION, DATE_CONFIG } from '../../constants';
import { formatNumber, formatearNombreDistrito } from '../../utils';
import { etiquetaTipoAccidente } from './helpers';
import {
  TarjetasEstadisticasAccidentes,
  MapaCalorAccidentes,
  FiltrosAccidentes,
  GraficosAccidentes,
  TablaZonasAccidentalidad,
  TablaAccidentes,
  DetalleExpediente
} from './components';

const FILTROS_INICIALES = { distrito: '', tipoAccidente: '', gravedad: '', mes: '' };
// El validator del backend (MAP_LIMITS.DEFAULT_MAX) cappea /accidentes/mapa
// a 1000 registros por seguridad (cada feature carga geometria + props).
// Si esto cambia en el backend, sincronizar aqui.
const LIMITE_MAPA = 1000;

function PaginaAccidentes() {
  const [filtros, setFiltros] = useState(FILTROS_INICIALES);
  const [paginacion, setPaginacion] = useState({
    paginaActual: 1,
    totalPaginas: 1,
    totalElementos: 0,
    elementosPorPagina: PAGINATION.DEFAULT_LIMIT
  });
  const [expedienteQuery, setExpedienteQuery] = useState(null);

  // BI cross-project: sincronizar el filtro de distrito local con el global
  const aplicarDistritoLocal = useCallback((d) => {
    setFiltros(prev => ({ ...prev, distrito: d || '' }));
  }, []);
  useSincronizarFiltroGeo(filtros.distrito, aplicarDistritoLocal);

  // Parametros de consulta para la query principal
  const queryParams = useMemo(() => {
    const params = {
      page: paginacion.paginaActual,
      limit: paginacion.elementosPorPagina
    };
    if (filtros.distrito) params.distrito = filtros.distrito;
    if (filtros.tipoAccidente) params.tipoAccidente = filtros.tipoAccidente;
    if (filtros.gravedad) params.gravedad = filtros.gravedad;
    if (filtros.mes) {
      const year = DATE_CONFIG.DATASET_YEAR;
      const month = parseInt(filtros.mes);
      params.startDate = new Date(year, month - 1, 1).toISOString();
      params.endDate = new Date(year, month, 0, 23, 59, 59).toISOString();
    }
    return params;
  }, [paginacion.paginaActual, paginacion.elementosPorPagina, filtros]);

  // React Query hooks (se ejecutan en paralelo automaticamente)
  const {
    data: accidentesResult,
    isLoading,
    error: mainError,
    refetch
  } = useAccidentes(queryParams);

  const { data: distritosResult } = useAccidentesComparativa();
  // Sin startDate/endDate el backend toma "ultimos 30 dias" desde HOY (2026)
  // y devuelve cero, porque todo el dataset Smart City vive en 2051.
  // Pasamos rango anual completo del dataset para obtener estadisticas reales.
  const { data: statsResult } = useAccidentesEstadisticas({
    startDate: `${DATE_CONFIG.DATASET_YEAR}-01-01`,
    endDate: `${DATE_CONFIG.DATASET_YEAR}-12-31`
  });
  // FeatureCollection GeoJSON para heatmap Leaflet.
  // Se pasan los filtros activos de distrito/gravedad/tipoAccidente.
  const parametrosMapa = useMemo(() => {
    const params = { limite: LIMITE_MAPA };
    if (filtros.distrito) params.distrito = filtros.distrito;
    if (filtros.gravedad) params.gravedad = filtros.gravedad;
    if (filtros.tipoAccidente) params.tipoAccidente = filtros.tipoAccidente;
    return params;
  }, [filtros.distrito, filtros.gravedad, filtros.tipoAccidente]);

  const { data: featureCollectionMapa, isLoading: cargandoMapa } = useMapaAccidentes(parametrosMapa);
  const {
    data: expedienteResult,
    isLoading: cargandoExpediente
  } = useAccidenteExpediente(expedienteQuery);

  // Extraer datos de las respuestas (estabilizar referencias para useMemo)
  const datos = useMemo(() => accidentesResult?.data || [], [accidentesResult?.data]);
  // Acepta array plano o envuelto (data.estadisticas / data.data) para
  // tolerar cambios de shape del endpoint /accidentes/distritos.
  const datosDistritos = useMemo(() => {
    const raw = distritosResult?.data;
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw?.estadisticas)) return raw.estadisticas;
    if (Array.isArray(raw?.data)) return raw.data;
    return [];
  }, [distritosResult?.data]);
  // El backend devuelve totalAccidentes/accidentesGraves/accidentesMortales
  // anidados dentro de data.resumen. Aplanamos para que TarjetasEstadisticas
  // los lea desde top-level junto con distribucionTipos/factoresRiesgo/etc.
  const estadisticasGenerales = useMemo(() => {
    const raw = statsResult?.data;
    if (!raw) return null;
    return { ...raw, ...(raw.resumen || {}) };
  }, [statsResult?.data]);
  const error = mainError?.message || null;

  // Top calles con mas accidentes (puntos negros). Vienen ya agregadas por
  // expediente (accidentes reales, no afectados) y ordenadas desde el backend
  // dentro de las estadisticas generales.
  const zonasAccidentalidad = useMemo(() => {
    const raw = estadisticasGenerales?.puntosNegros;
    return Array.isArray(raw) ? raw : [];
  }, [estadisticasGenerales]);

  const expedienteSeleccionado = expedienteQuery ? (expedienteResult?.data || null) : null;

  // Actualizar paginacion cuando cambian los datos
  const paginacionActual = useMemo(() => ({
    ...paginacion,
    totalPaginas: accidentesResult?.pagination?.totalPages || 1,
    totalElementos: accidentesResult?.pagination?.totalDocuments || accidentesResult?.pagination?.totalItems || 0
  }), [paginacion, accidentesResult?.pagination]);

  // Handlers estables (se pasan como props memo)
  const manejarCambioPagina = useCallback((page) => {
    setPaginacion(prev => ({ ...prev, paginaActual: page }));
  }, []);

  const manejarCambioFiltro = useCallback((name, value) => {
    setFiltros(prev => ({ ...prev, [name]: value }));
    setPaginacion(prev => ({ ...prev, paginaActual: 1 }));
  }, []);

  const limpiarFiltros = useCallback(() => {
    setFiltros(FILTROS_INICIALES);
    setPaginacion(prev => ({ ...prev, paginaActual: 1 }));
  }, []);

  const manejarClickExpediente = useCallback((numeroExpediente) => {
    if (!numeroExpediente) return;
    setExpedienteQuery(prev => prev === numeroExpediente ? null : numeroExpediente);
  }, []);

  const cerrarExpediente = useCallback(() => setExpedienteQuery(null), []);

  // Estadisticas derivadas de la pagina actual (fallback cuando no hay globales)
  const estadisticas = useMemo(() => {
    if (datos.length === 0) {
      return {
        totalAccidentes: paginacionActual.totalElementos,
        totalPersonasAfectadas: paginacionActual.totalElementos,
        accidentesGraves: 0,
        accidentesMortales: 0,
        conAlcohol: 0
      };
    }

    const accidentesGraves = datos.filter(d => {
      const gravedad = d.circunstancias?.gravedad?.toUpperCase();
      return gravedad === 'GRAVE' || gravedad === 'MORTAL';
    }).length;

    const accidentesMortales = datos.filter(d =>
      d.circunstancias?.gravedad?.toUpperCase() === 'MORTAL'
    ).length;

    const conAlcohol = datos.filter(d =>
      d.personaAfectada?.positivaAlcohol === 'S'
    ).length;

    return {
      totalAccidentes: paginacionActual.totalElementos,
      totalPersonasAfectadas: paginacionActual.totalElementos,
      accidentesGraves,
      accidentesMortales,
      conAlcohol
    };
  }, [datos, paginacionActual.totalElementos]);

  // Datos para grafico de barras (top 10 distritos)
  const datosGrafico = useMemo(() => {
    return [...datosDistritos]
      .sort((a, b) => (b.totalAccidentes || 0) - (a.totalAccidentes || 0))
      .slice(0, 10)
      .map(d => ({
        distrito: formatearNombreDistrito(d._id),
        totalAccidentes: d.totalAccidentes || 0
      }));
  }, [datosDistritos]);

  // Datos para grafico de pastel (distribucion por tipo).
  // Prefiere estadisticas globales si estan disponibles, no solo la pagina actual.
  const datosGraficoPastel = useMemo(() => {
    const distribucionTipos = estadisticasGenerales?.distribucionTipos
      || estadisticasGenerales?.porTipo
      || null;

    if (distribucionTipos && Array.isArray(distribucionTipos)) {
      return distribucionTipos
        .map(item => ({ name: etiquetaTipoAccidente(item._id || item.tipo), value: item.total || item.count || 0 }))
        .sort((a, b) => b.value - a.value);
    }

    // Fallback: calcular desde datos de la pagina actual
    if (datos.length === 0) return [];
    const conteosPorTipo = {};
    datos.forEach(d => {
      const tipo = d.circunstancias?.tipoAccidente || 'Desconocido';
      conteosPorTipo[tipo] = (conteosPorTipo[tipo] || 0) + 1;
    });
    return Object.entries(conteosPorTipo)
      .map(([name, value]) => ({ name: etiquetaTipoAccidente(name), value }))
      .sort((a, b) => b.value - a.value);
  }, [estadisticasGenerales, datos]);

  // Opciones de distrito derivadas de datosDistritos. El value se mantiene
  // como viene del backend (lo usa el filtro para casar); solo la etiqueta
  // se normaliza para no mostrar el nombre en mayusculas crudas.
  const opcionesDistrito = useMemo(() =>
    datosDistritos.map(d => ({ value: d._id, label: formatearNombreDistrito(d._id) })),
  [datosDistritos]);

  return (
    <PageLayout
      eyebrow="Seguridad vial / Accidentes"
      title="Cicatrices de la malla vial"
      description={
        accidentesResult?.pagination?.totalDocuments
          ? `Expedientes georreferenciados con gravedad, tipo de vehiculo y persona afectada. ${formatNumber(accidentesResult.pagination.totalDocuments)} personas registradas en ${DATE_CONFIG.DATASET_YEAR}.`
          : `Expedientes georreferenciados con gravedad, tipo de vehiculo y persona afectada. Cobertura ${DATE_CONFIG.DATASET_YEAR}.`
      }
      actions={
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCw className="size-4 mr-2" />
          Actualizar
        </Button>
      }
    >
      <TarjetasEstadisticasAccidentes
        estadisticas={estadisticas}
        estadisticasGenerales={estadisticasGenerales}
      />

      <MapaCalorAccidentes
        cargandoMapa={cargandoMapa}
        featureCollectionMapa={featureCollectionMapa}
        limite={parametrosMapa.limite}
      />

      <FiltrosAccidentes
        filtros={filtros}
        opcionesDistrito={opcionesDistrito}
        manejarCambioFiltro={manejarCambioFiltro}
        limpiarFiltros={limpiarFiltros}
      />

      {filtros.distrito && (
        <div className="mb-6">
          <EnlacesCruzados
            distrito={filtros.distrito}
            modulosExcluidos={['accidentes']}
            titulo={`Ver "${filtros.distrito}" en otros modulos:`}
          />
        </div>
      )}

      {!isLoading && datos.length > 0 && (
        <GraficosAccidentes
          datosGrafico={datosGrafico}
          datosGraficoPastel={datosGraficoPastel}
        />
      )}

      <TablaZonasAccidentalidad zonas={zonasAccidentalidad} />

      <TablaAccidentes
        isLoading={isLoading}
        error={error}
        datos={datos}
        paginacionActual={paginacionActual}
        totalDocuments={accidentesResult?.pagination?.totalDocuments}
        onCambioPagina={manejarCambioPagina}
        onClickExpediente={manejarClickExpediente}
        onRetry={refetch}
      />

      <DetalleExpediente
        expediente={expedienteSeleccionado}
        cargando={cargandoExpediente}
        onCerrar={cerrarExpediente}
      />
    </PageLayout>
  );
}

export default PaginaAccidentes;
