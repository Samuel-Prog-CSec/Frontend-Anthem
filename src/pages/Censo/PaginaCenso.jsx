/**
 * Pagina de Censo Demografico
 *
 * Visualizacion de datos demograficos del censo municipal:
 * - Estadisticas generales (poblacion, extranjeros, ratio genero)
 * - Distribucion por distrito (grafico de barras)
 * - Distribucion por grupo de edad (grafico de pastel)
 * - Tabla detallada con filtros por distrito, barrio y grupo de edad
 * - Panel de detalle por distrito con desglose por barrios
 */

import { useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Users, Filter, RefreshCw, Globe, UserCheck, MapPin, X, ArrowRight } from 'lucide-react';
import { PageLayout } from '../../components/layout';
import {
  Card, CardHeader, CardTitle, CardContent, CardDescription,
  Button, Select, Badge,
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell, TableCaption,
  LoadingState, ErrorState, EmptyState, Pagination,
  TableSkeleton
} from '../../components/common';
import { StatCard, BarChartCard, PieChartCard } from '../../components/charts';
import { useCenso, useCensoDashboard, useCensoDistritos } from '../../api/hooks';
import {
  PAGINATION, DATE_CONFIG, GRUPOS_EDAD_CENSO, ETIQUETAS_GRUPOS_EDAD, CHART_COLORS,
  ROUTES
} from '../../constants';
import { formatNumber } from '../../utils';

// Opciones de filtro para grupo de edad
const opcionesGrupoEdad = Object.entries(ETIQUETAS_GRUPOS_EDAD).map(([value, label]) => ({
  value,
  label
}));

// Opciones de filtro para mes
const opcionesMes = Array.from({ length: 12 }, (_, i) => ({
  value: String(i + 1),
  label: new Date(2051, i, 1).toLocaleString('es-ES', { month: 'long' })
}));

/**
 * Obtiene la variante del badge segun el grupo de edad
 * @param {string} grupoEdad - Grupo de edad
 * @returns {string} Variante del badge
 */
function obtenerVarianteBadgeEdad(grupoEdad) {
  switch (grupoEdad) {
    case GRUPOS_EDAD_CENSO.INFANTIL: return 'info';
    case GRUPOS_EDAD_CENSO.JUVENIL: return 'primary';
    case GRUPOS_EDAD_CENSO.ADULTO_JOVEN: return 'success';
    case GRUPOS_EDAD_CENSO.ADULTO: return 'secondary';
    case GRUPOS_EDAD_CENSO.MAYOR: return 'warning';
    case GRUPOS_EDAD_CENSO.ANCIANO: return 'destructive';
    default: return 'secondary';
  }
}

/**
 * Formatea un porcentaje con decimales
 * @param {number} valor - Valor numerico
 * @param {number} [decimales=1] - Decimales
 * @returns {string} Valor formateado con %
 */
function formatearPorcentaje(valor, decimales = 1) {
  if (valor === null || valor === undefined || isNaN(valor)) return '-';
  return `${Number(valor).toFixed(decimales)}%`;
}

/**
 * Pagina de censo demografico
 */
