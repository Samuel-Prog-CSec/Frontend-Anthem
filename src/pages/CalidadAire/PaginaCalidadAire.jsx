/**
 * Pagina de Calidad del Aire
 *
 * Visualizacion de datos de calidad del aire:
 * - Mediciones por estacion
 * - Niveles de contaminantes
 * - Tendencias temporales
 */

import { useState, useMemo } from 'react';
import { Wind, Filter, RefreshCw, Activity, TrendingUp, BarChart3, AlertTriangle } from 'lucide-react';
import { PageLayout } from '../../components/layout';
import {
  Card, CardHeader, CardTitle, CardContent, CardDescription,
  Button, Select, Badge,
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
  LoadingState, ErrorState, EmptyState, Pagination,
  TableSkeleton, ChartSkeleton
} from '../../components/common';
import { StatCard, BarChartCard, LineChartCard } from '../../components/charts';
import { useCalidadAire, useCalidadAireStats, useCalidadAireTendencias } from '../../api/hooks';
import { AIR_QUALITY_MAGNITUDES, AIR_QUALITY_LEVELS, PAGINATION, DATE_CONFIG, CHART_LIMITS } from '../../constants';
import { formatDate, formatNumber } from '../../utils';

// Opciones de magnitudes para el selector
const opcionesMagnitud = Object.entries(AIR_QUALITY_MAGNITUDES).map(([value, label]) => ({
  value,
  label
}));

