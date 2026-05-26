/**
 * Pagina de Contaminacion Acustica
 *
 * Visualizacion de datos de ruido ambiental:
 * - Mediciones por estacion
 * - Niveles por periodo (diurno, vespertino, nocturno)
 * - Cumplimiento normativo
 *
 * Esta pagina es solo orquestacion: estado, filtros, llamadas a React Query
 * y composicion de subcomponentes memoizados que viven en `./components/`.
 */

import { useState, useMemo, useCallback } from 'react';
import { RefreshCw } from 'lucide-react';
import { PageLayout } from '../../components/layout';
import { Button } from '../../components/common';
import {
  useRuido, useEstacionesRuido, useRuidoRanking,
  useRuidoCumplimiento, useRuidoTendencias
} from '../../api/hooks';
import { PAGINATION, DATE_CONFIG } from '../../constants';
import { excedeLimite } from './helpers';
import {
  TarjetasEstadisticasRuido,
  FiltrosRuido,
  GraficoNivelesRuido,
  GraficoTendenciasRuido,
  RankingEstacionesRuido,
  IndicadorCumplimiento,
  TablaRuido,
  LeyendaLimitesNormativos
} from './components';

const FILTROS_INICIALES = { mes: '', nmt: '' };
const MESES_CORTOS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

