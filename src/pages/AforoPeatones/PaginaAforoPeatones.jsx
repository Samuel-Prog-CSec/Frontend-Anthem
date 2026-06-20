/**
 * Pagina de Aforo de Peatones
 *
 * Visualizacion de datos de conteo horario de trafico peatonal:
 * - Estadisticas generales (mediciones, peatones, promedio/hora, estaciones)
 * - Mapa clusterizado con volumen agregado por estacion
 * - Patron horario (grafico de linea 0-23h)
 * - Top estaciones por volumen (grafico de barras)
 * - Tabla detallada con filtros
 * - Panel de detalle por estacion
 *
 * La pagina se mantiene delgada delegando filas a sub-componentes en
 * `./EstadisticasAforoPeatones`, `./FiltrosAforoPeatones`,
 * `./GraficosAforoPeatones`, `./TablaAforoPeatones` y
 * `./PanelDetalleEstacionPeatones`.
 */

import { useState, useCallback, useMemo } from 'react';
import { Radio } from 'lucide-react';
import { PageLayout } from '../../components/layout';
import {
  Card, CardHeader, CardTitle, CardContent, CardDescription, Skeleton
} from '../../components/common';
import { MapaClusterizado } from '../../components/mapas';
import {
  useAforoPeatones,
  useAforoPeatonesEstadisticas,
  useAforoPeatonesDistribucionHoraria,
  useAforoPeatonesEstaciones,
  useAforoPeatonesEstacion,
  useMapaAforoPeatones
} from '../../api/hooks';
import { PAGINATION, DATE_CONFIG } from '../../constants';
import { formatNumber, formatHour } from '../../utils';

import EstadisticasAforoPeatones from './EstadisticasAforoPeatones';
import FiltrosAforoPeatones from './FiltrosAforoPeatones';
import GraficosAforoPeatones from './GraficosAforoPeatones';
import TablaAforoPeatones from './TablaAforoPeatones';
import PanelDetalleEstacionPeatones from './PanelDetalleEstacionPeatones';

