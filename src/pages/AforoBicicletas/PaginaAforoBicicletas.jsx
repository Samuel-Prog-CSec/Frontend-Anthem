/**
 * Pagina de Aforo de Bicicletas
 *
 * Visualizacion de datos de conteo horario de trafico ciclista:
 * - Estadisticas generales (mediciones, bicicletas, promedio/hora, estaciones)
 * - Patron horario (grafico de linea 0-23h)
 * - Top estaciones por volumen (grafico de barras)
 * - Metrica cruzada: trafico ciclista per capita (datos del censo)
 * - Tabla detallada con filtros
 * - Panel de detalle por estacion
 */

import { useState, useCallback, useMemo } from 'react';
import {
  Activity, Filter, RefreshCw, Bike, Clock, Radio, X
} from 'lucide-react';
import { PageLayout } from '../../components/layout';
import {
  Card, CardHeader, CardTitle, CardContent, CardDescription,
  Button, Select, Badge,
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell, TableCaption,
  LoadingState, ErrorState, EmptyState, Pagination
} from '../../components/common';
import { StatCard, LineChartCard, BarChartCard } from '../../components/charts';
import {
  useAforoBicicletas, useAforoEstadisticas, useAforoDistribucionHoraria,
  useAforoEstaciones, useAforoEstacion
} from '../../api/hooks';
import { useCensoResumenDistritos } from '../../api/hooks';
import {
  PAGINATION, DATE_CONFIG, FRANJAS_HORARIAS, ETIQUETAS_FRANJAS_HORARIAS, CHART_COLORS
} from '../../constants';
import { formatNumber, formatDate } from '../../utils';

// Opciones de filtro para franja horaria
const opcionesFranjaHoraria = Object.entries(ETIQUETAS_FRANJAS_HORARIAS).map(([value, label]) => ({
  value, label
}));

// Opciones de mes
const opcionesMes = Array.from({ length: 12 }, (_, i) => ({
  value: String(i + 1),
  label: new Date(2051, i, 1).toLocaleString('es-ES', { month: 'long' })
}));

/**
 * Obtiene la variante del badge segun la franja horaria
 * @param {string} franja - Franja horaria
 * @returns {string} Variante del badge
 */
function obtenerVarianteBadgeFranja(franja) {
  switch (franja) {
    case FRANJAS_HORARIAS.MADRUGADA: return 'secondary';
    case FRANJAS_HORARIAS.MAÑANA: return 'info';
    case FRANJAS_HORARIAS.MEDIODIA: return 'success';
    case FRANJAS_HORARIAS.TARDE: return 'warning';
    case FRANJAS_HORARIAS.NOCHE: return 'purple';
    default: return 'secondary';
  }
}

/**
 * Pagina de aforo de bicicletas
 */
