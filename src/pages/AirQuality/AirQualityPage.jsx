/**
 * Pagina de Calidad del Aire
 * 
 * Visualizacion de datos de calidad del aire:
 * - Mediciones por estacion
 * - Niveles de contaminantes
 * - Tendencias temporales
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Wind, Filter, RefreshCw, Calendar, Activity, AlertTriangle, TrendingUp } from 'lucide-react';
import { PageLayout } from '../../components/layout';
import { 
  Card, CardHeader, CardTitle, CardContent, CardDescription,
  Button, Select, Badge,
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
  LoadingState, ErrorState, EmptyState, Pagination, Input
} from '../../components/common';
import { StatCard, BarChartCard } from '../../components/charts';
import { getAirQualityData } from '../../api/airQualityService';
import { AIR_QUALITY_MAGNITUDES, AIR_QUALITY_LEVELS, PAGINATION, DATE_CONFIG } from '../../constants';
import { formatDate, formatNumber } from '../../utils';

// Opciones de magnitudes para el selector
const magnitudeOptions = Object.entries(AIR_QUALITY_MAGNITUDES).map(([value, label]) => ({
  value,
  label
}));

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
 * Calcula el promedio de mediciones validas de un registro
 * @param {Map|Object} mediciones - Mediciones horarias
 * @returns {number|null} Promedio o null si no hay datos
 */
function calculateDailyAverage(mediciones) {
  if (!mediciones) return null;
  
  // Convertir Map a array si es necesario
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
 * @param {number} value - Valor de la medicion
 * @returns {Object} Nivel con label y color
 */
function getAirQualityLevel(value) {
  if (value == null) return { label: 'Sin datos', variant: 'secondary' };
  
  // Simplificado: umbrales genericos (en produccion usar umbrales especificos por magnitud)
  if (value <= 50) return { label: 'Buena', variant: 'success' };
  if (value <= 100) return { label: 'Moderada', variant: 'warning' };
  if (value <= 150) return { label: 'Danina (sensibles)', variant: 'warning' };
  if (value <= 200) return { label: 'Danina', variant: 'destructive' };
  return { label: 'Muy danina', variant: 'destructive' };
}

/**
 * Pagina de calidad del aire
 */
function AirQualityPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    magnitud: '', // Sin filtro por defecto
    mes: ''
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: PAGINATION.DEFAULT_LIMIT
  });

  // Cargar datos
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = {
        page: pagination.currentPage,
        limit: pagination.itemsPerPage
      };
      
      if (filters.magnitud) {
        params.magnitud = parseInt(filters.magnitud);
      }
      
      // Filtrar por mes si esta seleccionado
      if (filters.mes) {
        const year = DATE_CONFIG.DATASET_YEAR;
        const month = parseInt(filters.mes);
        params.startDate = new Date(year, month - 1, 1).toISOString();
        params.endDate = new Date(year, month, 0).toISOString();
      }
      
      const response = await getAirQualityData(params);
      
      if (response.success) {
        setData(response.data || []);
        setPagination(prev => ({
          ...prev,
          totalPages: response.pagination?.totalPages || 1,
          totalItems: response.pagination?.totalDocuments || 0
        }));
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError(err.message || 'Error al cargar datos de calidad del aire');
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, pagination.itemsPerPage, filters.magnitud, filters.mes]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Cambiar pagina
  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  // Cambiar filtros
  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  // Limpiar filtros
  const handleClearFilters = () => {
    setFilters({ magnitud: '', mes: '' });
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  // Calcular estadisticas de los datos cargados
  const stats = useMemo(() => {
    if (data.length === 0) return { avg: 0, max: 0, min: 0, valid: 0 };
    
    const averages = data
      .map(d => calculateDailyAverage(d.medicionesHorarias))
      .filter(v => v != null);
    
    if (averages.length === 0) return { avg: 0, max: 0, min: 0, valid: 0 };
    
    return {
      avg: averages.reduce((sum, v) => sum + v, 0) / averages.length,
      max: Math.max(...averages),
      min: Math.min(...averages),
      valid: averages.length
    };
  }, [data]);

  // Preparar datos para grafico
  const chartData = useMemo(() => {
    return data.slice(0, 10).map(d => ({
      fecha: formatDate(d.fecha, 'short'),
      promedio: calculateDailyAverage(d.medicionesHorarias)?.toFixed(1) || 0
    })).reverse();
  }, [data]);

  return (
    <PageLayout
      title="Calidad del Aire"
      description={`Monitoreo de contaminantes atmosfericos - ${DATE_CONFIG.DATASET_YEAR}`}
      actions={
        <Button variant="outline" onClick={fetchData}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualizar
        </Button>
      }
    >
      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total Mediciones"
          value={pagination.totalItems}
          icon={Activity}
        />
        <StatCard
          title="Promedio"
          value={`${formatNumber(stats.avg, 1)} ug/m3`}
          icon={Wind}
        />
        <StatCard
          title="Valor Maximo"
          value={`${formatNumber(stats.max, 1)} ug/m3`}
          icon={TrendingUp}
        />
        <StatCard
          title="Datos Validos"
          value={stats.valid}
          subtitle="en pagina actual"
          icon={Activity}
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
                value={filters.magnitud}
                onChange={(e) => handleFilterChange('magnitud', e.target.value)}
                options={magnitudeOptions}
                placeholder="Seleccionar contaminante"
              />
            </div>
            <div className="flex-1">
              <label className="text-sm text-slate-400 mb-1 block">Mes</label>
              <Select
                value={filters.mes}
                onChange={(e) => handleFilterChange('mes', e.target.value)}
                options={monthOptions}
                placeholder="Todos los meses"
              />
            </div>
            <div className="flex items-end">
              <Button variant="ghost" onClick={handleClearFilters}>
                Limpiar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grafico de tendencia */}
      {!loading && data.length > 0 && (
        <div className="mb-6">
          <BarChartCard
            title={`Tendencia - ${AIR_QUALITY_MAGNITUDES[filters.magnitud] || 'Contaminante'}`}
            data={chartData}
            xKey="fecha"
            bars={[{ key: 'promedio', name: 'Promedio diario (ug/m3)', color: '#06b6d4' }]}
            height={250}
          />
        </div>
      )}

      {/* Tabla de datos */}
      <Card>
        <CardHeader>
          <CardTitle>Mediciones de Calidad del Aire</CardTitle>
          <CardDescription>
            {AIR_QUALITY_MAGNITUDES[filters.magnitud] || 'Todos los contaminantes'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <LoadingState message="Cargando mediciones..." />
          ) : error ? (
            <ErrorState 
              message={error} 
              onRetry={fetchData}
            />
          ) : data.length === 0 ? (
            <EmptyState
              title="Sin mediciones"
              description="No se encontraron mediciones con los filtros seleccionados."
              icon={Wind}
            />
          ) : (
            <>
              <Table>
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
                    const avg = calculateDailyAverage(record.medicionesHorarias);
                    const level = getAirQualityLevel(avg, record.magnitud);
                    
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
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                totalItems={pagination.totalItems}
                itemsPerPage={pagination.itemsPerPage}
                onPageChange={handlePageChange}
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

export default AirQualityPage;