function PaginaAforoPeatones() {
  const [filtros, setFiltros] = useState({
    distrito: '',
    franjaHoraria: '',
    mes: ''
  });

  const [paginaActual, setPaginaActual] = useState(1);
  const [estacionSeleccionada, setEstacionSeleccionada] = useState(null);

  const queryParams = useMemo(() => {
    const params = {
      page: paginaActual,
      limit: PAGINATION.DEFAULT_LIMIT
    };
    if (filtros.distrito) {params.distrito = filtros.distrito;}
    if (filtros.franjaHoraria) {
      const rangos = {
        MADRUGADA: { min: 0, max: 5 },
        MAÑANA: { min: 6, max: 11 },
        MEDIODIA: { min: 12, max: 14 },
        TARDE: { min: 15, max: 20 },
        NOCHE: { min: 21, max: 23 }
      };
      const rango = rangos[filtros.franjaHoraria];
      if (rango) {
        params.horaMin = rango.min;
        params.horaMax = rango.max;
      }
    }
    if (filtros.mes) {
      const fecha = new Date(DATE_CONFIG.DATASET_YEAR, parseInt(filtros.mes) - 1, 1);
      params.startDate = fecha.toISOString();
      const fechaFin = new Date(DATE_CONFIG.DATASET_YEAR, parseInt(filtros.mes, 10), 0, 23, 59, 59, 999);
      params.endDate = fechaFin.toISOString();
    }
    return params;
  }, [paginaActual, filtros]);

  const { data: aforoResult, isLoading, error, refetch } = useAforoPeatones(queryParams);
  const { data: estadisticasResult } = useAforoPeatonesEstadisticas(queryParams);
  const { data: distribucionResult } = useAforoPeatonesDistribucionHoraria(queryParams);
  const { data: estacionesResult } = useAforoPeatonesEstaciones({ ...queryParams, limit: 10 });
  // Catalogo de distritos sin filtrar (anti-trinquete): lista TODAS las
  // estaciones (no solo el top-10 filtrado) para poblar el desplegable de
  // distrito completo.
  const { data: catalogoEstacionesResult } = useAforoPeatonesEstaciones({ limit: 100 });
  const { data: detalleEstacion, isLoading: detalleLoading } = useAforoPeatonesEstacion(estacionSeleccionada);
  // El mapa debe respetar los filtros activos (distrito/franja/mes), igual que
  // el resto de la pagina; antes se llamaba sin params y mostraba siempre todas
  // las estaciones (regresion vs Aforo de Bicicletas).
  const { data: featureCollectionMapa, isLoading: cargandoMapa } = useMapaAforoPeatones(queryParams);

  const datos = useMemo(() => aforoResult?.data || [], [aforoResult?.data]);
  const paginacion = aforoResult?.pagination || null;
  const estadisticas = estadisticasResult?.data || null;

  // Los endpoints devuelven shapes especificos por recurso:
  //   /distribucion-horaria -> { data: { distribucionHoraria: [...] } }
  //   /estaciones           -> { data: { estaciones: [...] } }
  // Aceptamos tambien `data.data` como fallback por compatibilidad si algun
  // futuro cambio de controller aplana el envelope.
  const datosPatronHorario = useMemo(() => {
    const raw = distribucionResult?.data?.distribucionHoraria || distribucionResult?.data?.data || [];
    return raw.map(h => ({
      hora: formatHour(h.hora),
      promedio: Math.round(h.promedioPeatones || 0),
      total: h.totalPeatones || 0
    }));
  }, [distribucionResult]);

  // Serie plana (promedio de peatones por hora, orden cronologico 0-23h) para
  // la sparkline inline de la tarjeta "Promedio/hora".
  const seriePatronHorario = useMemo(() => {
    return datosPatronHorario.map(h => h.promedio);
  }, [datosPatronHorario]);

  const estacionesRanking = useMemo(() => {
    return estacionesResult?.data?.estaciones || estacionesResult?.data?.data || [];
  }, [estacionesResult]);

  const datosTopEstaciones = useMemo(() => {
    return estacionesRanking
      .slice(0, 10)
      .map(e => ({
        nombre: e.identificador || e._id || 'Desconocida',
        total: e.totalPeatones || 0
      }));
  }, [estacionesRanking]);

  const opcionesDistrito = useMemo(() => {
    const catalogo = catalogoEstacionesResult?.data?.estaciones
      || catalogoEstacionesResult?.data?.data
      || [];
    const distritos = [...new Set(catalogo.map(e => e.distrito).filter(Boolean))].sort();
    return distritos.map(d => ({ value: d, label: d }));
  }, [catalogoEstacionesResult]);

  const manejarCambioFiltro = useCallback((nombre, valor) => {
    setFiltros(prev => ({ ...prev, [nombre]: valor }));
    setPaginaActual(1);
    // Cerrar el detalle: la estacion abierta puede no pertenecer al nuevo
    // conjunto filtrado (su query es independiente de los filtros) y quedaria
    // mostrando datos sin relacion con lo que se ve en la tabla/mapa.
    setEstacionSeleccionada(null);
  }, []);

  const limpiarFiltros = useCallback(() => {
    setFiltros({ distrito: '', franjaHoraria: '', mes: '' });
    setPaginaActual(1);
    setEstacionSeleccionada(null);
  }, []);

  const manejarCambioPagina = useCallback((pagina) => {
    setPaginaActual(pagina);
  }, []);

  const manejarClickEstacion = useCallback((identificador) => {
    setEstacionSeleccionada(prev => prev === identificador ? null : identificador);
  }, []);

  const cerrarPanelEstacion = useCallback(() => {
    setEstacionSeleccionada(null);
  }, []);

  const refrescar = useCallback(() => {
    refetch();
  }, [refetch]);

  // El endpoint /aforo-peatones/estadisticas devuelve:
  //   data: { periodo, estadisticas: { totalMediciones, totalPeatones, ... } }
  // tras normalizarRespuestaDetalle queda en `estadisticas.estadisticas`.
  // Aceptamos tambien forma plana por si algun controller cambiase el shape.
  const stats = estadisticas?.estadisticas || estadisticas?.data?.estadisticas || estadisticas?.data || estadisticas || {};
  const totalMediciones = stats.totalMediciones || 0;
  const totalPeatones = stats.totalPeatones || 0;
  const promedioPorHora = stats.promedioPorHora || 0;
  // El ranking se pide con limit:10, asi que su .length no es el total real de
  // estaciones. Preferimos un conteo del backend si lo expone; si no, caemos al
  // numero de estaciones del ranking como aproximacion.
  const totalEstaciones = stats.totalEstaciones
    ?? estacionesResult?.data?.totalEstaciones
    ?? estacionesRanking.length;
  const hayFiltrosActivos = Boolean(filtros.distrito || filtros.franjaHoraria || filtros.mes);

  return (
    <PageLayout
      title="Aforo de peatones"
      description="Recuento de peatones por estaciones de aforo. Patrones horarios, comparativa entre puntos y distribución temporal en 2051."
    >
      <EstadisticasAforoPeatones
        totalMediciones={totalMediciones}
        totalPeatones={totalPeatones}
        promedioPorHora={promedioPorHora}
        totalEstaciones={totalEstaciones}
        seriePatronHorario={seriePatronHorario}
        estadisticasCargando={!estadisticas}
        estacionesCargando={!estacionesResult}
      />

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Radio className="size-5" aria-hidden="true" />
            Estaciones de aforo peatonal en el mapa
          </CardTitle>
          <CardDescription>
            Puntos clusterizados con volumen agregado de peatones por estación.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {cargandoMapa ? (
            <Skeleton className="h-[400px] w-full rounded-xl" />
          ) : (
            <MapaClusterizado
              featureCollection={featureCollectionMapa}
              altura="420px"
              renderPopup={(props) => (
                <div className="text-sm">
                  <div className="font-semibold mb-1">{props.identificador}</div>
                  <div>Total peatones: {formatNumber(props.totalPeatones)}</div>
                  <div>Registros: {formatNumber(props.registros)}</div>
                  {props.distrito && <div>Distrito: {props.distrito}</div>}
                  {props.nombreVial && <div>Vía: {props.nombreVial}</div>}
                </div>
              )}
            />
          )}
        </CardContent>
      </Card>

      <FiltrosAforoPeatones
        filtros={filtros}
        opcionesDistrito={opcionesDistrito}
        hayFiltrosActivos={hayFiltrosActivos}
        onCambioFiltro={manejarCambioFiltro}
        onLimpiarFiltros={limpiarFiltros}
        onRefrescar={refrescar}
      />

      {!isLoading && (
        <GraficosAforoPeatones
          datosPatronHorario={datosPatronHorario}
          datosTopEstaciones={datosTopEstaciones}
        />
      )}

      <PanelDetalleEstacionPeatones
        identificador={estacionSeleccionada}
        detalleEstacion={detalleEstacion}
        isLoading={detalleLoading}
        onCerrar={cerrarPanelEstacion}
      />

      <TablaAforoPeatones
        datos={datos}
        paginacion={paginacion}
        paginaActual={paginaActual}
        isLoading={isLoading}
        error={error}
        onCambioPagina={manejarCambioPagina}
        onClickEstacion={manejarClickEstacion}
        onReintentar={refrescar}
      />
    </PageLayout>
  );
}

export default PaginaAforoPeatones;
