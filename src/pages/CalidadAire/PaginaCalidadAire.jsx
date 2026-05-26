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
import { PAGINATION, DATE_CONFIG, CHART_LIMITS } from '../../constants';
import { formatDate } from '../../utils';

import EstadisticasCalidadAire from './EstadisticasCalidadAire';
import FiltrosCalidadAire from './FiltrosCalidadAire';
import GraficosCalidadAire from './GraficosCalidadAire';
import TablaCalidadAire from './TablaCalidadAire';
import LeyendaCalidadAire from './LeyendaCalidadAire';
import { calcularPromedioDiario } from './helpers';

function PaginaCalidadAire() {
  const [filtros, setFiltros] = useState({
    magnitud: '',
    mes: ''
  });
  const [paginaActual, setPaginaActual] = useState(1);
  const [magnitudTendencia, setMagnitudTendencia] = useState('');
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
      params.startDate = new Date(year, month - 1, 1).toISOString();
      params.endDate = new Date(year, month, 0).toISOString();
    }

    return params;
  }, [paginaActual, elementosPorPagina, filtros.magnitud, filtros.mes]);

  const {
    data: airData,
    isLoading,
    error,
    refetch
  } = useCalidadAire(parametrosConsulta);

  const { data: statsApi, isLoading: cargandoStats } = useCalidadAireStats();

  const parametrosTendencia = useMemo(() => {
    if (!magnitudTendencia) return null;
    return { magnitud: parseInt(magnitudTendencia) };
  }, [magnitudTendencia]);

  const { data: tendenciasApi, isLoading: cargandoTendencias } = useCalidadAireTendencias(
    parametrosTendencia,
    { enabled: !!parametrosTendencia }
  );

  const data = useMemo(() => airData?.data || [], [airData?.data]);
  const paginacion = airData?.pagination || {};

  const manejarCambioFiltro = useCallback((nombre, valor) => {
    setFiltros(prev => ({ ...prev, [nombre]: valor }));
    setPaginaActual(1);
  }, []);

  const limpiarFiltros = useCallback(() => {
    setFiltros({ magnitud: '', mes: '' });
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

  const datosGraficoPagina = useMemo(() => {
    return data.slice(0, CHART_LIMITS.MAX_ITEMS).map(d => ({
      fecha: formatDate(d.fecha, 'short'),
      promedio: calcularPromedioDiario(d.medicionesHorarias)?.toFixed(1) || 0
    })).reverse();
  }, [data]);

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

    return trendData.slice(0, 30).map(d => {
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

  return (
    <PageLayout
      eyebrow="Ambiente / Calidad del aire"
      title="El aire que respira la ciudad"
      description={`Concentraciones diarias de NO2, PM10, ozono y otros once contaminantes registrados por la malla atmosferica durante ${DATE_CONFIG.DATASET_YEAR}.`}
      actions={
        <Button variant="outline" onClick={refrescar}>
          <RefreshCw className="size-4 mr-2" aria-hidden="true" />
          Actualizar
        </Button>
      }
    >
      <EstadisticasCalidadAire
        estadisticasApi={estadisticasApi}
        estadisticasLocales={estadisticasLocales}
        totalDocumentos={paginacion.totalDocuments}
        cargandoStats={cargandoStats}
      />

      <FiltrosCalidadAire
        filtros={filtros}
        onCambioFiltro={manejarCambioFiltro}
        onLimpiar={limpiarFiltros}
      />

      <GraficosCalidadAire
        datosGraficoPagina={datosGraficoPagina}
        magnitudFiltro={filtros.magnitud}
        magnitudTendencia={magnitudTendencia}
        setMagnitudTendencia={setMagnitudTendencia}
        datosTendencia={datosTendencia}
        cargandoTendencias={cargandoTendencias}
        isLoading={isLoading}
        hayDatosPagina={data.length > 0}
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