function PaginaCenso() {
  const [filtros, setFiltros] = useState({
    distrito: '',
    barrio: '',
    grupoEdad: '',
    mes: ''
  });

  const [paginaActual, setPaginaActual] = useState(1);
  const [distritoDetalle, setDistritoDetalle] = useState(null);

  // Parametros de consulta para la lista principal
  const queryParams = useMemo(() => {
    const params = {
      page: paginaActual,
      limit: PAGINATION.DEFAULT_LIMIT
    };
    if (filtros.distrito) params.distrito = filtros.distrito;
    if (filtros.barrio) params.barrio = filtros.barrio;
    if (filtros.grupoEdad) params.grupoEdad = filtros.grupoEdad;
    if (filtros.mes) {
      const fecha = new Date(DATE_CONFIG.DATASET_YEAR, parseInt(filtros.mes) - 1, 1);
      params.startDate = fecha.toISOString();
      const fechaFin = new Date(DATE_CONFIG.DATASET_YEAR, parseInt(filtros.mes), 0);
      params.endDate = fechaFin.toISOString();
    }
    return params;
  }, [paginaActual, filtros]);

  // Parametros para estadisticas de distritos
  const statsParams = useMemo(() => ({
    año: DATE_CONFIG.DATASET_YEAR,
    ...(filtros.mes ? { mes: parseInt(filtros.mes) } : {})
  }), [filtros.mes]);

  // Queries
  const { data: censoResult, isLoading, error, refetch } = useCenso(queryParams);
  const { data: dashboardResult } = useCensoDashboard(statsParams);
  const { data: distritosResult } = useCensoDistritos(statsParams);

  // Datos extraidos
  const datos = useMemo(() => censoResult?.data || [], [censoResult?.data]);
  const paginacion = censoResult?.pagination || null;
  const dashboard = dashboardResult?.data || null;
  const distritosStats = distritosResult?.data || null;

  // Datos para graficos
  const datosGraficoDistritos = useMemo(() => {
    if (!distritosStats?.districtStatistics) return [];
    return distritosStats.districtStatistics
      .sort((a, b) => b.poblacionTotal - a.poblacionTotal)
      .slice(0, 10)
      .map(d => ({
        nombre: d.distrito || d.nombre || `Distrito ${d.codigoDistrito}`,
        espanoles: d.totalEspañoles || d.poblacionTotal - (d.totalExtranjeros || 0),
        extranjeros: d.totalExtranjeros || 0
      }));
  }, [distritosStats]);

  const datosGraficoEdad = useMemo(() => {
    if (!dashboard?.distribucionEdad) return [];
    return dashboard.distribucionEdad.map(g => ({
      name: ETIQUETAS_GRUPOS_EDAD[g.grupoEdad] || g.grupoEdad || g._id,
      value: g.totalPoblacion || g.total || g.count || 0
    }));
  }, [dashboard]);

  // Manejadores de eventos
  const manejarCambioFiltro = useCallback((nombre, valor) => {
    setFiltros(prev => {
      const nuevos = { ...prev, [nombre]: valor };
      // Resetear barrio si cambia distrito
      if (nombre === 'distrito') {
        nuevos.barrio = '';
      }
      return nuevos;
    });
    setPaginaActual(1);
  }, []);

  const limpiarFiltros = useCallback(() => {
    setFiltros({ distrito: '', barrio: '', grupoEdad: '', mes: '' });
    setPaginaActual(1);
  }, []);

  const manejarCambioPagina = useCallback((pagina) => {
    setPaginaActual(pagina);
  }, []);

  const manejarClickDistrito = useCallback((codigoDistrito) => {
    setDistritoDetalle(prev => prev === codigoDistrito ? null : codigoDistrito);
  }, []);

  // Estadisticas del dashboard
  const poblacionTotal = dashboard?.resumenGeneral?.poblacionTotal || 0;
  const porcentajeExtranjeros = dashboard?.resumenGeneral?.diversidad || 0;
  const ratioGenero = dashboard?.resumenGeneral?.ratioGenero || 0;
  const totalDistritos = dashboard?.resumenGeneral?.distritos || 0;

  // Opciones de distrito para filtros (desde estadisticas)
  const opcionesDistrito = useMemo(() => {
    if (!distritosStats?.districtStatistics) return [];
    return distritosStats.districtStatistics.map(d => ({
      value: String(d.codigoDistrito),
      label: d.distrito || d.nombre || `Distrito ${d.codigoDistrito}`
    }));
  }, [distritosStats]);

  // Detalle del distrito seleccionado
  const detalleDistritoData = useMemo(() => {
    if (!distritoDetalle || !distritosStats?.districtStatistics) return null;
    return distritosStats.districtStatistics.find(
      d => d.codigoDistrito === distritoDetalle
    );
  }, [distritoDetalle, distritosStats]);

  const hayFiltrosActivos = filtros.distrito || filtros.barrio || filtros.grupoEdad || filtros.mes;

  return (
    <PageLayout
      title="Censo Demografico"
      description="Datos poblacionales por distritos, barrios y grupos de edad - Anthem City 2051"
    >
      {/* Tarjetas de estadisticas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Poblacion Total"
          value={formatNumber(poblacionTotal)}
          icon={Users}
          isLoading={!dashboard}
        />
        <StatCard
          title="% Extranjeros"
          value={formatearPorcentaje(porcentajeExtranjeros)}
          icon={Globe}
          isLoading={!dashboard}
        />
        <StatCard
          title="Ratio H/M"
          value={ratioGenero ? ratioGenero.toFixed(2) : '-'}
          subtitle="Hombres por cada mujer"
          icon={UserCheck}
          isLoading={!dashboard}
        />
        <StatCard
          title="Distritos"
          value={totalDistritos}
          icon={MapPin}
          isLoading={!dashboard}
        />
      </div>

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
              options={opcionesDistrito}
              value={filtros.distrito}
              onChange={(e) => manejarCambioFiltro('distrito', e.target.value)}
              placeholder="Todos los distritos"
            />
            <Select
              options={opcionesGrupoEdad}
              value={filtros.grupoEdad}
              onChange={(e) => manejarCambioFiltro('grupoEdad', e.target.value)}
              placeholder="Todos los grupos de edad"
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
      {!isLoading && (datosGraficoDistritos.length > 0 || datosGraficoEdad.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {datosGraficoDistritos.length > 0 && (
            <BarChartCard
              title="Poblacion por distrito (Top 10)"
              data={datosGraficoDistritos}
              xKey="nombre"
              bars={[
                { key: 'espanoles', name: 'Espanoles', color: CHART_COLORS.primary },
                { key: 'extranjeros', name: 'Extranjeros', color: CHART_COLORS.tertiary }
              ]}
            />
          )}
          {datosGraficoEdad.length > 0 && (
            <PieChartCard
              title="Distribucion por grupo de edad"
              data={datosGraficoEdad}
            />
          )}
        </div>
      )}

      {/* Panel de detalle del distrito */}
      {detalleDistritoData && (
        <Card className="mb-6 border-cyan-500/30">
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-base">
                Detalle: {detalleDistritoData.distrito || `Distrito ${detalleDistritoData.codigoDistrito}`}
              </CardTitle>
              <div className="flex items-center gap-2">
                {/* Drill-down cross-domain: navega a la vista completa del distrito
                    que agrega censo + accidentes + patinetes + multas */}
                <Button asChild variant="outline" size="sm">
                  <Link to={ROUTES.DISTRITO_PATH(detalleDistritoData.codigoDistrito)}>
                    Ver vista completa
                    <ArrowRight className="size-4 ml-2" />
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setDistritoDetalle(null)}>
                  <X className="size-4" />
                </Button>
              </div>
            </div>
            <CardDescription>
              Indicadores demograficos del distrito. Pulsa &quot;Ver vista completa&quot;
              para acceder al perfil cross-domain (censo + accidentes + patinetes + multas).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">Poblacion</p>
                <p className="text-lg font-semibold text-white">{formatNumber(detalleDistritoData.poblacionTotal)}</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">% Extranjeros</p>
                <p className="text-lg font-semibold text-white">{formatearPorcentaje(detalleDistritoData.porcentajeExtranjeros)}</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">% Productiva</p>
                <p className="text-lg font-semibold text-white">{formatearPorcentaje(detalleDistritoData.porcentajeProductiva)}</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">% Tercera Edad</p>
                <p className="text-lg font-semibold text-white">{formatearPorcentaje(detalleDistritoData.porcentajeTerceraEdad)}</p>
              </div>
            </div>
            {detalleDistritoData.barrios && detalleDistritoData.barrios.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-foreground/80 mb-2">Desglose por barrios</h4>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Barrio</TableHead>
                        <TableHead className="text-right">Poblacion</TableHead>
                        <TableHead className="text-right">% Extranjeros</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {detalleDistritoData.barrios.map((barrio, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{barrio.nombre || barrio.descripcion || `Barrio ${barrio.codigo}`}</TableCell>
                          <TableCell className="text-right">{formatNumber(barrio.poblacionTotal || barrio.total)}</TableCell>
                          <TableCell className="text-right">{formatearPorcentaje(barrio.porcentajeExtranjeros)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tabla principal */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Registros Censales</CardTitle>
          <CardDescription>
            {paginacion
              ? `${formatNumber(paginacion.totalDocuments || paginacion.totalItems || 0)} registros encontrados`
              : 'Cargando...'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <TableSkeleton rows={6} columns={6} />
          ) : error ? (
            <ErrorState
              message="Error al cargar datos del censo"
              onRetry={() => refetch()}
            />
          ) : datos.length === 0 ? (
            <EmptyState message="No se encontraron registros con los filtros seleccionados" />
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table label="Datos del censo demografico" rowCount={paginacion?.totalDocuments}>
                  <TableCaption>Datos del censo demografico - Anthem City {DATE_CONFIG.DATASET_YEAR}</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Distrito</TableHead>
                      <TableHead>Barrio</TableHead>
                      <TableHead className="text-right">Pob. Total</TableHead>
                      <TableHead className="text-right">Espanoles</TableHead>
                      <TableHead className="text-right">Extranjeros</TableHead>
                      <TableHead className="text-right">% Extr.</TableHead>
                      <TableHead>Grupo Edad</TableHead>
                      <TableHead className="text-right">Edad</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {datos.map((registro, index) => {
                      const stats = registro.estadisticas || {};
                      const grupoEdad = registro.clasificacionEdad?.grupoEdad;
                      const codigoDistrito = registro.distrito?.codigo;

                      return (
                        <TableRow
                          key={registro._id || index}
                          className="cursor-pointer hover:bg-muted/60"
                          onClick={() => manejarClickDistrito(codigoDistrito)}
                        >
                          <TableCell className="font-medium">
                            {registro.distrito?.descripcion || '-'}
                          </TableCell>
                          <TableCell>{registro.barrio?.descripcion || '-'}</TableCell>
                          <TableCell className="text-right">{formatNumber(stats.totalPoblacion)}</TableCell>
                          <TableCell className="text-right">{formatNumber(stats.totalEspañoles)}</TableCell>
                          <TableCell className="text-right">{formatNumber(stats.totalExtranjeros)}</TableCell>
                          <TableCell className="text-right">
                            {formatearPorcentaje(stats.porcentajeExtranjeros)}
                          </TableCell>
                          <TableCell>
                            {grupoEdad && (
                              <Badge variant={obtenerVarianteBadgeEdad(grupoEdad)}>
                                {ETIQUETAS_GRUPOS_EDAD[grupoEdad] || grupoEdad}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">{registro.edad}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Paginacion */}
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

export default PaginaCenso;
