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
import { RefreshCw, Radio } from 'lucide-react';
import { PageLayout } from '../../components/layout';
import {
  Button, Card, CardHeader, CardTitle, CardDescription, CardContent, Skeleton
} from '../../components/common';
import { MapaClusterizado } from '../../components/mapas';
import {
  useRuido, useEstacionesRuido, useRuidoRanking,
  useRuidoCumplimiento, useRuidoTendencias, useMapaRuido, useRuidoStats
} from '../../api/hooks';
import { PAGINATION, DATE_CONFIG } from '../../constants';
import { formatNumber } from '../../utils';
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

  // Ranking y cumplimiento deben respetar los filtros activos (mes/estacion),
  // igual que la tabla; sin esto mostraban siempre el agregado anual completo
  // y contradecian al resto de la pagina al filtrar.
  const parametrosAgregados = useMemo(() => {
    const params = { año: DATE_CONFIG.DATASET_YEAR };
    if (filtros.mes) { params.mes = parseInt(filtros.mes); }
    if (filtros.nmt) { params.nmt = parseInt(filtros.nmt); }
    return params;
  }, [filtros.mes, filtros.nmt]);

  const { data: rankingApi, isLoading: cargandoRanking } = useRuidoRanking({ limit: 5, ...parametrosAgregados });
  const { data: cumplimientoApi, isLoading: cargandoCumplimiento } = useRuidoCumplimiento(parametrosAgregados);
  // Estadisticas GLOBALES (todo el dataset filtrado, no solo la pagina actual).
  // Alimentan las tarjetas KPI con promedios/conteos sobre el total.
  const { data: estadisticasApi } = useRuidoStats(parametrosAgregados);

  // Mapa de estaciones acusticas. Reutiliza los filtros activos (mes/estacion)
  // para que los puntos cambien al filtrar, en linea con el resto de la pagina.
  const { data: featureCollectionMapa, isLoading: cargandoMapa } = useMapaRuido(parametrosAgregados);

  // Tendencias temporales del año. Reacciona al filtro de estacion (nmt) para
  // mostrar la serie de ESA estacion. NO se aplica el filtro `mes`: la grafica
  // es una tendencia mensual sobre el año y filtrarla por un mes la colapsaria
  // a un unico punto.
  const parametrosTendencia = useMemo(() => {
    const params = {
      startDate: `${DATE_CONFIG.DATASET_YEAR}-01-01`,
      endDate: `${DATE_CONFIG.DATASET_YEAR}-12-31`,
      groupBy: 'month',
      metric: 'laeq24'
    };
    if (filtros.nmt) { params.nmt = parseInt(filtros.nmt); }
    return params;
  }, [filtros.nmt]);
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

  // Serie plana de promedios LAeq24 mensuales (orden cronologico) para la
  // sparkline inline de la tarjeta "Promedio LAeq24". Reutiliza la misma
  // tendencia ya consultada para el grafico, sin nuevas peticiones.
  const serieLaeqMensual = useMemo(
    () => datosTendencia.map(d => d.promedio).filter(n => Number.isFinite(n)),
    [datosTendencia]
  );

  // Handlers estables
  const manejarCambioFiltro = useCallback((name, value) => {
    setFiltros(prev => ({ ...prev, [name]: value }));
    setPaginaActual(1);
  }, []);

  const limpiarFiltros = useCallback(() => {
    setFiltros(FILTROS_INICIALES);
    setPaginaActual(1);
  }, []);

  // Estadisticas derivadas de la pagina actual (fallback si el endpoint de
  // estadisticas globales no respondiera).
  const estadisticasPagina = useMemo(() => {
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

  // KPIs definitivos: preferir el resumen GLOBAL del backend (todo el dataset
  // filtrado) y caer a la estimacion sobre la pagina actual si no esta listo.
  const estadisticas = useMemo(() => {
    const resumen = estadisticasApi?.data?.resumen || estadisticasApi?.resumen || null;
    if (!resumen) {
      return estadisticasPagina;
    }
    return {
      promedioLaeq: resumen.promedioGeneralLaeq24 ?? estadisticasPagina.promedioLaeq,
      promedioDiurno: resumen.promedioDiurno ?? estadisticasPagina.promedioDiurno,
      promedioNocturno: resumen.promedioNocturno ?? estadisticasPagina.promedioNocturno,
      promedioVespertino: resumen.promedioVespertino ?? estadisticasPagina.promedioVespertino,
      cantidadExceden: resumen.estacionesConExcedencia ?? estadisticasPagina.cantidadExceden,
      cantidadEstaciones: resumen.totalEstaciones ?? estadisticasPagina.cantidadEstaciones
    };
  }, [estadisticasApi, estadisticasPagina]);

  // Datos para el grafico "Niveles por estacion". Se derivan del agregado por
  // estacion del mapa (/ruido/mapa: promedios reales por NMT en el periodo
  // filtrado) en vez de las primeras 12 filas de la pagina paginada, que eran
  // un subconjunto arbitrario de station-mes y no un nivel por estacion.
  const datosGrafico = useMemo(() => {
    const features = featureCollectionMapa?.features || [];
    if (!Array.isArray(features) || features.length === 0) { return []; }
    return features.map(f => {
      const p = f.properties || {};
      return {
        estacion: (p.nombre && p.nombre.slice(0, 15)) || `NMT ${p.nmt}`,
        diurno: p.promedioDiurno || 0,
        nocturno: p.promedioNocturno || 0,
        vespertino: p.promedioVespertino || 0,
        laeq24: p.promedioLaeq24 || 0
      };
    });
  }, [featureCollectionMapa]);

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
      title="Ruido ambiental"
      description={`Treinta estaciones acústicas reportan niveles diurno, vespertino y nocturno frente al límite normativo europeo. Cobertura ${DATE_CONFIG.DATASET_YEAR}.`}
      actions={
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCw className="size-4 mr-2" />
          Recargar datos
        </Button>
      }
    >
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Radio className="size-5" aria-hidden="true" />
            Estaciones acústicas en el mapa
          </CardTitle>
          <CardDescription>
            Puntos clusterizados con niveles diurno y nocturno y cumplimiento normativo por estación.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {cargandoMapa ? (
            <Skeleton className="h-[480px] w-full rounded-xl" />
          ) : (
            <MapaClusterizado
              featureCollection={featureCollectionMapa}
              altura="480px"
              renderPopup={(props) => {
                // /ruido/mapa emite promedioDiurno/Nocturno/Laeq24 + excede*
                // (no nivelDiurno/cumple). Cumple = no excede ningun periodo.
                const tieneExcedencia = props.excedeDiurno != null || props.excedeVespertino != null || props.excedeNocturno != null;
                const cumple = !props.excedeDiurno && !props.excedeVespertino && !props.excedeNocturno;
                return (
                  <div className="text-sm">
                    <div className="font-semibold mb-1">{props.nombre || `Estación NMT ${props.nmt || ''}`}</div>
                    {props.nmt && <div>NMT: {props.nmt}</div>}
                    {props.promedioDiurno != null && (
                      <div>Diurno: {formatNumber(props.promedioDiurno, 1)} dB</div>
                    )}
                    {props.promedioNocturno != null && (
                      <div>Nocturno: {formatNumber(props.promedioNocturno, 1)} dB</div>
                    )}
                    {props.promedioLaeq24 != null && (
                      <div>LAeq24: {formatNumber(props.promedioLaeq24, 1)} dB</div>
                    )}
                    {tieneExcedencia && (
                      <div>Cumplimiento: {cumple ? 'Sí' : 'No'}</div>
                    )}
                  </div>
                );
              }}
            />
          )}
        </CardContent>
      </Card>

      <TarjetasEstadisticasRuido estadisticas={estadisticas} serieLaeqMensual={serieLaeqMensual} />

      <FiltrosRuido
        filtros={filtros}
        stationOptions={stationOptions}
        manejarCambioFiltro={manejarCambioFiltro}
        limpiarFiltros={limpiarFiltros}
      />

      {datosGrafico.length > 0 && (
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
