/**
 * Pagina de Multas de Trafico
 *
 * Visualizacion de datos de multas de trafico:
 * - Estadisticas generales (total, importe medio, puntos, % graves)
 * - Distribucion por calificacion (grafico de barras)
 * - Top ubicaciones con mas multas (grafico de barras)
 * - Metrica cruzada: multas per capita por distrito (datos del censo)
 * - Tabla detallada con filtros
 * - Panel de detalle con datos de velocidad
 */

import { useState, useCallback, useMemo } from 'react';
import {
  FileWarning, Filter, RefreshCw, Banknote, AlertOctagon, ShieldAlert, X
} from 'lucide-react';
import { PageLayout } from '../../components/layout';
import {
  Card, CardHeader, CardTitle, CardContent, CardDescription,
  Button, Select, Badge,
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell, TableCaption,
  LoadingState, ErrorState, EmptyState, Pagination,
  TableSkeleton, CardSkeleton
} from '../../components/common';
import { StatCard, BarChartCard } from '../../components/charts';
import { useMultas, useMultasDashboard, useMultasRanking, useMultaDetalle } from '../../api/hooks';
import { useCensoResumenDistritos } from '../../api/hooks';
import {
  PAGINATION, DATE_CONFIG, CALIFICACIONES_MULTA, ETIQUETAS_CALIFICACION_MULTA,
  TIPOS_DENUNCIANTE, CHART_COLORS
} from '../../constants';
import { formatNumber, formatDate } from '../../utils';

// Opciones de filtro para calificacion
const opcionesCalificacion = Object.entries(ETIQUETAS_CALIFICACION_MULTA).map(([value, label]) => ({
  value, label
}));

// Opciones de filtro para denunciante
const opcionesDenunciante = Object.entries(TIPOS_DENUNCIANTE).map(([, value]) => ({
  value, label: value
}));

// Opciones de mes
const opcionesMes = Array.from({ length: 12 }, (_, i) => ({
  value: String(i + 1),
  label: new Date(2051, i, 1).toLocaleString('es-ES', { month: 'long' })
}));

// Opciones de descuento
const opcionesDescuento = [
  { value: 'true', label: 'Con descuento' },
  { value: 'false', label: 'Sin descuento' }
];

/**
 * Obtiene la variante del badge segun la calificacion
 * @param {string} calificacion - Calificacion de la multa
 * @returns {string} Variante del badge
 */
function obtenerVarianteBadgeCalificacion(calificacion) {
  switch (calificacion) {
    case CALIFICACIONES_MULTA.LEVE: return 'info';
    case CALIFICACIONES_MULTA.GRAVE: return 'warning';
    case CALIFICACIONES_MULTA.MUY_GRAVE: return 'destructive';
    default: return 'secondary';
  }
}

/**
 * Formatea un importe en euros
 * @param {number} valor - Valor numerico
 * @returns {string} Valor formateado con simbolo de euro
 */
function formatearImporte(valor) {
  if (valor === null || valor === undefined || isNaN(valor)) return '-';
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(valor);
}

/**
 * Pagina de multas de trafico
 */