function PaginaAforoBicicletas() {
  const [filtros, setFiltros] = useState({
    distrito: '',
    franjaHoraria: '',
    mes: ''
  });

  const [paginaActual, setPaginaActual] = useState(1);
  const [estacionSeleccionada, setEstacionSeleccionada] = useState(null);

  // Parametros de consulta para la lista principal
  const queryParams = useMemo(() => {
    const params = {
      page: paginaActual,
      limit: PAGINATION.DEFAULT_LIMIT
    };
    if (filtros.distrito) params.distrito = filtros.distrito;
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
      const fechaFin = new Date(DATE_CONFIG.DATASET_YEAR, parseInt(filtros.mes), 0);
      params.endDate = fechaFin.toISOString();
    }
    return params;
  }, [paginaActual, filtros]);

  // Queries
  const { data: aforoResult, isLoading, error, refetch } = useAforoBicicletas(queryParams);
  const { data: estadisticasResult } = useAforoEstadisticas(queryParams);
  const { data: distribucionResult } = useAforoDistribucionHoraria(queryParams);
  const { data: estacionesResult } = useAforoEstaciones({ ...queryParams, limit: 10 });
  const { data: detalleEstacion, isLoading: detalleLoading } = useAforoEstacion(estacionSeleccionada);
  const { data: resumenCenso } = useCensoResumenDistritos({ año: DATE_CONFIG.DATASET_YEAR });

  // Datos extraidos
  const datos = useMemo(() => aforoResult?.data || [], [aforoResult?.data]);
  const paginacion = aforoResult?.pagination || null;
  const estadisticas = estadisticasResult?.data || null;

  // Datos para grafico de patron horario (linea)
  const datosPatronHorario = useMemo(() => {
    if (!distribucionResult?.data?.data) return [];
    return distribucionResult.data.data.map(h => ({
      hora: `${h._id}:00`,
      promedio: Math.round(h.promedioBicicletas || h.avgBicicletas || 0),
      total: h.totalBicicletas || 0
    }));
  }, [distribucionResult]);

  // Datos para grafico de top estaciones (barras)
  const datosTopEstaciones = useMemo(() => {
    if (!estacionesResult?.data?.data) return [];
    return estacionesResult.data.data
      .slice(0, 10)
      .map(e => ({
        nombre: e._id || e.identificador || 'Desconocida',
        total: e.totalBicicletas || 0
      }));
  }, [estacionesResult]);

  // Metrica cruzada: bicicletas per capita
  const bicicletasPerCapita = useMemo(() => {
    const totalBicis = estadisticas?.totalBicicletas || estadisticas?.data?.totalBicicletas;
    if (!totalBicis || !resumenCenso?.data?.data) return null;
    const poblacionTotal = resumenCenso.data.data.reduce((sum, d) => sum + (d.totalPoblacion || 0), 0);
    if (poblacionTotal === 0) return null;
    return ((totalBicis / poblacionTotal) * 1000).toFixed(1);
  }, [estadisticas, resumenCenso]);

  // Opciones de distrito (extraidas de las estaciones)
  const opcionesDistrito = useMemo(() => {
    if (!estacionesResult?.data?.data) return [];
    const distritos = [...new Set(estacionesResult.data.data.map(e => e.distrito).filter(Boolean))];
    return distritos.map(d => ({ value: d, label: d }));
  }, [estacionesResult]);

  // Manejadores de eventos
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

  // Estadisticas principales
  const totalMediciones = estadisticas?.totalMediciones || estadisticas?.data?.totalMediciones || 0;
  const totalBicicletas = estadisticas?.totalBicicletas || estadisticas?.data?.totalBicicletas || 0;
  const promedioPorHora = estadisticas?.promedioPorHora || estadisticas?.data?.promedioPorHora || 0;
  const totalEstaciones = estacionesResult?.data?.data?.length || 0;

  const hayFiltrosActivos = filtros.distrito || filtros.franjaHoraria || filtros.mes;

  return (
    <PageLayout
      title="Aforo de Bicicletas"
      description="Conteo horario de trafico ciclista por estacion - Anthem City 2051"
    >
      {/* Tarjetas de estadisticas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total Mediciones"
          value={formatNumber(totalMediciones)}
          icon={Activity}
          isLoading={!estadisticas}
        />
        <StatCard
          title="Bicicletas Contadas"
          value={formatNumber(totalBicicletas)}
          icon={Bike}
          isLoading={!estadisticas}
        />
        <StatCard
          title="Promedio/Hora"
          value={formatNumber(Math.round(promedioPorHora))}
          subtitle="Bicicletas por hora"
          icon={Clock}
          isLoading={!estadisticas}
        />
        <StatCard
          title="Estaciones Activas"
          value={totalEstaciones}
          icon={Radio}
          isLoading={!estacionesResult}
        />
      </div>

      {/* Metrica cruzada per capita */}
      {bicicletasPerCapita && (
        <Card className="mb-6 border-emerald-500/20 bg-gradient-to-r from-emerald-950/30 to-slate-900/50">
          <CardContent className="py-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Bicicletas contadas por cada 1.000 habitantes (datos del censo)</span>
              <span className="text-lg font-semibold text-emerald-400">{bicicletasPerCapita}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filtros */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-cyan-400" />
              <CardTitle className="text-base">Filtros</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              {hayFiltrosActivos && (
                <Button variant="ghost" size="sm" onClick={limpiarFiltros}>
                  <X className="h-4 w-4 mr-1" />
                  Limpiar
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={() => refetch()}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <Select
              options={opcionesDistrito}
              value={filtros.distrito}
              onChange={(e) => manejarCambioFiltro('distrito', e.target.value)}
              placeholder="Todos los distritos"
            />
            <Select
              options={opcionesFranjaHoraria}
              value={filtros.franjaHoraria}
              onChange={(e) => manejarCambioFiltro('franjaHoraria', e.target.value)}
              placeholder="Todas las franjas"
            />
            <Select
              options={opcionesMes}
              value={filtros.mes}
              onChange={(e) => manejarCambioFiltro('mes', e.target.value)}
              placeholder="Todos los meses"
            />
          </div>
        </CardContent>
      </Card>

      {/* Graficos */}
      {!isLoading && (datosPatronHorario.length > 0 || datosTopEstaciones.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {datosPatronHorario.length > 0 && (
            <LineChartCard
              title="Patron horario (promedio de bicicletas por hora)"
              data={datosPatronHorario}
              xKey="hora"
              lines={[
                { key: 'promedio', name: 'Promedio bicicletas', color: CHART_COLORS.primary }
              ]}
            />
          )}
          {datosTopEstaciones.length > 0 && (
            <BarChartCard
              title="Top 10 estaciones por volumen"
              data={datosTopEstaciones}
              xKey="nombre"
              bars={[
                { key: 'total', name: 'Total bicicletas', color: CHART_COLORS.secondary }
              ]}
            />
          )}
        </div>
      )}

      {/* Panel de detalle de estacion */}
      {detalleLoading && <LoadingState message="Cargando detalle de la estacion..." />}
      {detalleEstacion?.data && (
        <Card className="mb-6 border-emerald-500/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                Estacion: {estacionSeleccionada}
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setEstacionSeleccionada(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <CardDescription>Resumen de trafico ciclista de la estacion</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 rounded-lg bg-slate-800/50">
                <p className="text-sm text-slate-400">Total Bicicletas</p>
                <p className="text-lg font-semibold text-white">
                  {formatNumber(detalleEstacion.data.summary?.totalBicicletas || detalleEstacion.data.data?.totalBicicletas || 0)}
                </p>
              </div>
              <div className="text-center p-3 rounded-lg bg-slate-800/50">
                <p className="text-sm text-slate-400">Mediciones</p>
                <p className="text-lg font-semibold text-white">
                  {formatNumber(detalleEstacion.data.summary?.totalMediciones || 0)}
                </p>
              </div>
              <div className="text-center p-3 rounded-lg bg-slate-800/50">
                <p className="text-sm text-slate-400">Distrito</p>
                <p className="text-lg font-semibold text-white">
                  {detalleEstacion.data.summary?.distrito || '-'}
                </p>
              </div>
              <div className="text-center p-3 rounded-lg bg-slate-800/50">
                <p className="text-sm text-slate-400">Nombre Vial</p>
                <p className="text-lg font-semibold text-white">
                  {detalleEstacion.data.summary?.nombreVial || '-'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabla principal */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Registros de Aforo</CardTitle>
          <CardDescription>
            {paginacion
              ? `${formatNumber(paginacion.totalDocuments || paginacion.totalItems || 0)} registros encontrados`
              : 'Cargando...'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <LoadingState message="Cargando datos de aforo..." />
          ) : error ? (
            <ErrorState
              message="Error al cargar datos de aforo"
              onRetry={() => refetch()}
            />
          ) : datos.length === 0 ? (
            <EmptyState message="No se encontraron registros con los filtros seleccionados" />
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableCaption>Aforo de bicicletas - Anthem City {DATE_CONFIG.DATASET_YEAR}</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Hora</TableHead>
                      <TableHead>Identificador</TableHead>
                      <TableHead className="text-right">Bicicletas</TableHead>
                      <TableHead>Distrito</TableHead>
                      <TableHead>Nombre Vial</TableHead>
                      <TableHead>Franja</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {datos.map((registro, index) => (
                      <TableRow
                        key={registro._id || index}
                        className="cursor-pointer hover:bg-slate-800/60"
                        onClick={() => manejarClickEstacion(registro.identificador)}
                      >
                        <TableCell>{formatDate(registro.fecha)}</TableCell>
                        <TableCell>{registro.hora}:00</TableCell>
                        <TableCell className="font-medium">{registro.identificador}</TableCell>
                        <TableCell className="text-right font-semibold">{registro.bicicletas}</TableCell>
                        <TableCell>{registro.ubicacion?.distrito || '-'}</TableCell>
                        <TableCell>{registro.ubicacion?.nombreVial || '-'}</TableCell>
                        <TableCell>
                          {registro.franjaHoraria && (
                            <Badge variant={obtenerVarianteBadgeFranja(registro.franjaHoraria)}>
                              {ETIQUETAS_FRANJAS_HORARIAS[registro.franjaHoraria] || registro.franjaHoraria}
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {paginacion && (
                <div className="mt-4">
                  <Pagination
                    currentPage={paginaActual}
                    totalPages={paginacion.totalPages || 1}
                    totalItems={paginacion.totalDocuments || paginacion.totalItems || 0}
                    itemsPerPage={PAGINATION.DEFAULT_LIMIT}
                    onPageChange={manejarCambioPagina}
                  />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </PageLayout>
  );
}

export default PaginaAforoBicicletas;
