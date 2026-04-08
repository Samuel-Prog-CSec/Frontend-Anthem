/**
 * Pagina de Disponibilidad de Bicicletas
 *
 * Dashboard con datos diarios de uso de bicicletas (abonados, usos, ocupacion)
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Bike, Filter, RefreshCw, TrendingUp, Clock, BarChart3, ArrowUp, ArrowDown, Users, UserCheck } from 'lucide-react';
import { PageLayout } from '../../components/layout';
import {
  Card, CardHeader, CardTitle, CardContent, CardDescription,
  Button, Select, Badge,
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
  LoadingState, ErrorState, EmptyState, Pagination
} from '../../components/common';
import { StatCard, LineChartCard } from '../../components/charts';
import {
  obtenerDisponibilidad, obtenerEstadisticas, obtenerTendenciasMensuales,
  obtenerMayorUso, obtenerComparativaSuscripciones
} from '../../api/servicioBicicletas';
import { PAGINATION, DATE_CONFIG } from '../../constants';
import { formatDate, formatNumber } from '../../utils';

// Meses para selector
const monthOptions = [
  { value: '1', label: 'Enero' },
  { value: '2', label: 'Febrero' },
  { value: '3', label: 'Marzo' },
  { value: '4', label: 'Abril' },
  { value: '5', label: 'Mayo' },
  { value: '6', label: 'Junio' },
  { value: '7', label: 'Julio' },
  { value: '8', label: 'Agosto' },
  { value: '9', label: 'Septiembre' },
  { value: '10', label: 'Octubre' },
  { value: '11', label: 'Noviembre' },
  { value: '12', label: 'Diciembre' }
];

/**
 * Determina la variante del badge segun la tasa de ocupacion
 * @param {number} value - Tasa de ocupacion en porcentaje
 * @returns {string} Variante del badge
 */
function getOccupancyBadge(value) {
  if (value == null) return 'secondary';
  if (value < 30) return 'success';
  if (value < 60) return 'info';
  if (value < 80) return 'warning';
  return 'destructive';
}

/**
 * Pagina de disponibilidad de bicicletas
 */
