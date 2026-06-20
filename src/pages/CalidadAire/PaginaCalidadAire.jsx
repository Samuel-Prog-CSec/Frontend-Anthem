/**
 * Pagina de Calidad del Aire
 *
 * Visualizacion de mediciones de calidad del aire por estacion y por
 * contaminante. Refactorizada en sub-componentes siguiendo el patron de
 * `AforoPeatones`: la pagina solo orquesta hooks de datos y los pasa por
 * props a los bloques visuales (Estadisticas, Filtros, Graficos, Tabla,
 * Leyenda).
 */

import { useState, useMemo, useCallback } from 'react';
import { RefreshCw } from 'lucide-react';
import { PageLayout } from '../../components/layout';
import { Button } from '../../components/common';
import { useCalidadAire, useCalidadAireStats, useCalidadAireTendencias } from '../../api/hooks';
import { PAGINATION, DATE_CONFIG } from '../../constants';

import EstadisticasCalidadAire from './EstadisticasCalidadAire';
import FiltrosCalidadAire from './FiltrosCalidadAire';
import GraficosCalidadAire from './GraficosCalidadAire';
import TablaCalidadAire from './TablaCalidadAire';
import LeyendaCalidadAire from './LeyendaCalidadAire';
import { calcularPromedioDiario } from './helpers';

