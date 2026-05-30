/**
 * Pagina de Aforo de Bicicletas
 *
 * Refactorizada en sub-componentes: Estadisticas, Filtros, Graficos,
 * PanelDetalleEstacion, TablaAforoBicicletas + mapa de estaciones.
 */

import { useState, useCallback, useMemo } from 'react';
import { Radio } from 'lucide-react';
import { PageLayout } from '../../components/layout';
import {
  Card, CardHeader, CardTitle, CardContent, CardDescription, Skeleton
} from '../../components/common';
import { MapaClusterizado } from '../../components/mapas';
import {
  useAforoBicicletas, useAforoEstadisticas, useAforoDistribucionHoraria,
  useAforoEstaciones, useAforoEstacion, useMapaAforo, useCensoResumenDistritos
} from '../../api/hooks';
import { PAGINATION, DATE_CONFIG } from '../../constants';
import { formatNumber, formatHour } from '../../utils';

import EstadisticasAforoBicicletas from './EstadisticasAforoBicicletas';
import FiltrosAforoBicicletas from './FiltrosAforoBicicletas';
import GraficosAforoBicicletas from './GraficosAforoBicicletas';
import PanelDetalleEstacion from './PanelDetalleEstacion';
import TablaAforoBicicletas from './TablaAforoBicicletas';
import { rangoHorarioDeFranja } from './helpers';