function PaginaBicicletas() {
  const [datosDisponibilidad, setDatosDisponibilidad] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);
  const [tendenciasMensuales, setTendenciasMensuales] = useState([]);
  const [datosMayorUso, setDatosMayorUso] = useState(null);
  const [comparativaSuscripciones, setComparativaSuscripciones] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [filtros, setFiltros] = useState({ mes: '' });
  const [paginacionDisponibilidad, setPaginacionDisponibilidad] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: PAGINATION.BIKES_DEFAULT_LIMIT
  });

  // Cargar datos de disponibilidad
  const cargarDatosDisponibilidad = useCallback(async () => {
    setCargando(true);
    setError(null);

    try {
      const params = {
        page: paginacionDisponibilidad.currentPage,
        limit: paginacionDisponibilidad.itemsPerPage,
        año: DATE_CONFIG.DATASET_YEAR
      };

      if (filtros.mes) {
        params.mes = parseInt(filtros.mes);
      }

      const statsParams = { año: DATE_CONFIG.DATASET_YEAR };
      if (filtros.mes) {
        statsParams.mes = parseInt(filtros.mes);
      }

      const [availabilityRes, statsRes, trendsRes, mayorUsoRes, comparativaRes] = await Promise.all([
        obtenerDisponibilidad(params),
        obtenerEstadisticas(statsParams),
        obtenerTendenciasMensuales({ year: DATE_CONFIG.DATASET_YEAR }),
        obtenerMayorUso(),
        obtenerComparativaSuscripciones()
      ]);

      if (availabilityRes.success) {
        setDatosDisponibilidad(availabilityRes.data || []);
        setPaginacionDisponibilidad(prev => ({
          ...prev,
          totalPages: availabilityRes.pagination?.totalPages || 1,
          totalItems: availabilityRes.pagination?.totalDocuments || availabilityRes.pagination?.totalItems || 0
        }));
      } else {
        setError(availabilityRes.message);
      }

      if (statsRes.success) {
        setEstadisticas(statsRes.data || null);
      }

      if (trendsRes.success) {
        setTendenciasMensuales(trendsRes.data || []);
      }

      if (mayorUsoRes.success) {
        setDatosMayorUso(mayorUsoRes.data || null);
      }

      if (comparativaRes.success) {
        setComparativaSuscripciones(comparativaRes.data || null);
      }
    } catch (err) {
      setError(err.message || 'Error al cargar datos de disponibilidad de bicicletas');
    } finally {
      setCargando(false);
    }
  }, [paginacionDisponibilidad.currentPage, paginacionDisponibilidad.itemsPerPage, filtros]);

  // Ejecutar la funcion de carga
  useEffect(() => {
    cargarDatosDisponibilidad();
  }, [cargarDatosDisponibilidad]);

  // Refrescar datos
  const handleRefresh = () => {
    cargarDatosDisponibilidad();
  };

  // Cambiar pagina
  const manejarCambioPagina = (page) => {
    setPaginacionDisponibilidad(prev => ({ ...prev, currentPage: page }));
  };

  // Cambiar filtros
  const manejarCambioFiltro = (name, value) => {
    setFiltros(prev => ({ ...prev, [name]: value }));
    setPaginacionDisponibilidad(prev => ({ ...prev, currentPage: 1 }));
  };

  // Limpiar filtros
  const limpiarFiltros = () => {
    setFiltros({ mes: '' });
    setPaginacionDisponibilidad(prev => ({ ...prev, currentPage: 1 }));
  };

  // Estadisticas computadas para las tarjetas
  const computedStats = useMemo(() => {
    const promedioUsosDiarios = estadisticas?.promedioTotalUsos
      || (datosDisponibilidad.length > 0
        ? datosDisponibilidad.reduce((sum, d) => sum + (d.totalUsos || 0), 0) / datosDisponibilidad.length
        : 0);

    const mediaBicisDisponibles = estadisticas?.promedioMediaBicicletas || 0;
    const tasaOcupacion = estadisticas?.promedioTasaOcupacion || 0;
    const totalRegistros = paginacionDisponibilidad.totalItems;

    return {
      promedioUsosDiarios,
      mediaBicisDisponibles,
      tasaOcupacion,
      totalRegistros
    };
  }, [estadisticas, datosDisponibilidad, paginacionDisponibilidad.totalItems]);

  // Preparar datos para grafico de tendencias mensuales
  const trendChartData = useMemo(() => {
    if (!tendenciasMensuales || tendenciasMensuales.length === 0) return [];

    const monthNames = [
      'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
      'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
    ];

    return tendenciasMensuales.map(item => ({
      mes: monthNames[item._id - 1] || `Mes ${item._id}`,
      totalUsos: item.totalUsos || 0,
      usosAnual: item.usosAnual || 0,
      usosOcasional: item.usosOcasional || 0
    }));
  }, [tendenciasMensuales]);

  return (
    <PageLayout
      title="Bicicletas"
      description={`Disponibilidad de bicicletas - ${DATE_CONFIG.DATASET_YEAR}`}
      actions={
        <Button variant="outline" onClick={handleRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualizar
        </Button>
      }
    >
      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Promedio Usos Diarios"
          value={formatNumber(computedStats.promedioUsosDiarios, 0)}
          icon={TrendingUp}
        />
        <StatCard
          title="Media Bicis Disponibles"
          value={formatNumber(computedStats.mediaBicisDisponibles, 1)}
          icon={Bike}
        />
        <StatCard
          title="Tasa Ocupacion"
          value={`${formatNumber(computedStats.tasaOcupacion, 1)}%`}
          icon={Clock}
        />
        <StatCard
          title="Total Registros"
          value={formatNumber(computedStats.totalRegistros)}
          icon={BarChart3}
        />
      </div>

      {/* Filtros */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="filtro-mes-bicicletas" className="text-sm text-slate-400 mb-1 block">Mes</label>
              <Select
                id="filtro-mes-bicicletas"
                value={filtros.mes}
                onChange={(e) => manejarCambioFiltro('mes', e.target.value)}
                options={monthOptions}
                placeholder="Todos los meses"
              />
            </div>
            <div className="flex items-end">
              <Button variant="ghost" onClick={limpiarFiltros}>
                Limpiar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Graficos de disponibilidad */}
      {!cargando && trendChartData.length > 0 && (
        <div className="mb-6">
          <LineChartCard
            title="Tendencias Mensuales de Uso"
            data={trendChartData}
            xKey="mes"
            lines={[
              { key: 'totalUsos', name: 'Total Usos', color: '#06b6d4' },
              { key: 'usosAnual', name: 'Usos Anual', color: '#10b981' },
              { key: 'usosOcasional', name: 'Usos Ocasional', color: '#f59e0b' }
            ]}
            height={280}
          />
        </div>
      )}

      {/* Comparativa de suscripciones */}
      {!cargando && comparativaSuscripciones?.comparativa && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5" />
              Comparativa de Suscripciones
            </CardTitle>
            <CardDescription>
              Uso del servicio por tipo de suscripcion
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <StatCard
                title="Suscriptores Anuales"
                value={formatNumber(comparativaSuscripciones.comparativa.anual?.totalUsos || 0)}
                subtitle={`Promedio diario: ${formatNumber(comparativaSuscripciones.comparativa.anual?.promedioDiario || 0, 1)}`}
                icon={UserCheck}
              />
              <StatCard
                title="Usuarios Ocasionales"
                value={formatNumber(comparativaSuscripciones.comparativa.ocasional?.totalUsos || 0)}
                subtitle={`Promedio diario: ${formatNumber(comparativaSuscripciones.comparativa.ocasional?.promedioDiario || 0, 1)}`}
                icon={Users}
              />
            </div>
            {comparativaSuscripciones.distribucion && (
              <div className="mt-4 flex items-center gap-4 text-sm text-slate-400">
                <span>Distribucion: Anual {formatNumber(comparativaSuscripciones.distribucion.porcentajeAnual || 0, 1)}%</span>
                <span>|</span>
                <span>Ocasional {formatNumber(comparativaSuscripciones.distribucion.porcentajeOcasional || 0, 1)}%</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Dias de mayor y menor uso */}
      {!cargando && datosMayorUso && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Top dias de mayor uso */}
          {datosMayorUso.diasMayorUso?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <ArrowUp className="h-5 w-5 text-emerald-400" />
                  Top Dias de Mayor Uso
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Dia</TableHead>
                      <TableHead className="text-right">Total Usos</TableHead>
                      <TableHead className="text-right">Usos Anual</TableHead>
                      <TableHead className="text-right">Usos Ocasional</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {datosMayorUso.diasMayorUso.map((item, index) => (
                      <TableRow key={`mayor-${index}`}>
                        <TableCell>{formatDate(item.dia)}</TableCell>
                        <TableCell className="text-right font-medium">{formatNumber(item.totalUsos)}</TableCell>
                        <TableCell className="text-right">{formatNumber(item.usosAnual || item.usosAbonadoAnual)}</TableCell>
                        <TableCell className="text-right">{formatNumber(item.usosOcasional || item.usosAbonadoOcasional)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Top dias de menor uso */}
          {datosMayorUso.diasMenorUso?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <ArrowDown className="h-5 w-5 text-red-400" />
                  Top Dias de Menor Uso
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Dia</TableHead>
                      <TableHead className="text-right">Total Usos</TableHead>
                      <TableHead className="text-right">Usos Anual</TableHead>
                      <TableHead className="text-right">Usos Ocasional</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {datosMayorUso.diasMenorUso.map((item, index) => (
                      <TableRow key={`menor-${index}`}>
                        <TableCell>{formatDate(item.dia)}</TableCell>
                        <TableCell className="text-right font-medium">{formatNumber(item.totalUsos)}</TableCell>
                        <TableCell className="text-right">{formatNumber(item.usosAnual || item.usosAbonadoAnual)}</TableCell>
                        <TableCell className="text-right">{formatNumber(item.usosOcasional || item.usosAbonadoOcasional)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Tabla de disponibilidad */}
      <Card>
          <CardHeader>
            <CardTitle>Disponibilidad de Bicicletas</CardTitle>
            <CardDescription>
              Datos diarios de uso y disponibilidad del servicio de bicicletas
            </CardDescription>
          </CardHeader>
          <CardContent>
            {cargando ? (
              <LoadingState message="Cargando datos de disponibilidad..." />
            ) : error ? (
              <ErrorState
                message={error}
                onRetry={cargarDatosDisponibilidad}
              />
            ) : datosDisponibilidad.length === 0 ? (
              <EmptyState
                title="Sin datos de disponibilidad"
                description="No se encontraron registros con los filtros seleccionados."
                icon={Bike}
              />
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Dia</TableHead>
                      <TableHead>Horas Uso</TableHead>
                      <TableHead>Horas Disponibilidad</TableHead>
                      <TableHead>Media Bicis</TableHead>
                      <TableHead>Usos Anual</TableHead>
                      <TableHead>Usos Ocasional</TableHead>
                      <TableHead>Total Usos</TableHead>
                      <TableHead>Tasa Ocupacion</TableHead>
                      <TableHead>Usos/Bici</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {datosDisponibilidad.map(item => (
                      <TableRow key={item._id}>
                        <TableCell>{formatDate(item.dia)}</TableCell>
                        <TableCell>{formatNumber(item.horasTotalesUsosBicicletas, 1)}</TableCell>
                        <TableCell>{formatNumber(item.horasTotalesDisponibilidadBicicletasEnAnclajes, 1)}</TableCell>
                        <TableCell>{formatNumber(item.mediaBicicletasDisponibles, 1)}</TableCell>
                        <TableCell>{formatNumber(item.usosAbonadoAnual)}</TableCell>
                        <TableCell>{formatNumber(item.usosAbonadoOcasional)}</TableCell>
                        <TableCell className="font-medium">{formatNumber(item.totalUsos)}</TableCell>
                        <TableCell>
                          <Badge variant={getOccupancyBadge(item.tasaOcupacion)}>
                            {item.tasaOcupacion?.toFixed(1)}%
                          </Badge>
                        </TableCell>
                        <TableCell>{item.promedioUsosPorBicicleta?.toFixed(2) || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Paginacion */}
                <Pagination
                  currentPage={paginacionDisponibilidad.currentPage}
                  totalPages={paginacionDisponibilidad.totalPages}
                  totalItems={paginacionDisponibilidad.totalItems}
                  itemsPerPage={paginacionDisponibilidad.itemsPerPage}
                  onPageChange={manejarCambioPagina}
                />
              </>
            )}
          </CardContent>
        </Card>

    </PageLayout>
  );
}

export default PaginaBicicletas;