function PaginaCalidadAire() {
  // Por defecto NO2 (magnitud 8): los KPIs (promedio/max/min) y la tabla abren
  // sobre un unico contaminante con su unidad. Sin contaminante fijado, el
  // "Promedio general" mezclaria magnitudes de escalas distintas (NO2 ug/m3,
  // CO mg/m3) en un numero sin sentido fisico.
  const [filtros, setFiltros] = useState({
    magnitud: '8',
    mes: ''
  });
  const [paginaActual, setPaginaActual] = useState(1);
  // Por defecto NO2 (magnitud 8): la tendencia abre con datos en vez de vacia.
  const [magnitudTendencia, setMagnitudTendencia] = useState('8');
  const elementosPorPagina = PAGINATION.DEFAULT_LIMIT;

  const parametrosConsulta = useMemo(() => {
    const params = {
      page: paginaActual,
      limit: elementosPorPagina
    };

    if (filtros.magnitud) {
      params.magnitud = parseInt(filtros.magnitud);
    }

    if (filtros.mes) {
      const year = DATE_CONFIG.DATASET_YEAR;
      const month = parseInt(filtros.mes);
      params.startDate = new Date(Date.UTC(year, month - 1, 1)).toISOString();
      params.endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999)).toISOString();
    }

    return params;
  }, [paginaActual, elementosPorPagina, filtros.magnitud, filtros.mes]);

  const {
    data: airData,
    isLoading,
    error,
    refetch
  } = useCalidadAire(parametrosConsulta);

  // Las tarjetas de estadisticas deben reflejar los filtros activos (magnitud /
  // mes). Antes se pedia /calidad-aire/estadisticas SIN parametros, por lo que
  // los KPI (promedio/max/min) mostraban siempre el dato global aunque hubiera
  // un contaminante filtrado. El endpoint soporta `magnitud` y rango de fechas.
  const parametrosEstadisticas = useMemo(() => {
    const params = {};
    if (filtros.magnitud) {
      params.magnitud = parseInt(filtros.magnitud);
    }
    if (filtros.mes) {
      const year = DATE_CONFIG.DATASET_YEAR;
      const month = parseInt(filtros.mes);
      params.startDate = new Date(Date.UTC(year, month - 1, 1)).toISOString();
      params.endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999)).toISOString();
    }
    return params;
  }, [filtros.magnitud, filtros.mes]);

  const { data: statsApi, isLoading: cargandoStats } = useCalidadAireStats(parametrosEstadisticas);

  const parametrosTendencia = useMemo(() => {
    if (!magnitudTendencia) return null;
    const params = { magnitud: parseInt(magnitudTendencia) };
    // La tendencia diaria reacciona al filtro de mes: con un mes activo muestra
    // la evolucion dia a dia de ESE mes en vez de un tramo fijo del año.
    if (filtros.mes) {
      const year = DATE_CONFIG.DATASET_YEAR;
      const month = parseInt(filtros.mes);
      params.startDate = new Date(Date.UTC(year, month - 1, 1)).toISOString();
      params.endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999)).toISOString();
    }
    return params;
  }, [magnitudTendencia, filtros.mes]);

  const { data: tendenciasApi, isLoading: cargandoTendencias } = useCalidadAireTendencias(
    parametrosTendencia,
    { enabled: !!parametrosTendencia }
  );

  const data = useMemo(() => airData?.data || [], [airData?.data]);
  const paginacion = airData?.pagination || {};

  const manejarCambioFiltro = useCallback((nombre, valor) => {
    setFiltros(prev => ({ ...prev, [nombre]: valor }));
    setPaginaActual(1);
    // Sincroniza la tendencia con el filtro de contaminante: elegir un
    // contaminante en Filtros actualiza tambien el grafico de tendencia, en vez
    // de tener dos selectores de contaminante desconectados.
    if (nombre === 'magnitud' && valor) { setMagnitudTendencia(valor); }
  }, []);

  const limpiarFiltros = useCallback(() => {
    // Volver al contaminante por defecto (NO2), no a "todos": evita el promedio
    // multi-unidad y mantiene tabla, KPIs y tendencia sincronizados.
    setFiltros({ magnitud: '8', mes: '' });
    setMagnitudTendencia('8');
    setPaginaActual(1);
  }, []);

  const refrescar = useCallback(() => {
    refetch();
  }, [refetch]);

  // Estadisticas calculadas sobre la pagina actual (fallback si no hay
  // estadisticas globales de la API).
  const estadisticasLocales = useMemo(() => {
    if (data.length === 0) return { avg: 0, max: 0, min: 0, valid: 0 };

    const averages = data
      .map(d => calcularPromedioDiario(d.medicionesHorarias))
      .filter(v => v != null);

    if (averages.length === 0) return { avg: 0, max: 0, min: 0, valid: 0 };

    return {
      avg: averages.reduce((sum, v) => sum + v, 0) / averages.length,
      max: Math.max(...averages),
      min: Math.min(...averages),
      valid: averages.length
    };
  }, [data]);

  // La API /calidad-aire/estadisticas devuelve un array de aggregates por
  // fecha+magnitud (no un objeto global). Agregamos aqui para tener un
  // resumen unico: sumamos totalRegistros, calculamos promedio ponderado y
  // tomamos max/min globales. Si la respuesta esta vacia, dejamos null para
  // que la UI use el fallback de paginacion.
  const estadisticasApi = useMemo(() => {
    const apiData = statsApi?.data?.estadisticas
      || statsApi?.data?.data
      || statsApi?.data
      || null;
    if (!Array.isArray(apiData) || apiData.length === 0) return null;

    let totalRegistros = 0;
    let sumaPromedios = 0;
    let pesos = 0;
    let maximo = -Infinity;
    let minimo = Infinity;

    for (const entry of apiData) {
      const n = entry.totalRegistros || 0;
      totalRegistros += n;
      if (entry.promedioGeneral != null) {
        sumaPromedios += entry.promedioGeneral * n;
        pesos += n;
      }
      if (entry.valorMaximo != null && entry.valorMaximo > maximo) {
        maximo = entry.valorMaximo;
      }
      if (entry.valorMinimo != null && entry.valorMinimo < minimo) {
        minimo = entry.valorMinimo;
      }
    }

    return {
      totalRegistros,
      promedio: pesos > 0 ? sumaPromedios / pesos : 0,
      maximo: maximo === -Infinity ? 0 : maximo,
      minimo: minimo === Infinity ? 0 : minimo,
      medicionesValidas: totalRegistros,
      diasConExcedencias: 0
    };
  }, [statsApi]);

  const datosTendencia = useMemo(() => {
    // Shape real backend: `data.tendenciaDiaria` (array) con items
    // `{_id: {fecha}, valorPromedio, valorMaximo, valorMinimo}`. Mantengo
    // fallbacks legacy por si cambia el endpoint en el futuro.
    const trendData = tendenciasApi?.data?.tendenciaDiaria
      || tendenciasApi?.data?.data
      || (Array.isArray(tendenciasApi?.data) ? tendenciasApi.data : [])
      || [];
    if (!Array.isArray(trendData) || trendData.length === 0) return [];

    const formatearFecha = (f) => {
      if (!f) return '-';
      try {
        const d = new Date(f);
        if (Number.isNaN(d.getTime())) return String(f);
        return d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
      } catch {
        return String(f);
      }
    };

    // Sin recorte: se pinta toda la serie diaria que devuelve el backend (ya
    // acotada a DAYS_PER_YEAR). Antes un slice(0, 30) mostraba solo ~enero
    // cuando no habia filtro de mes, ocultando el ~92% del año.
    return trendData.map(d => {
      const promedio = d.valorPromedio ?? d.promedio ?? d.avgValue ?? 0;
      const maximo = d.valorMaximo ?? d.maximo ?? d.maxValue ?? 0;
      const minimo = d.valorMinimo ?? d.minimo ?? d.minValue ?? 0;
      const fechaRaw = d._id?.fecha || d.fecha || d.periodo || d.month;
      return {
        periodo: formatearFecha(fechaRaw),
        promedio: Number(Number(promedio).toFixed(2)),
        maximo: Number(Number(maximo).toFixed(2)),
        minimo: Number(Number(minimo).toFixed(2))
      };
    });
  }, [tendenciasApi]);

  // Serie plana de promedios para la sparkline del StatCard "Promedio general".
  // Usa la tendencia diaria REAL del contaminante (endpoint agregado), no el
  // slice de la pagina paginada.
  const serieTendenciaPromedio = useMemo(
    () => datosTendencia.map(d => d.promedio).filter(Number.isFinite),
    [datosTendencia]
  );

  return (
    <PageLayout
      title="Calidad del aire"
      description={`Concentraciones diarias de NO2, PM10, ozono y otros once contaminantes registrados por las estaciones de medición durante ${DATE_CONFIG.DATASET_YEAR}.`}
      actions={
        <Button variant="outline" onClick={refrescar}>
          <RefreshCw className="size-4 mr-2" aria-hidden="true" />
          Recargar datos
        </Button>
      }
    >
      <EstadisticasCalidadAire
        estadisticasApi={estadisticasApi}
        estadisticasLocales={estadisticasLocales}
        totalDocumentos={paginacion.totalDocuments}
        cargandoStats={cargandoStats}
        serieTendenciaPromedio={serieTendenciaPromedio}
        magnitudFiltro={filtros.magnitud}
      />

      <FiltrosCalidadAire
        filtros={filtros}
        onCambioFiltro={manejarCambioFiltro}
        onLimpiar={limpiarFiltros}
      />

      <GraficosCalidadAire
        magnitudTendencia={magnitudTendencia}
        setMagnitudTendencia={setMagnitudTendencia}
        datosTendencia={datosTendencia}
        cargandoTendencias={cargandoTendencias}
      />

      <TablaCalidadAire
        data={data}
        paginacion={paginacion}
        paginaActual={paginaActual}
        elementosPorPagina={elementosPorPagina}
        magnitudFiltro={filtros.magnitud}
        isLoading={isLoading}
        error={error}
        onCambioPagina={setPaginaActual}
        onReintentar={refrescar}
      />

      <LeyendaCalidadAire />
    </PageLayout>
  );
}

export default PaginaCalidadAire;
