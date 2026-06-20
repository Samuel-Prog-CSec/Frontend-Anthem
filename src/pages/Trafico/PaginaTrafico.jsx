/**
 * Pagina de Trafico
 *
 * Modulo de visualizacion de mediciones de trafico en tiempo real (15min)
 * sobre la coleccion masiva (~132M docs tras el ultimo reimport con la
 * coercion 29/02->28/02 y los writeErrors clasificados; mantener el orden
 * de magnitud en la `CardDescription` mientras no se anyada un endpoint
 * /trafico/count cacheado). Por su volumen, no carga datos
 * automaticamente: el usuario debe especificar un rango (max 7 dias) y
 * opcionalmente un tipo de via (URB | M30) y pulsar Aplicar.
 *
 * Una vez aplicados los filtros, se ejecutan en paralelo:
 *   - useEstadisticasTrafico: KPIs globales del rango (HEAVY: rate-limited).
 *   - useMapaTrafico: FeatureCollection con un punto por estacion + media en periodo.
 *   - useAnalisisCongestion: agregado por distrito.
 *
 * Filtros y rango persisten en URL via useSearchParams para shareable links.
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { TrafficCone } from 'lucide-react';
import { PageLayout } from '../../components/layout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, EmptyState } from '../../components/common';
import {
  useEstadisticasTrafico,
  useAnalisisCongestion,
  useMapaTrafico
} from '../../api/hooks';
import { DATE_CONFIG } from '../../constants';
import {
  BarraFiltrosTrafico,
  TarjetasResumenTrafico,
  MapaTrafico,
  GraficosTrafico
} from './components';
import { rangoFechasInicial, validarRangoMapa } from './helpers';

const FILTROS_INICIALES = {
  ...rangoFechasInicial(),
  tipoElemento: ''
};

function leerFiltrosDesdeUrl(searchParams) {
  return {
    startDate: searchParams.get('startDate') || '',
    endDate: searchParams.get('endDate') || '',
    tipoElemento: searchParams.get('tipoElemento') || ''
  };
}

function PaginaTrafico() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Estado de "borrador" -- lo que el usuario edita en la barra de filtros.
  // Se separa del estado "aplicado" para que las queries solo se disparen
  // cuando el usuario pulse Aplicar.
  const [borrador, setBorrador] = useState(() => {
    const fromUrl = leerFiltrosDesdeUrl(searchParams);
    return fromUrl.startDate && fromUrl.endDate ? fromUrl : FILTROS_INICIALES;
  });

  // Estado "aplicado". Si la URL trae un rango valido lo usamos; si no, se
  // auto-aplica el rango por defecto (FILTROS_INICIALES) para que la pagina no
  // abra vacia. El rango por defecto ya es valido y acotado (<=7 dias).
  const [aplicados, setAplicados] = useState(() => {
    const fromUrl = leerFiltrosDesdeUrl(searchParams);
    return validarRangoMapa(fromUrl.startDate, fromUrl.endDate).valido ? fromUrl : FILTROS_INICIALES;
  });

  const aplicarFiltros = useCallback((nuevos) => {
    setBorrador(nuevos);
    setAplicados(nuevos);
  }, []);

  // Sincronizar filtros aplicados con URL
  useEffect(() => {
    const next = new URLSearchParams();
    if (aplicados?.startDate) {next.set('startDate', aplicados.startDate);}
    if (aplicados?.endDate) {next.set('endDate', aplicados.endDate);}
    if (aplicados?.tipoElemento) {next.set('tipoElemento', aplicados.tipoElemento);}
    const nextStr = next.toString();
    if (nextStr !== searchParams.toString()) {
      setSearchParams(next, { replace: true });
    }
  }, [aplicados, searchParams, setSearchParams]);

  // Parametros de las queries (solo si hay filtros aplicados)
  const queryParams = useMemo(() => {
    if (!aplicados) {return null;}
    const params = {
      startDate: aplicados.startDate,
      endDate: aplicados.endDate
    };
    if (aplicados.tipoElemento) {params.tipoElemento = aplicados.tipoElemento;}
    return params;
  }, [aplicados]);

  // Queries
  // El usuario explicitamente pidio analisis -> habilitamos heavy query.
  const {
    data: statsResult,
    isLoading: cargandoStats,
    isError: errorStats,
    refetch: refrescarStats
  } = useEstadisticasTrafico(queryParams || {}, { enabled: Boolean(queryParams) });

  const {
    data: congestionResult,
    isLoading: cargandoCongestion
  } = useAnalisisCongestion(
    queryParams ? { ...queryParams, groupBy: 'distrito' } : {},
    { enabled: Boolean(queryParams) }
  );

  const {
    data: featureCollectionMapa,
    isLoading: cargandoMapa
  } = useMapaTrafico(queryParams || {});

  const resumen = statsResult?.data?.resumen || null;
  const distribucionHoraria = statsResult?.data?.porPeriodoDia || [];
  const analisisCongestion = congestionResult?.data?.analisis || [];

  // Tendencia diaria real de intensidad media (porDia, ordenada por fecha en el
  // backend), aplanada a numeros para la sparkline inline del KPI "Intensidad
  // media". Es una serie cronologica dia a dia, no la distribucion por franja
  // del dia (que ya tiene su propio grafico de barras debajo).
  const serieIntensidad = useMemo(() => {
    const dias = statsResult?.data?.porDia;
    if (!Array.isArray(dias)) {return [];}
    return dias
      .map((d) => Number(d?.intensidadPromedio))
      .filter((n) => Number.isFinite(n))
      .slice(0, 30);
  }, [statsResult]);

  return (
    <PageLayout
      title="Tráfico"
      description={`Intensidad, ocupación y nivel de congestión por punto de medición. Selecciona un rango de fechas para ver el análisis de ${DATE_CONFIG.DATASET_YEAR}.`}
    >
      <BarraFiltrosTrafico
        filtrosActivos={borrador}
        onAplicar={aplicarFiltros}
      />

      {!aplicados ? (
        <Card>
          <CardHeader>
            <CardTitle>Sin filtros aplicados</CardTitle>
            <CardDescription>
              Por el gran volumen de mediciones se necesita un rango de
              fechas para empezar el análisis.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EmptyState
              title="Aplica filtros para empezar"
              description="Selecciona un rango de fechas (máximo 7 días) y opcionalmente un tipo de vía en el panel superior, y pulsa Aplicar."
              icon={TrafficCone}
            />
          </CardContent>
        </Card>
      ) : (
        <>
          <TarjetasResumenTrafico
            resumen={resumen}
            serieIntensidad={serieIntensidad}
            isLoading={cargandoStats}
            error={errorStats}
            onReintentar={refrescarStats}
          />

          <MapaTrafico
            cargando={cargandoMapa}
            featureCollection={featureCollectionMapa}
            rangoFechas={aplicados}
          />

          <GraficosTrafico
            analisisCongestion={analisisCongestion}
            distribucionHoraria={distribucionHoraria}
            isLoading={cargandoStats || cargandoCongestion}
          />
        </>
      )}
    </PageLayout>
  );
}

export default PaginaTrafico;