// Meses para selector
const opcionesMes = [
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
 * Calcula el promedio de mediciones validas de un registro
 * @param {Map|Object} mediciones - Mediciones horarias
 * @returns {number|null} Promedio o null si no hay datos
 */
function calcularPromedioDiario(mediciones) {
  if (!mediciones) return null;

  const entries = mediciones instanceof Map
    ? Array.from(mediciones.values())
    : Object.values(mediciones);

  const validValues = entries
    .filter(m => m && m.validationCode === 'V' && m.value != null)
    .map(m => m.value);

  if (validValues.length === 0) return null;

  return validValues.reduce((sum, val) => sum + val, 0) / validValues.length;
}

/**
 * Determina el nivel de calidad del aire basado en el valor
 * Umbrales basados en el Indice de Calidad del Aire (AQI)
 * @param {number} value - Valor de la medicion
 * @returns {Object} Nivel con label y variant para Badge
 */
function obtenerNivelCalidadAire(value) {
  if (value == null) return { label: 'Sin datos', variant: 'secondary' };
  if (value <= 50) return { label: 'Buena', variant: 'success' };
  if (value <= 100) return { label: 'Moderada', variant: 'warning' };
  if (value <= 150) return { label: 'Dañina (sensibles)', variant: 'warning' };
  if (value <= 200) return { label: 'Dañina', variant: 'destructive' };
  if (value <= 300) return { label: 'Muy dañina', variant: 'destructive' };
  return { label: 'Peligrosa', variant: 'destructive' };
}

/**
 * Pagina de calidad del aire
 */
function PaginaCalidadAire() {
  const [filtros, setFiltros] = useState({
    magnitud: '',
    mes: ''
  });
  const [paginaActual, setPaginaActual] = useState(1);
  const [magnitudTendencia, setMagnitudTendencia] = useState('');
  const elementosPorPagina = PAGINATION.DEFAULT_LIMIT;

  // Parametros de consulta derivados del estado
  const parametrosConsulta = useMemo(() => {
    const params = {
      page: paginaActual,
      limit: elementosPorPagina
    };

    if (filtros.magnitud) {
      params.magnitud = parseInt(filtros.magnitud);
    }

    if (filtros.mes) {
      const year = DATE_CONFIG.DATASET_YEAR;
      const month = parseInt(filtros.mes);
      params.startDate = new Date(year, month - 1, 1).toISOString();
      params.endDate = new Date(year, month, 0).toISOString();
    }

    return params;
  }, [paginaActual, elementosPorPagina, filtros.magnitud, filtros.mes]);

  // React Query: datos de calidad del aire
  const {
    data: airData,
    isLoading,
    error,
    refetch
  } = useCalidadAire(parametrosConsulta);

  // React Query: estadisticas globales de calidad del aire (desde API)
  const { data: statsApi, isLoading: cargandoStats } = useCalidadAireStats();

  // Parametros para tendencias: solo se cargan cuando el usuario selecciona una magnitud
  const parametrosTendencia = useMemo(() => {
    if (!magnitudTendencia) return null;
    return { magnitud: parseInt(magnitudTendencia) };
  }, [magnitudTendencia]);

  // React Query: tendencias de calidad del aire
  const { data: tendenciasApi, isLoading: cargandoTendencias } = useCalidadAireTendencias(
    parametrosTendencia,
    { enabled: !!parametrosTendencia }
  );

  // Memoizamos para mantener referencia estable y no invalidar useMemos
  // que dependen de `data` cuando airData es undefined entre renders
  const data = useMemo(() => airData?.data || [], [airData?.data]);
  const pagination = airData?.pagination || {};

  // Cambiar filtros
  const manejarCambioFiltro = (name, value) => {
    setFiltros(prev => ({ ...prev, [name]: value }));
    setPaginaActual(1);
  };

  // Limpiar filtros
  const limpiarFiltros = () => {
    setFiltros({ magnitud: '', mes: '' });
    setPaginaActual(1);
  };

  // Calcular estadisticas de los datos cargados
  const estadisticas = useMemo(() => {
    if (data.length === 0) return { avg: 0, max: 0, min: 0, valid: 0 };

    const averages = data
      .map(d => calcularPromedioDiario(d.medicionesHorarias))
      .filter(v => v != null);

    if (averages.length === 0) return { avg: 0, max: 0, min: 0, valid: 0 };

    return {
      avg: averages.reduce((sum, v) => sum + v, 0) / averages.length,
      max: Math.max(...averages),
      min: Math.min(...averages),
      valid: averages.length
    };
  }, [data]);

  // Extraer estadisticas de la respuesta de la API
  const estadisticasApi = useMemo(() => {
    const apiData = statsApi?.data?.data || statsApi?.data || null;
    if (!apiData) return null;

    // La respuesta puede tener estructura variada segun el backend
    // Intentar extraer los campos mas comunes
    if (Array.isArray(apiData) && apiData.length > 0) {
      const primer = apiData[0];
      return {
        totalRegistros: primer.totalRegistros || primer.totalMediciones || 0,
        promedio: primer.promedioGeneral || primer.promedio || primer.avgValue || 0,
        maximo: primer.valorMaximo || primer.maximo || primer.maxValue || 0,
        minimo: primer.valorMinimo || primer.minimo || primer.minValue || 0,
        medicionesValidas: primer.medicionesValidas || primer.validCount || 0,
        diasConExcedencias: primer.diasConExcedencias || primer.exceedanceDays || 0
      };
    }

    return {
      totalRegistros: apiData.totalRegistros || apiData.totalMediciones || 0,
      promedio: apiData.promedioGeneral || apiData.promedio || apiData.avgValue || 0,
      maximo: apiData.valorMaximo || apiData.maximo || apiData.maxValue || 0,
      minimo: apiData.valorMinimo || apiData.minimo || apiData.minValue || 0,
      medicionesValidas: apiData.medicionesValidas || apiData.validCount || 0,
      diasConExcedencias: apiData.diasConExcedencias || apiData.exceedanceDays || 0
    };
  }, [statsApi]);

  // Preparar datos para grafico
  const datosGrafico = useMemo(() => {
    return data.slice(0, CHART_LIMITS.MAX_ITEMS).map(d => ({
      fecha: formatDate(d.fecha, 'short'),
      promedio: calcularPromedioDiario(d.medicionesHorarias)?.toFixed(1) || 0
    })).reverse();
  }, [data]);

  // Preparar datos para grafico de tendencias (desde API)
  const datosTendencia = useMemo(() => {
    const trendData = tendenciasApi?.data?.data || tendenciasApi?.data || [];
    if (!Array.isArray(trendData) || trendData.length === 0) return [];

    return trendData.slice(0, 30).map(d => ({
      periodo: d.periodo || d.fecha || d.month || d._id || '-',
      promedio: d.promedio != null ? Number(d.promedio.toFixed(2)) : (d.avgValue != null ? Number(d.avgValue.toFixed(2)) : 0),
      maximo: d.maximo != null ? Number(d.maximo.toFixed(2)) : (d.maxValue != null ? Number(d.maxValue.toFixed(2)) : 0),
      minimo: d.minimo != null ? Number(d.minimo.toFixed(2)) : (d.minValue != null ? Number(d.minValue.toFixed(2)) : 0)
    }));
  }, [tendenciasApi]);

  return (
    <PageLayout
      title="Calidad del Aire"
      description={`Monitoreo de contaminantes atmosfericos - ${DATE_CONFIG.DATASET_YEAR}`}
      actions={
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualizar
        </Button>
      }
    >
      {/* Tarjetas de resumen - usa estadisticas de la API si estan disponibles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total Mediciones"
          value={estadisticasApi?.totalRegistros
            ? formatNumber(estadisticasApi.totalRegistros)
            : (pagination.totalDocuments ?? '-')}
          subtitle={cargandoStats ? 'Cargando...' : undefined}
          icon={Activity}
        />
        <StatCard
          title="Promedio General"
          value={estadisticasApi?.promedio
            ? `${formatNumber(estadisticasApi.promedio, 1)} ug/m3`
            : `${formatNumber(estadisticas.avg, 1)} ug/m3`}
          subtitle={estadisticasApi ? 'todas las estaciones' : 'en pagina actual'}
          icon={Wind}
        />
        <StatCard
          title="Valor Maximo"
          value={estadisticasApi?.maximo
            ? `${formatNumber(estadisticasApi.maximo, 1)} ug/m3`
            : `${formatNumber(estadisticas.max, 1)} ug/m3`}
          subtitle={estadisticasApi ? 'registrado' : 'en pagina actual'}
          icon={TrendingUp}
        />
        <StatCard
          title={estadisticasApi?.diasConExcedencias != null ? 'Dias con Excedencias' : 'Datos Validos'}
          value={estadisticasApi?.diasConExcedencias != null
            ? formatNumber(estadisticasApi.diasConExcedencias)
            : (estadisticasApi?.medicionesValidas
              ? formatNumber(estadisticasApi.medicionesValidas)
              : estadisticas.valid)}
          subtitle={estadisticasApi?.diasConExcedencias != null ? 'sobre limite' : 'en pagina actual'}
          icon={estadisticasApi?.diasConExcedencias != null ? AlertTriangle : BarChart3}
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
              <label className="text-sm text-slate-400 mb-1 block">Contaminante</label>
              <Select
                value={filtros.magnitud}
                onChange={(e) => manejarCambioFiltro('magnitud', e.target.value)}
                options={opcionesMagnitud}
                placeholder="Seleccionar contaminante"
              />
            </div>
            <div className="flex-1">
              <label className="text-sm text-slate-400 mb-1 block">Mes</label>
              <Select
                value={filtros.mes}
                onChange={(e) => manejarCambioFiltro('mes', e.target.value)}
                options={opcionesMes}
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

      {/* Grafico de tendencia (datos de la pagina actual) */}
      {!isLoading && data.length > 0 && (
        <div className="mb-6">
          <BarChartCard
            title={`Tendencia - ${AIR_QUALITY_MAGNITUDES[filtros.magnitud] || 'Contaminante'}`}
            data={datosGrafico}
            xKey="fecha"
            bars={[{ key: 'promedio', name: 'Promedio diario (ug/m3)', color: '#06b6d4' }]}
            height={250}
          />
        </div>
      )}

      {/* Tendencias desde API - selector de magnitud y grafico de lineas */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Tendencias por Contaminante
          </CardTitle>
          <CardDescription>
            Seleccione un contaminante para visualizar su evolucion temporal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 max-w-sm">
            <label className="text-sm text-slate-400 mb-1 block">Contaminante para tendencia</label>
            <Select
              value={magnitudTendencia}
              onChange={(e) => setMagnitudTendencia(e.target.value)}
              options={opcionesMagnitud}
              placeholder="Seleccionar contaminante"
            />
          </div>

          {cargandoTendencias && (
            <ChartSkeleton height={300} />
          )}

          {!cargandoTendencias && magnitudTendencia && datosTendencia.length > 0 && (
            <LineChartCard
              title={`Evolucion - ${AIR_QUALITY_MAGNITUDES[magnitudTendencia] || 'Contaminante'}`}
              data={datosTendencia}
              xKey="periodo"
              lines={[
                { key: 'promedio', name: 'Promedio (ug/m3)', color: '#06b6d4' },
                { key: 'maximo', name: 'Maximo (ug/m3)', color: '#ef4444' },
                { key: 'minimo', name: 'Minimo (ug/m3)', color: '#10b981' }
              ]}
              height={300}
            />
          )}

          {!cargandoTendencias && magnitudTendencia && datosTendencia.length === 0 && (
            <EmptyState
              title="Sin datos de tendencia"
              description="No se encontraron datos de tendencia para el contaminante seleccionado."
              icon={TrendingUp}
            />
          )}

          {!magnitudTendencia && (
            <p className="text-sm text-slate-500 text-center py-8">
              Seleccione un contaminante para ver la tendencia
            </p>
          )}
        </CardContent>
      </Card>

      {/* Tabla de datos */}
      <Card>
        <CardHeader>
          <CardTitle>Mediciones de Calidad del Aire</CardTitle>
          <CardDescription>
            {AIR_QUALITY_MAGNITUDES[filtros.magnitud] || 'Todos los contaminantes'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <TableSkeleton rows={6} columns={6} />
          ) : error ? (
            <ErrorState
              message={error.message || 'Error al cargar datos de calidad del aire'}
              onRetry={() => refetch()}
            />
          ) : data.length === 0 ? (
            <EmptyState
              title="Sin mediciones"
              description="No se encontraron mediciones con los filtros seleccionados."
              icon={Wind}
            />
          ) : (
            <>
              <Table
                label="Mediciones de calidad del aire"
                rowCount={pagination?.totalDocuments}
                colCount={5}
              >
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Estacion</TableHead>
                    <TableHead>Contaminante</TableHead>
                    <TableHead className="text-right">Promedio</TableHead>
                    <TableHead>Calidad</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((record) => {
                    const avg = calcularPromedioDiario(record.medicionesHorarias);
                    const level = obtenerNivelCalidadAire(avg);

                    return (
                      <TableRow key={record._id}>
                        <TableCell className="font-medium">
                          {formatDate(record.fecha)}
                        </TableCell>
                        <TableCell>
                          {record.estacion || record.puntoMuestreo}
                        </TableCell>
                        <TableCell className="text-slate-400">
                          {AIR_QUALITY_MAGNITUDES[record.magnitud] || `Magnitud ${record.magnitud}`}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {avg != null ? `${formatNumber(avg, 2)} ug/m3` : '-'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={level.variant}>
                            {level.label}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {/* Paginacion */}
              <Pagination
                currentPage={paginaActual}
                totalPages={pagination.totalPages || 1}
                totalItems={pagination.totalDocuments || 0}
                itemsPerPage={elementosPorPagina}
                onPageChange={setPaginaActual}
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* Leyenda de calidad */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Niveles de Calidad del Aire</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {Object.entries(AIR_QUALITY_LEVELS).map(([key, level]) => (
              <div key={key} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: level.color }}
                />
                <span className="text-sm text-slate-300">{level.label}</span>
                <span className="text-xs text-slate-500">({level.range})</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </PageLayout>
  );
}

export default PaginaCalidadAire;