function PaginaAforoBicicletas() {
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
    if (filtros.distrito) params.distrito = filtros.distrito;
    if (filtros.franjaHoraria) {
      const rango = rangoHorarioDeFranja(filtros.franjaHoraria);
      if (rango) {
        params.horaMin = rango.min;
        params.horaMax = rango.max;
      }
    }
    if (filtros.mes) {
      const fecha = new Date(DATE_CONFIG.DATASET_YEAR, parseInt(filtros.mes) - 1, 1);
      params.startDate = fecha.toISOString();
      const fechaFin = new Date(DATE_CONFIG.DATASET_YEAR, parseInt(filtros.mes), 0);
      params.endDate = fechaFin.toISOString();
    }
    return params;
  }, [paginaActual, filtros]);

  const { data: aforoResult, isLoading, error, refetch } = useAforoBicicletas(queryParams);
  const { data: estadisticasResult } = useAforoEstadisticas(queryParams);
  const { data: distribucionResult } = useAforoDistribucionHoraria(queryParams);
  const { data: estacionesResult } = useAforoEstaciones({ ...queryParams, limit: 10 });
  const { data: detalleEstacion, isLoading: detalleLoading } = useAforoEstacion(estacionSeleccionada);
  const { data: resumenCenso } = useCensoResumenDistritos({ año: DATE_CONFIG.DATASET_YEAR });
  // Propagar filtros al mapa para que las estaciones cambien al filtrar
  // por distrito o periodo. Sin esto, el mapa muestra siempre todas las
  // estaciones aunque el resto de la pagina se filtre.
  const { data: featureCollectionMapa, isLoading: cargandoMapa } = useMapaAforo(queryParams);

  const datos = useMemo(() => aforoResult?.data || [], [aforoResult?.data]);
  const paginacion = aforoResult?.pagination || null;
  // El endpoint envuelve los totales en `data.estadisticas`. Aceptamos
  // tambien data plana por compatibilidad si algun controller cambia el shape.
  const estadisticas = estadisticasResult?.data?.estadisticas || estadisticasResult?.data || null;

  // El endpoint /aforo-bicicletas/distribucion-horaria envuelve la lista
  // en `data.distribucionHoraria` (array de 24 horas). Aceptamos tambien
  // `data.data` por compatibilidad. El nombre del campo de hora es
  // `hora`, no `_id`.
  const datosPatronHorario = useMemo(() => {
    const raw = distribucionResult?.data?.distribucionHoraria
      || distribucionResult?.data?.data
      || [];
    return raw.map(h => ({
      hora: formatHour(h.hora ?? h._id),
      promedio: Math.round(h.promedioBicicletas || h.avgBicicletas || 0),
      total: h.totalBicicletas || 0
    }));
  }, [distribucionResult]);

  // El endpoint /aforo-bicicletas/estaciones envuelve la lista en
  // `data.estaciones` (no en `data.data`). Esta lista alimenta el grafico
  // top-N y el filtro de distritos; sin esta normalizacion ambos quedaban
  // vacios y el stat card "Estaciones activas" mostraba 0.
  const estacionesRanking = useMemo(() => {
    return estacionesResult?.data?.estaciones
      || estacionesResult?.data?.data
      || [];
  }, [estacionesResult]);

  const datosTopEstaciones = useMemo(() => {
    return estacionesRanking
      .slice(0, 10)
      .map(e => ({
        nombre: e.identificador || e._id || 'Desconocida',
        total: e.totalBicicletas || 0
      }));
  }, [estacionesRanking]);

  const opcionesDistrito = useMemo(() => {
    const distritos = [...new Set(estacionesRanking.map(e => e.distrito).filter(Boolean))];
    return distritos.map(d => ({ value: d, label: d }));
  }, [estacionesRanking]);

  const bicicletasPerCapita = useMemo(() => {
    const totalBicis = estadisticas?.totalBicicletas || estadisticas?.data?.totalBicicletas;
    if (!totalBicis || !resumenCenso?.data?.data) return null;
    const poblacionTotal = resumenCenso.data.data.reduce(
      (sum, d) => sum + (d.totalPoblacion || 0), 0
    );
    if (poblacionTotal === 0) return null;
    return ((totalBicis / poblacionTotal) * 1000).toFixed(1);
  }, [estadisticas, resumenCenso]);

  const manejarCambioFiltro = useCallback((nombre, valor) => {
    setFiltros(prev => ({ ...prev, [nombre]: valor }));
    setPaginaActual(1);
  }, []);

  const limpiarFiltros = useCallback(() => {
    setFiltros({ distrito: '', franjaHoraria: '', mes: '' });
    setPaginaActual(1);
  }, []);

  const manejarCambioPagina = useCallback((pagina) => {
    setPaginaActual(pagina);
  }, []);

  const manejarClickEstacion = useCallback((identificador) => {
    setEstacionSeleccionada(prev => prev === identificador ? null : identificador);
  }, []);

  const cerrarPanel = useCallback(() => {
    setEstacionSeleccionada(null);
  }, []);

  const refrescar = useCallback(() => {
    refetch();
  }, [refetch]);

  const totalMediciones = estadisticas?.totalMediciones || estadisticas?.data?.totalMediciones || 0;
  const totalBicicletas = estadisticas?.totalBicicletas || estadisticas?.data?.totalBicicletas || 0;
  const promedioPorHora = estadisticas?.promedioPorHora || estadisticas?.data?.promedioPorHora || 0;
  // estacionesResult.data tambien expone totalEstaciones cuando esta disponible;
  // si no, contamos los items del ranking ya normalizados.
  const totalEstaciones = estacionesResult?.data?.totalEstaciones || estacionesRanking.length;
  const hayFiltrosActivos = Boolean(filtros.distrito || filtros.franjaHoraria || filtros.mes);

  return (
    <PageLayout
      eyebrow="Movilidad / Aforo de bicicletas"
      title="Trafico ciclista por estacion"
      description={
        totalMediciones > 0
          ? `${formatNumber(totalMediciones)} mediciones horarias de bicicletas en circulacion, agregadas por estacion fija con franja temporal. Cobertura ${DATE_CONFIG.DATASET_YEAR}.`
          : `Mediciones horarias de bicicletas en circulacion, agregadas por estacion fija con franja temporal. Cobertura ${DATE_CONFIG.DATASET_YEAR}.`
      }
    >
      <EstadisticasAforoBicicletas
        totalMediciones={totalMediciones}
        totalBicicletas={totalBicicletas}
        promedioPorHora={promedioPorHora}
        totalEstaciones={totalEstaciones}
        bicicletasPerCapita={bicicletasPerCapita}
        estadisticasCargando={!estadisticas}
        estacionesCargando={!estacionesResult}
      />

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Radio className="size-5" aria-hidden="true" />
            Estaciones de aforo en el mapa
          </CardTitle>
          <CardDescription>
            Puntos clusterizados con volumen agregado de bicicletas por estacion.
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
                  <div>Total bicicletas: {formatNumber(props.totalBicicletas)}</div>
                  <div>Registros: {formatNumber(props.registros)}</div>
                  {props.distrito && <div>Distrito: {props.distrito}</div>}
                  {props.nombreVial && <div>Via: {props.nombreVial}</div>}
                </div>
              )}
            />
          )}
        </CardContent>
      </Card>

      <FiltrosAforoBicicletas
        filtros={filtros}
        opcionesDistrito={opcionesDistrito}
        hayFiltrosActivos={hayFiltrosActivos}
        onCambioFiltro={manejarCambioFiltro}
        onLimpiar={limpiarFiltros}
        onRefrescar={refrescar}
      />

      {!isLoading && (
        <GraficosAforoBicicletas
          datosPatronHorario={datosPatronHorario}
          datosTopEstaciones={datosTopEstaciones}
        />
      )}

      <PanelDetalleEstacion
        identificador={estacionSeleccionada}
        detalle={detalleEstacion}
        isLoading={detalleLoading}
        onCerrar={cerrarPanel}
      />

      <TablaAforoBicicletas
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

export default PaginaAforoBicicletas;
