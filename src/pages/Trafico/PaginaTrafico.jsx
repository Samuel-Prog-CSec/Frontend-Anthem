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

  // Estado "aplicado". Solo cambia cuando el usuario aplica filtros en la barra.
  // Si arrancamos con filtros validos en la URL, los activamos al montar.
  const [aplicados, setAplicados] = useState(() => {
    const fromUrl = leerFiltrosDesdeUrl(searchParams);
    return validarRangoMapa(fromUrl.startDate, fromUrl.endDate).valido ? fromUrl : null;
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
    isLoading: cargandoStats
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

  return (
    <PageLayout
      eyebrow="Movilidad / Trafico"
      title="Latido de la malla vial"
      description={`Intensidad, ocupacion y nivel de congestion por punto de medicion. Selecciona un rango de fechas para activar el analisis sobre ${DATE_CONFIG.DATASET_YEAR}.`}
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
              Por el volumen del dataset (~132M mediciones) se requiere un
              rango de fechas para arrancar el analisis.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EmptyState
              title="Aplica filtros para empezar"
              description="Selecciona un rango de fechas (maximo 7 dias) y opcionalmente un tipo de via en el panel superior, y pulsa Aplicar."
              icon={TrafficCone}
            />
          </CardContent>
        </Card>
      ) : (
        <>
          <TarjetasResumenTrafico
            resumen={resumen}
            isLoading={cargandoStats}
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