function PaginaRuido() {
  const [filtros, setFiltros] = useState(FILTROS_INICIALES);
  const [paginaActual, setPaginaActual] = useState(1);
  const elementosPorPagina = PAGINATION.DEFAULT_LIMIT;

  // Parametros de consulta derivados del estado
  const parametrosConsulta = useMemo(() => {
    const params = {
      page: paginaActual,
      limit: elementosPorPagina,
      año: DATE_CONFIG.DATASET_YEAR
    };

    if (filtros.mes) params.mes = parseInt(filtros.mes);
    if (filtros.nmt) params.nmt = parseInt(filtros.nmt);

    return params;
  }, [paginaActual, elementosPorPagina, filtros.mes, filtros.nmt]);

  const {
    data: noiseData,
    isLoading,
    error,
    refetch
  } = useRuido(parametrosConsulta);

  const { data: stationOptions = [] } = useEstacionesRuido();
  const { data: rankingApi, isLoading: cargandoRanking } = useRuidoRanking({ limit: 5 });
  const { data: cumplimientoApi, isLoading: cargandoCumplimiento } = useRuidoCumplimiento();

  // Tendencias temporales (todo el ano del dataset)
  const parametrosTendencia = useMemo(() => ({
    startDate: `${DATE_CONFIG.DATASET_YEAR}-01-01`,
    endDate: `${DATE_CONFIG.DATASET_YEAR}-12-31`,
    groupBy: 'month',
    metric: 'laeq24'
  }), []);
  const { data: tendenciasApi } = useRuidoTendencias(parametrosTendencia);

  // Memoizamos para mantener referencia estable y no invalidar useMemos
  // que dependen de `data` cuando noiseData es undefined entre renders
  const data = useMemo(() => noiseData?.data || [], [noiseData?.data]);
  const pagination = noiseData?.pagination || {};

  // Tendencias mensuales para el grafico.
  // El backend devuelve `data.data` array con campos `promedioNivel`,
  // `maximoNivel`, `minimoNivel` y `periodo: {año, mes}`. Antes el codigo
  // leia `d.promedio/maximo/minimo` (sin sufijo) y siempre obtenia 0,
  // dejando el grafico vacio aunque el endpoint respondiera 200.
  const datosTendencia = useMemo(() => {
    const trendData = tendenciasApi?.data?.data || tendenciasApi?.data || [];
    if (!Array.isArray(trendData) || trendData.length === 0) return [];
    return trendData.map(d => {
      const promedio = d.promedioNivel ?? d.promedio ?? 0;
      const maximo = d.maximoNivel ?? d.maximo ?? 0;
      const minimo = d.minimoNivel ?? d.minimo ?? 0;
      return {
        periodo: d.periodo?.mes ? MESES_CORTOS[d.periodo.mes - 1] : (d._id?.mes ? MESES_CORTOS[d._id.mes - 1] : '-'),
        promedio: Number(Number(promedio).toFixed(1)),
        maximo: Number(Number(maximo).toFixed(1)),
        minimo: Number(Number(minimo).toFixed(1))
      };
    });
  }, [tendenciasApi]);

  // Handlers estables
  const manejarCambioFiltro = useCallback((name, value) => {
    setFiltros(prev => ({ ...prev, [name]: value }));
    setPaginaActual(1);
  }, []);

  const limpiarFiltros = useCallback(() => {
    setFiltros(FILTROS_INICIALES);
    setPaginaActual(1);
  }, []);

  // Estadisticas derivadas de la pagina actual
  const estadisticas = useMemo(() => {
    if (data.length === 0) {
      return {
        promedioLaeq: 0,
        promedioDiurno: 0,
        promedioNocturno: 0,
        promedioVespertino: 0,
        cantidadExceden: 0,
        cantidadEstaciones: 0
      };
    }

    const laeqValues = data.filter(d => d.laeq24 != null).map(d => d.laeq24);
    const diurnoValues = data.filter(d => d.nivelDiurno != null).map(d => d.nivelDiurno);
    const nocturnoValues = data.filter(d => d.nivelNocturno != null).map(d => d.nivelNocturno);
    const vespertinoValues = data.filter(d => d.nivelVespertino != null).map(d => d.nivelVespertino);

    const cantidadExceden = data.filter(d =>
      excedeLimite(d.nivelDiurno, 'diurno') ||
      excedeLimite(d.nivelNocturno, 'nocturno') ||
      excedeLimite(d.nivelVespertino, 'vespertino')
    ).length;

    const uniqueStations = new Set(data.map(d => d.nmt));

    const avg = (arr) => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

    return {
      promedioLaeq: avg(laeqValues),
      promedioDiurno: avg(diurnoValues),
      promedioNocturno: avg(nocturnoValues),
      promedioVespertino: avg(vespertinoValues),
      cantidadExceden,
      cantidadEstaciones: uniqueStations.size
    };
  }, [data]);

  // Datos para grafico de niveles (ultimas 12 mediciones)
  const datosGrafico = useMemo(() => {
    return data.slice(0, 12).map(d => ({
      estacion: d.nombre?.slice(0, 15) || `NMT ${d.nmt}`,
      diurno: d.nivelDiurno || 0,
      nocturno: d.nivelNocturno || 0,
      vespertino: d.nivelVespertino || 0,
      laeq24: d.laeq24 || 0
    })).reverse();
  }, [data]);

  // Ranking de estaciones.
  // El backend devuelve `data.ranking` (array) + `data.configuracion` +
  // `data.interpretacion`. Antes se buscaba `data.data` que no existe y
  // el componente mostraba "Sin datos de ranking" aunque la API respondia
  // 200 con todas las estaciones ordenadas.
  const datosRanking = useMemo(() => {
    const rankData = rankingApi?.data?.ranking
      || rankingApi?.data?.data
      || (Array.isArray(rankingApi?.data) ? rankingApi.data : [])
      || [];
    if (!Array.isArray(rankData)) return [];
    return rankData.slice(0, 10).map(r => ({
      nombre: r.nombre || r._id?.nombre || `Estacion ${r.nmt || r._id?.nmt || '-'}`,
      nmt: r.nmt || r._id?.nmt || '-',
      laeq24: r.promedioLaeq24 || r.laeq24 || r.avgLaeq24 || 0,
      diurno: r.promedioDiurno || r.nivelDiurno || r.avgDiurno || 0,
      nocturno: r.promedioNocturno || r.nivelNocturno || r.avgNocturno || 0
    }));
  }, [rankingApi]);

  // Cumplimiento normativo.
  // El backend devuelve estructura anidada:
  //   data: {
  //     umbralNormativo, tipoZona, periodo,
  //     analisisPorZona: {
  //       estaciones: [{ nmt, nombre, totalMediciones, promedioGeneralLaeq24,
  //                      cumplimiento: { diurno: {cumple, incumple, porcentaje, promedio, maximo} } }],
  //       resumen: { totalEstaciones, cumplimientoPromedioGlobal, periodo, limites }
  //     }
  //   }
  // Antes el codigo leia `data.data` (no existe) y normalizaba a un shape
  // plano `{cumple, excedencias, promedioDiurno}` que no coincidia con
  // ninguno de los campos reales.
  const datosCumplimiento = useMemo(() => {
    const analisis = cumplimientoApi?.data?.analisisPorZona;
    if (!analisis) {
      return { resumen: null, estaciones: [] };
    }
    const estacionesRaw = Array.isArray(analisis.estaciones) ? analisis.estaciones : [];
    return {
      resumen: analisis.resumen || null,
      estaciones: estacionesRaw.slice(0, 10).map(c => {
        const diurno = c.cumplimiento?.diurno || {};
        const totalMed = c.totalMediciones || (diurno.cumple || 0) + (diurno.incumple || 0);
        const porcentaje = diurno.porcentaje ?? 0;
        return {
          nombre: c.nombre || `Estacion ${c.nmt || '-'}`,
          nmt: c.nmt || '-',
          cumple: porcentaje >= 100,
          porcentajeCumplimiento: porcentaje,
          promedioDiurno: diurno.promedio || 0,
          promedioGeneral: c.promedioGeneralLaeq24 || 0,
          excedencias: diurno.incumple || 0,
          totalMediciones: totalMed
        };
      })
    };
  }, [cumplimientoApi]);

  return (
    <PageLayout
      eyebrow="Ambiente / Ruido ambiental"
      title="El sonido de la ciudad"
      description={`Treinta estaciones acusticas reportan niveles diurno, vespertino y nocturno frente al limite normativo europeo. Cobertura ${DATE_CONFIG.DATASET_YEAR}.`}
      actions={
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCw className="size-4 mr-2" />
          Actualizar
        </Button>
      }
    >
      <TarjetasEstadisticasRuido estadisticas={estadisticas} />

      <FiltrosRuido
        filtros={filtros}
        stationOptions={stationOptions}
        manejarCambioFiltro={manejarCambioFiltro}
        limpiarFiltros={limpiarFiltros}
      />

      {!isLoading && data.length > 0 && (
        <GraficoNivelesRuido datosGrafico={datosGrafico} />
      )}

      <GraficoTendenciasRuido datosTendencia={datosTendencia} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <RankingEstacionesRuido datos={datosRanking} cargando={cargandoRanking} />
        <IndicadorCumplimiento datos={datosCumplimiento} cargando={cargandoCumplimiento} />
      </div>

      <TablaRuido
        isLoading={isLoading}
        error={error}
        data={data}
        pagination={pagination}
        paginaActual={paginaActual}
        elementosPorPagina={elementosPorPagina}
        onPageChange={setPaginaActual}
        onRetry={refetch}
      />

      <LeyendaLimitesNormativos />
    </PageLayout>
  );
}

export default PaginaRuido;
