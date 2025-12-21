/**
 * Pagina de Contaminacion Acustica
 * 
 * Visualizacion de datos de ruido ambiental:
 * - Mediciones por estacion
 * - Niveles por periodo (diurno, vespertino, nocturno)
 * - Cumplimiento normativo
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Volume2, Filter, RefreshCw, Sun, Sunset, Moon, AlertTriangle, TrendingDown, TrendingUp } from 'lucide-react';
import { PageLayout } from '../../components/layout';
import { 
  Card, CardHeader, CardTitle, CardContent, CardDescription,
  Button, Select, Badge,
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
  LoadingState, ErrorState, EmptyState, Pagination
} from '../../components/common';
import { StatCard, LineChartCard } from '../../components/charts';
import { getNoiseData } from '../../api/noiseService';
import { NOISE_LIMITS, NOISE_PERIODS, PAGINATION, DATE_CONFIG } from '../../constants';
import { formatDate, formatNumber, formatDecibels } from '../../utils';

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
 * Determina si el nivel de ruido excede el limite normativo
 * @param {number} value - Valor en dB
 * @param {string} period - Periodo: 'diurno', 'vespertino', 'nocturno'
 * @returns {boolean} true si excede el limite
 */
function exceedsLimit(value, period) {
  if (value == null) return false;
  
  const limits = {
    diurno: NOISE_LIMITS.DIURNO,
    vespertino: NOISE_LIMITS.VESPERTINO,
    nocturno: NOISE_LIMITS.NOCTURNO
  };
  
  return value > (limits[period] || 65);
}

/**
 * Obtiene el color del badge segun el nivel de ruido
 * @param {number} value - Valor en dB
 * @returns {string} Variante del badge
 */
function getNoiseBadgeVariant(value) {
  if (value == null) return 'secondary';
  if (value <= 55) return 'success';
  if (value <= 65) return 'warning';
  return 'destructive';
}

/**
 * Pagina de contaminacion acustica
 */
function NoiseMonitoringPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    mes: '',
    nmt: ''
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
        limit: pagination.itemsPerPage,
        año: DATE_CONFIG.DATASET_YEAR
      };
      
      if (filters.mes) {
        params.mes = parseInt(filters.mes);
      }
      
      if (filters.nmt) {
        params.nmt = parseInt(filters.nmt);
      }
      
      const response = await getNoiseData(params);
      
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
      setError(err.message || 'Error al cargar datos de ruido');
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, pagination.itemsPerPage, filters.mes, filters.nmt]);

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
    setFilters({ mes: '', nmt: '' });
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  // Calcular estadisticas
  const stats = useMemo(() => {
    if (data.length === 0) {
      return { 
        avgLaeq: 0, 
        avgDiurno: 0, 
        avgNocturno: 0, 
        exceedCount: 0,
        stationsCount: 0
      };
    }
    
    const laeqValues = data.filter(d => d.laeq24 != null).map(d => d.laeq24);
    const diurnoValues = data.filter(d => d.nivelDiurno != null).map(d => d.nivelDiurno);
    const nocturnoValues = data.filter(d => d.nivelNocturno != null).map(d => d.nivelNocturno);
    const vespertinoValues = data.filter(d => d.nivelVespertino != null).map(d => d.nivelVespertino);
    
    // Contar estaciones que exceden limites
    const exceedCount = data.filter(d => 
      exceedsLimit(d.nivelDiurno, 'diurno') || 
      exceedsLimit(d.nivelNocturno, 'nocturno') ||
      exceedsLimit(d.nivelVespertino, 'vespertino')
    ).length;
    
    // Contar estaciones unicas
    const uniqueStations = new Set(data.map(d => d.nmt));
    
    return {
      avgLaeq: laeqValues.length > 0 
        ? laeqValues.reduce((a, b) => a + b, 0) / laeqValues.length 
        : 0,
      avgDiurno: diurnoValues.length > 0 
        ? diurnoValues.reduce((a, b) => a + b, 0) / diurnoValues.length 
        : 0,
      avgNocturno: nocturnoValues.length > 0 
        ? nocturnoValues.reduce((a, b) => a + b, 0) / nocturnoValues.length 
        : 0,
      avgVespertino: vespertinoValues.length > 0 
        ? vespertinoValues.reduce((a, b) => a + b, 0) / vespertinoValues.length 
        : 0,
      exceedCount,
      stationsCount: uniqueStations.size
    };
  }, [data]);

  // Preparar datos para grafico (ultimas 12 mediciones)
  const chartData = useMemo(() => {
    return data.slice(0, 12).map(d => ({
      estacion: d.nombre?.slice(0, 15) || `NMT ${d.nmt}`,
      diurno: d.nivelDiurno || 0,
      nocturno: d.nivelNocturno || 0,
      vespertino: d.nivelVespertino || 0,
      laeq24: d.laeq24 || 0
    })).reverse();
  }, [data]);

  // Obtener opciones de estaciones
  const stationOptions = useMemo(() => {
    const uniqueStations = new Map();
    data.forEach(d => {
      if (!uniqueStations.has(d.nmt)) {
        uniqueStations.set(d.nmt, { value: String(d.nmt), label: d.nombre || `Estacion ${d.nmt}` });
      }
    });
    return Array.from(uniqueStations.values());
  }, [data]);

  return (
    <PageLayout
      title="Contaminacion Acustica"
      description={`Monitoreo de ruido ambiental - ${DATE_CONFIG.DATASET_YEAR}`}
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
          title="Promedio LAeq24"
          value={formatDecibels(stats.avgLaeq)}
          icon={Volume2}
        />
        <StatCard
          title="Promedio Diurno"
          value={formatDecibels(stats.avgDiurno)}
          subtitle="07:00 - 19:00"
          icon={Sun}
        />
        <StatCard
          title="Promedio Vespertino"
          value={formatDecibels(stats.avgVespertino)}
          subtitle="19:00 - 23:00"
          icon={Sunset}
        />
        <StatCard
          title="Promedio Nocturno"
          value={formatDecibels(stats.avgNocturno)}
          subtitle="23:00 - 07:00"
          icon={Moon}
        />
        <StatCard
          title="Exceden Limite"
          value={stats.exceedCount}
          subtitle="mediciones"
          icon={AlertTriangle}
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
              <label className="text-sm text-slate-400 mb-1 block">Mes</label>
              <Select
                value={filters.mes}
                onChange={(e) => handleFilterChange('mes', e.target.value)}
                options={monthOptions}
                placeholder="Todos los meses"
              />
            </div>
            <div className="flex-1">
              <label className="text-sm text-slate-400 mb-1 block">Estacion (NMT)</label>
              <Select
                value={filters.nmt}
                onChange={(e) => handleFilterChange('nmt', e.target.value)}
                options={stationOptions}
                placeholder="Todas las estaciones"
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

      {/* Grafico de niveles */}
      {!loading && data.length > 0 && (
        <div className="mb-6">
          <LineChartCard
            title="Niveles de Ruido por Estacion"
            data={chartData}
            xKey="estacion"
            lines={[
              { key: 'diurno', name: 'Diurno (dB)', color: '#f59e0b' },
              { key: 'vespertino', name: 'Vespertino (dB)', color: '#f97316' },
              { key: 'nocturno', name: 'Nocturno (dB)', color: '#8b5cf6' },
              { key: 'laeq24', name: 'LAeq24 (dB)', color: '#06b6d4' }
            ]}
            height={280}
          />
        </div>
      )}

      {/* Tabla de datos */}
      <Card>
        <CardHeader>
          <CardTitle>Mediciones de Ruido</CardTitle>
          <CardDescription>
            Niveles de presion acustica por periodo del dia
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
              icon={Volume2}
            />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Estacion</TableHead>
                    <TableHead className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Sun className="h-4 w-4 text-amber-400" />
                        Diurno
                      </div>
                    </TableHead>
                    <TableHead className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Sunset className="h-4 w-4 text-orange-400" />
                        Vespertino
                      </div>
                    </TableHead>
                    <TableHead className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Moon className="h-4 w-4 text-purple-400" />
                        Nocturno
                      </div>
                    </TableHead>
                    <TableHead className="text-center">LAeq24</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((record) => (
                    <TableRow key={record._id}>
                      <TableCell className="font-medium">
                        {formatDate(record.fecha)}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{record.nombre || '-'}</p>
                          <p className="text-xs text-slate-500">NMT {record.nmt}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge 
                          variant={getNoiseBadgeVariant(record.nivelDiurno)}
                          className="font-mono"
                        >
                          {record.nivelDiurno != null ? `${formatNumber(record.nivelDiurno, 1)} dB` : '-'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge 
                          variant={getNoiseBadgeVariant(record.nivelVespertino)}
                          className="font-mono"
                        >
                          {record.nivelVespertino != null ? `${formatNumber(record.nivelVespertino, 1)} dB` : '-'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge 
                          variant={getNoiseBadgeVariant(record.nivelNocturno)}
                          className="font-mono"
                        >
                          {record.nivelNocturno != null ? `${formatNumber(record.nivelNocturno, 1)} dB` : '-'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center font-mono text-slate-300">
                        {record.laeq24 != null ? `${formatNumber(record.laeq24, 1)} dB` : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
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

      {/* Leyenda de limites normativos */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Limites Normativos (dB)</CardTitle>
          <CardDescription>
            Basado en normativa europea de contaminacion acustica
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-900/20 border border-amber-700/30">
              <Sun className="h-5 w-5 text-amber-400" />
              <div>
                <p className="font-medium text-white">Diurno (07:00 - 19:00)</p>
                <p className="text-sm text-slate-400">Limite: {NOISE_LIMITS.DIURNO} dB</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-orange-900/20 border border-orange-700/30">
              <Sunset className="h-5 w-5 text-orange-400" />
              <div>
                <p className="font-medium text-white">Vespertino (19:00 - 23:00)</p>
                <p className="text-sm text-slate-400">Limite: {NOISE_LIMITS.VESPERTINO} dB</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-purple-900/20 border border-purple-700/30">
              <Moon className="h-5 w-5 text-purple-400" />
              <div>
                <p className="font-medium text-white">Nocturno (23:00 - 07:00)</p>
                <p className="text-sm text-slate-400">Limite: {NOISE_LIMITS.NOCTURNO} dB</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </PageLayout>
  );
}

export default NoiseMonitoringPage;