function PaginaMultas() {
  const [filtros, setFiltros] = useState({
    calificacion: '',
    denunciante: '',
    mes: '',
    tieneDescuento: ''
  });

  const [paginaActual, setPaginaActual] = useState(1);
  const [multaSeleccionada, setMultaSeleccionada] = useState(null);

  // Parametros de consulta para la lista principal
  const queryParams = useMemo(() => {
    const params = {
      page: paginaActual,
      limit: PAGINATION.DEFAULT_LIMIT
    };
    if (filtros.calificacion) params.calificacion = filtros.calificacion;
    if (filtros.denunciante) params.denunciante = filtros.denunciante;
    if (filtros.tieneDescuento) params.tieneDescuento = filtros.tieneDescuento;
    if (filtros.mes) {
      const fecha = new Date(DATE_CONFIG.DATASET_YEAR, parseInt(filtros.mes) - 1, 1);
      params.startDate = fecha.toISOString();
      const fechaFin = new Date(DATE_CONFIG.DATASET_YEAR, parseInt(filtros.mes), 0);
      params.endDate = fechaFin.toISOString();
    }
    return params;
  }, [paginaActual, filtros]);

  // Queries
  const { data: multasResult, isLoading, error, refetch } = useMultas(queryParams);
  const { data: dashboardResult } = useMultasDashboard({ periodo: 'year' });
  const { data: rankingResult } = useMultasRanking({ limit: 10 });
  const { data: detalleResult, isLoading: detalleLoading } = useMultaDetalle(multaSeleccionada);
  const { data: resumenCenso } = useCensoResumenDistritos({ año: DATE_CONFIG.DATASET_YEAR });

  // Datos extraidos
  const datos = useMemo(() => multasResult?.data || [], [multasResult?.data]);
  const paginacion = multasResult?.pagination || null;
  const dashboard = dashboardResult?.data || null;
  const ranking = rankingResult?.data || null;

  // Datos para grafico de calificacion
  const datosGraficoCalificacion = useMemo(() => {
    if (!dashboard?.metricas) return [];
    const metricas = dashboard.metricas;
    return [
      { nombre: 'Leve', total: metricas.multasLeves || 0 },
      { nombre: 'Grave', total: metricas.multasGraves || 0 },
      { nombre: 'Muy Grave', total: metricas.multasMuyGraves || 0 }
    ].filter(d => d.total > 0);
  }, [dashboard]);

  // Datos para grafico de ranking ubicaciones
  const datosGraficoRanking = useMemo(() => {
    if (!ranking?.data) return [];
    return ranking.data
      .slice(0, 10)
      .map(r => ({
        nombre: r.lugar ? (r.lugar.length > 30 ? r.lugar.substring(0, 30) + '...' : r.lugar) : r._id,
        total: r.totalMultas || r.count || 0
      }));
  }, [ranking]);

  // Metrica cruzada: multas per capita (si hay datos de censo)
  const multasPerCapita = useMemo(() => {
    if (!dashboard?.metricas?.totalMultas || !resumenCenso?.data?.data) return null;
    const poblacionTotal = resumenCenso.data.data.reduce((sum, d) => sum + (d.totalPoblacion || 0), 0);
    if (poblacionTotal === 0) return null;
    return ((dashboard.metricas.totalMultas / poblacionTotal) * 1000).toFixed(1);
  }, [dashboard, resumenCenso]);

  // Manejadores de eventos
  const manejarCambioFiltro = useCallback((nombre, valor) => {
    setFiltros(prev => ({ ...prev, [nombre]: valor }));
    setPaginaActual(1);
  }, []);

  const limpiarFiltros = useCallback(() => {
    setFiltros({ calificacion: '', denunciante: '', mes: '', tieneDescuento: '' });
    setPaginaActual(1);
  }, []);

  const manejarCambioPagina = useCallback((pagina) => {
    setPaginaActual(pagina);
  }, []);

  const manejarClickMulta = useCallback((id) => {
    setMultaSeleccionada(prev => prev === id ? null : id);
  }, []);

  // Estadisticas del dashboard
  const totalMultas = dashboard?.metricas?.totalMultas || 0;
  const importeMedio = dashboard?.metricas?.importePromedio || 0;
  const puntosTotales = dashboard?.metricas?.puntosTotal || 0;
  const porcentajeGraves = dashboard?.metricas?.porcentajeGraves || 0;

  const hayFiltrosActivos = filtros.calificacion || filtros.denunciante || filtros.mes || filtros.tieneDescuento;

  return (
    <PageLayout
      title="Multas de Trafico"
      description="Datos de multas e infracciones de trafico - Anthem City 2051"
    >
      {/* Tarjetas de estadisticas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total Multas"
          value={formatNumber(totalMultas)}
          icon={FileWarning}
          isLoading={!dashboard}
        />
        <StatCard
          title="Importe Medio"
          value={formatearImporte(importeMedio)}
          icon={Banknote}
          isLoading={!dashboard}
        />
        <StatCard
          title="Puntos Totales"
          value={formatNumber(puntosTotales)}
          subtitle="Puntos detraidos"
          icon={AlertOctagon}
          isLoading={!dashboard}
        />
        <StatCard
          title="% Graves + Muy Graves"
          value={porcentajeGraves ? `${Number(porcentajeGraves).toFixed(1)}%` : '-'}
          icon={ShieldAlert}
          isLoading={!dashboard}
        />
      </div>

      {/* Metrica cruzada per capita */}
      {multasPerCapita && (
        <Card className="mb-6 border-cyan-500/20 bg-gradient-to-r from-cyan-950/30 to-card/50">
          <CardContent className="py-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Multas por cada 1.000 habitantes (datos del censo)</span>
              <span className="text-lg font-semibold text-cyan-400">{multasPerCapita}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filtros */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="size-4 text-cyan-400" />
              <CardTitle className="text-base">Filtros</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              {hayFiltrosActivos && (
                <Button variant="ghost" size="sm" onClick={limpiarFiltros}>
                  <X className="size-4 mr-1" />
                  Limpiar
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={() => refetch()}>
                <RefreshCw className="size-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Select
              options={opcionesCalificacion}
              value={filtros.calificacion}
              onChange={(e) => manejarCambioFiltro('calificacion', e.target.value)}
              placeholder="Todas las calificaciones"
            />
            <Select
              options={opcionesDenunciante}
              value={filtros.denunciante}
              onChange={(e) => manejarCambioFiltro('denunciante', e.target.value)}
              placeholder="Todos los denunciantes"
            />
            <Select
              options={opcionesMes}
              value={filtros.mes}
              onChange={(e) => manejarCambioFiltro('mes', e.target.value)}
              placeholder="Todos los meses"
            />
            <Select
              options={opcionesDescuento}
              value={filtros.tieneDescuento}
              onChange={(e) => manejarCambioFiltro('tieneDescuento', e.target.value)}
              placeholder="Descuento: todos"
            />
          </div>
        </CardContent>
      </Card>

      {/* Graficos */}
      {!isLoading && (datosGraficoCalificacion.length > 0 || datosGraficoRanking.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {datosGraficoCalificacion.length > 0 && (
            <BarChartCard
              title="Distribucion por calificacion"
              data={datosGraficoCalificacion}
              xKey="nombre"
              bars={[
                { key: 'total', name: 'Total multas', color: CHART_COLORS.primary }
              ]}
            />
          )}
          {datosGraficoRanking.length > 0 && (
            <BarChartCard
              title="Top 10 ubicaciones con mas multas"
              data={datosGraficoRanking}
              xKey="nombre"
              bars={[
                { key: 'total', name: 'Total multas', color: CHART_COLORS.quaternary }
              ]}
            />
          )}
        </div>
      )}

      {/* Panel de detalle de multa */}
      {detalleLoading && <CardSkeleton lines={5} />}
      {detalleResult?.data && (
        <Card className="mb-6 border-cyan-500/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Detalle de la multa</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setMultaSeleccionada(null)}>
                <X className="size-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">Importe boletin</p>
                <p className="text-lg font-semibold text-white">{formatearImporte(detalleResult.data.importeBoletín)}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">Importe final</p>
                <p className="text-lg font-semibold text-white">{formatearImporte(detalleResult.data.importeFinal)}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">Puntos</p>
                <p className="text-lg font-semibold text-white">{detalleResult.data.puntosDetraídos || 0}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">Calificacion</p>
                <Badge variant={obtenerVarianteBadgeCalificacion(detalleResult.data.calificacion)}>
                  {ETIQUETAS_CALIFICACION_MULTA[detalleResult.data.calificacion] || detalleResult.data.calificacion}
                </Badge>
              </div>
            </div>
            {detalleResult.data.descripcionInfraccion && (
              <div className="p-3 rounded-lg bg-muted/50 mb-4">
                <p className="text-sm text-muted-foreground mb-1">Descripcion de la infraccion</p>
                <p className="text-sm text-white">{detalleResult.data.descripcionInfraccion}</p>
              </div>
            )}
            {detalleResult.data.datosVelocidad?.velocidadLimite && (
              <div className="grid grid-cols-3 gap-4">
                <div className="p-3 rounded-lg bg-red-950/30 border border-red-500/20">
                  <p className="text-sm text-muted-foreground">Vel. limite</p>
                  <p className="text-lg font-semibold text-white">{detalleResult.data.datosVelocidad.velocidadLimite} km/h</p>
                </div>
                <div className="p-3 rounded-lg bg-red-950/30 border border-red-500/20">
                  <p className="text-sm text-muted-foreground">Vel. circulacion</p>
                  <p className="text-lg font-semibold text-red-400">{detalleResult.data.datosVelocidad.velocidadCirculacion} km/h</p>
                </div>
                <div className="p-3 rounded-lg bg-red-950/30 border border-red-500/20">
                  <p className="text-sm text-muted-foreground">Exceso</p>
                  <p className="text-lg font-semibold text-red-400">+{detalleResult.data.datosVelocidad.exceso} km/h</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tabla principal */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Registro de Multas</CardTitle>
          <CardDescription>
            {paginacion
              ? `${formatNumber(paginacion.totalDocuments || paginacion.totalItems || 0)} multas encontradas`
              : 'Cargando...'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <TableSkeleton rows={6} columns={7} />
          ) : error ? (
            <ErrorState
              message="Error al cargar multas"
              onRetry={() => refetch()}
            />
          ) : datos.length === 0 ? (
            <EmptyState message="No se encontraron multas con los filtros seleccionados" />
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table label="Listado de multas de trafico" rowCount={paginacion?.totalDocuments}>
                  <TableCaption>Multas de trafico - Anthem City {DATE_CONFIG.DATASET_YEAR}</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Hora</TableHead>
                      <TableHead>Lugar</TableHead>
                      <TableHead>Calificacion</TableHead>
                      <TableHead className="text-right">Importe</TableHead>
                      <TableHead>Descuento</TableHead>
                      <TableHead className="text-right">Puntos</TableHead>
                      <TableHead>Denunciante</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {datos.map((multa, index) => (
                      <TableRow
                        key={multa._id || index}
                        className="cursor-pointer hover:bg-muted/60"
                        onClick={() => manejarClickMulta(multa._id)}
                      >
                        <TableCell>{formatDate(multa.fecha)}</TableCell>
                        <TableCell>{multa.hora || '-'}</TableCell>
                        <TableCell className="max-w-[200px] truncate" title={multa.lugar}>
                          {multa.lugar || '-'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={obtenerVarianteBadgeCalificacion(multa.calificacion)}>
                            {ETIQUETAS_CALIFICACION_MULTA[multa.calificacion] || multa.calificacion}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">{formatearImporte(multa.importeFinal || multa.importeBoletín)}</TableCell>
                        <TableCell>
                          <Badge variant={multa.tieneDescuento ? 'success' : 'secondary'}>
                            {multa.tieneDescuento ? 'Si' : 'No'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">{multa.puntosDetraídos || 0}</TableCell>
                        <TableCell className="text-sm">{multa.denunciante || '-'}</TableCell>
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

export default PaginaMultas;
