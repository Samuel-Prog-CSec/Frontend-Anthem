/**
 * Pagina de Contaminacion Acustica
 *
 * Visualizacion de datos de ruido ambiental:
 * - Mediciones por estacion
 * - Niveles por periodo (diurno, vespertino, nocturno)
 * - Cumplimiento normativo
 */

import { useState, useMemo } from 'react';
import { Volume2, Filter, RefreshCw, Sun, Sunset, Moon, AlertTriangle, Award, ShieldCheck } from 'lucide-react';
import { PageLayout } from '../../components/layout';
import {
  Card, CardHeader, CardTitle, CardContent, CardDescription,
  Button, Select, Badge,
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
  LoadingState, ErrorState, EmptyState, Pagination,
  TableSkeleton, ChartSkeleton
} from '../../components/common';
import { StatCard, LineChartCard } from '../../components/charts';
import { useRuido, useEstacionesRuido, useRuidoRanking, useRuidoCumplimiento, useRuidoTendencias } from '../../api/hooks';
import { NOISE_LIMITS, PAGINATION, DATE_CONFIG } from '../../constants';
import { formatDate, formatNumber, formatDecibels } from '../../utils';

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
 * Determina si el nivel de ruido excede el limite normativo
 * @param {number} value - Valor en dB
 * @param {string} period - Periodo: 'diurno', 'vespertino', 'nocturno'
 * @returns {boolean} true si excede el limite
 */
function excedeLimite(value, period) {
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
function obtenerVarianteBadgeRuido(value) {
  if (value == null) return 'secondary';
  if (value <= 55) return 'success';
  if (value <= 65) return 'warning';
  return 'destructive';
}

/**
 * Pagina de contaminacion acustica
 */
function PaginaRuido() {
  const [filtros, setFiltros] = useState({
    mes: '',
    nmt: ''
  });
  const [paginaActual, setPaginaActual] = useState(1);
  const elementosPorPagina = PAGINATION.DEFAULT_LIMIT;

  // Parametros de consulta derivados del estado
  const parametrosConsulta = useMemo(() => {
    const params = {
      page: paginaActual,
      limit: elementosPorPagina,
      año: DATE_CONFIG.DATASET_YEAR
    };

    if (filtros.mes) params.mes = parseInt(filtros.mes);
    if (filtros.nmt) params.nmt = parseInt(filtros.nmt);

    return params;
  }, [paginaActual, elementosPorPagina, filtros.mes, filtros.nmt]);

  // React Query: datos de ruido
  const {
    data: noiseData,
    isLoading,
    error,
    refetch
  } = useRuido(parametrosConsulta);

  // React Query: lista de estaciones (independiente de filtros de pagina)
  const { data: stationOptions = [] } = useEstacionesRuido();

  // React Query: ranking de estaciones por nivel de ruido
  const { data: rankingApi, isLoading: cargandoRanking } = useRuidoRanking({ limit: 5 });

  // React Query: cumplimiento normativo por zona
  const { data: cumplimientoApi, isLoading: cargandoCumplimiento } = useRuidoCumplimiento();

  // React Query: tendencias temporales (todo el año del dataset)
  const parametrosTendencia = useMemo(() => ({
    startDate: `${DATE_CONFIG.DATASET_YEAR}-01-01`,
    endDate: `${DATE_CONFIG.DATASET_YEAR}-12-31`,
    groupBy: 'month',
    metric: 'laeq24'
  }), []);
  const { data: tendenciasApi } = useRuidoTendencias(parametrosTendencia);

  // Memoizamos para mantener referencia estable y no invalidar useMemos
  // que dependen de `data` cuando noiseData es undefined entre renders
  const data = useMemo(() => noiseData?.data || [], [noiseData?.data]);
  const pagination = noiseData?.pagination || {};

  // Preparar datos para grafico de tendencias temporales
  const datosTendencia = useMemo(() => {
    const trendData = tendenciasApi?.data?.data || tendenciasApi?.data || [];
    if (!Array.isArray(trendData) || trendData.length === 0) return [];
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return trendData.map(d => ({
      periodo: d.periodo?.mes ? meses[d.periodo.mes - 1] : (d._id?.mes ? meses[d._id.mes - 1] : '-'),
      promedio: d.promedio != null ? Number(d.promedio.toFixed(1)) : 0,
      maximo: d.maximo != null ? Number(d.maximo.toFixed(1)) : 0,
      minimo: d.minimo != null ? Number(d.minimo.toFixed(1)) : 0
    }));
  }, [tendenciasApi]);

  // Cambiar filtros
  const manejarCambioFiltro = (name, value) => {
    setFiltros(prev => ({ ...prev, [name]: value }));
    setPaginaActual(1);
  };

  // Limpiar filtros
  const limpiarFiltros = () => {
    setFiltros({ mes: '', nmt: '' });
    setPaginaActual(1);
  };

  // Calcular estadisticas
  const estadisticas = useMemo(() => {
    if (data.length === 0) {
      return {
        promedioLaeq: 0,
        promedioDiurno: 0,
        promedioNocturno: 0,
        promedioVespertino: 0,
        cantidadExceden: 0,
        cantidadEstaciones: 0
      };
    }

    const laeqValues = data.filter(d => d.laeq24 != null).map(d => d.laeq24);
    const diurnoValues = data.filter(d => d.nivelDiurno != null).map(d => d.nivelDiurno);
    const nocturnoValues = data.filter(d => d.nivelNocturno != null).map(d => d.nivelNocturno);
    const vespertinoValues = data.filter(d => d.nivelVespertino != null).map(d => d.nivelVespertino);

    const cantidadExceden = data.filter(d =>
      excedeLimite(d.nivelDiurno, 'diurno') ||
      excedeLimite(d.nivelNocturno, 'nocturno') ||
      excedeLimite(d.nivelVespertino, 'vespertino')
    ).length;

    const uniqueStations = new Set(data.map(d => d.nmt));

    const avg = (arr) => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

    return {
      promedioLaeq: avg(laeqValues),
      promedioDiurno: avg(diurnoValues),
      promedioNocturno: avg(nocturnoValues),
      promedioVespertino: avg(vespertinoValues),
      cantidadExceden,
      cantidadEstaciones: uniqueStations.size
    };
  }, [data]);

  // Preparar datos para grafico (ultimas 12 mediciones)
  const datosGrafico = useMemo(() => {
    return data.slice(0, 12).map(d => ({
      estacion: d.nombre?.slice(0, 15) || `NMT ${d.nmt}`,
      diurno: d.nivelDiurno || 0,
      nocturno: d.nivelNocturno || 0,
      vespertino: d.nivelVespertino || 0,
      laeq24: d.laeq24 || 0
    })).reverse();
  }, [data]);

  // Extraer ranking de la respuesta de la API
  const datosRanking = useMemo(() => {
    const rankData = rankingApi?.data?.data || rankingApi?.data || [];
    if (!Array.isArray(rankData)) return [];
    return rankData.slice(0, 10).map(r => ({
      nombre: r.nombre || r._id?.nombre || `Estacion ${r.nmt || r._id?.nmt || '-'}`,
      nmt: r.nmt || r._id?.nmt || '-',
      laeq24: r.promedioLaeq24 || r.laeq24 || r.avgLaeq24 || 0,
      diurno: r.promedioDiurno || r.nivelDiurno || r.avgDiurno || 0,
      nocturno: r.promedioNocturno || r.nivelNocturno || r.avgNocturno || 0
    }));
  }, [rankingApi]);

  // Extraer cumplimiento normativo de la respuesta de la API
  const datosCumplimiento = useMemo(() => {
    const compData = cumplimientoApi?.data?.data || cumplimientoApi?.data || [];
    if (!Array.isArray(compData)) {
      // Puede venir como objeto unico con resumen
      if (compData && typeof compData === 'object') {
        return {
          resumen: compData,
          estaciones: []
        };
      }
      return { resumen: null, estaciones: [] };
    }
    return {
      resumen: null,
      estaciones: compData.slice(0, 10).map(c => ({
        nombre: c.nombre || c._id?.nombre || `Estacion ${c.nmt || c._id?.nmt || '-'}`,
        nmt: c.nmt || c._id?.nmt || '-',
        cumple: c.cumple ?? c.compliant ?? c.cumplimiento ?? false,
        promedioDiurno: c.promedioDiurno || c.avgDiurno || 0,
        promedioNocturno: c.promedioNocturno || c.avgNocturno || 0,
        excedencias: c.excedencias || c.violations || c.totalExcedencias || 0
      }))
    };
  }, [cumplimientoApi]);

  return (
    <PageLayout
      title="Contaminacion Acustica"
      description={`Monitoreo de ruido ambiental - ${DATE_CONFIG.DATASET_YEAR}`}
      actions={
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualizar
        </Button>
      }
    >
      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Promedio LAeq24"
          value={formatDecibels(estadisticas.promedioLaeq)}
          icon={Volume2}
        />
        <StatCard
          title="Promedio Diurno"
          value={formatDecibels(estadisticas.promedioDiurno)}
          subtitle="07:00 - 19:00"
          icon={Sun}
        />
        <StatCard
          title="Promedio Vespertino"
          value={formatDecibels(estadisticas.promedioVespertino)}
          subtitle="19:00 - 23:00"
          icon={Sunset}
        />
        <StatCard
          title="Promedio Nocturno"
          value={formatDecibels(estadisticas.promedioNocturno)}
          subtitle="23:00 - 07:00"
          icon={Moon}
        />
        <StatCard
          title="Exceden Limite"
          value={estadisticas.cantidadExceden}
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
                value={filtros.mes}
                onChange={(e) => manejarCambioFiltro('mes', e.target.value)}
                options={opcionesMes}
                placeholder="Todos los meses"
              />
            </div>
            <div className="flex-1">
              <label className="text-sm text-slate-400 mb-1 block">Estacion (NMT)</label>
              <Select
                value={filtros.nmt}
                onChange={(e) => manejarCambioFiltro('nmt', e.target.value)}
                options={stationOptions}
                placeholder="Todas las estaciones"
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

      {/* Grafico de niveles */}
      {!isLoading && data.length > 0 && (
        <div className="mb-6">
          <LineChartCard
            title="Niveles de Ruido por Estacion"
            data={datosGrafico}
            xKey="estacion"
            lines={[
              { key: 'diurno', name: 'Diurno (dB)', color: '#f59e0b' },
              { key: 'vespertino', name: 'Vespertino (dB)', color: '#f97316' },
              { key: 'nocturno', name: 'Nocturno (dB)', color: '#8b5cf6' },
              { key: 'laeq24', name: 'LAeq24 (dB)', color: '#06b6d4' }
            ]}
            referenceLines={[
              { y: NOISE_LIMITS.DIURNO, label: `Limite diurno (${NOISE_LIMITS.DIURNO} dB)`, color: '#f59e0b' },
              { y: NOISE_LIMITS.NOCTURNO, label: `Limite nocturno (${NOISE_LIMITS.NOCTURNO} dB)`, color: '#8b5cf6' }
            ]}
            height={280}
          />
        </div>
      )}

      {/* Tendencias temporales de ruido */}
      {datosTendencia.length > 0 && (
        <div className="mb-6">
          <LineChartCard
            title={`Tendencias Temporales de Ruido (LAeq24) - ${DATE_CONFIG.DATASET_YEAR}`}
            data={datosTendencia}
            xKey="periodo"
            lines={[
              { key: 'promedio', name: 'Promedio', color: '#06b6d4' },
              { key: 'maximo', name: 'Maximo', color: '#ef4444' },
              { key: 'minimo', name: 'Minimo', color: '#10b981' }
            ]}
            height={280}
          />
        </div>
      )}

      {/* Ranking y Cumplimiento normativo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Ranking de estaciones */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Ranking de Estaciones
            </CardTitle>
            <CardDescription>
              Estaciones ordenadas por nivel de ruido
            </CardDescription>
          </CardHeader>
          <CardContent>
            {cargandoRanking ? (
              <ChartSkeleton height={320} />
            ) : datosRanking.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Estacion</TableHead>
                    <TableHead className="text-center">LAeq24</TableHead>
                    <TableHead className="text-center">Diurno</TableHead>
                    <TableHead className="text-center">Nocturno</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {datosRanking.map((estacion, index) => (
                    <TableRow key={`ranking-${estacion.nmt}-${index}`}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{estacion.nombre}</p>
                          <p className="text-xs text-slate-500">NMT {estacion.nmt}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={obtenerVarianteBadgeRuido(estacion.laeq24)} className="font-mono">
                          {formatNumber(estacion.laeq24, 1)} dB
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center font-mono text-sm text-slate-300">
                        {formatNumber(estacion.diurno, 1)} dB
                      </TableCell>
                      <TableCell className="text-center font-mono text-sm text-slate-300">
                        {formatNumber(estacion.nocturno, 1)} dB
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <EmptyState
                title="Sin datos de ranking"
                description="No se pudo obtener el ranking de estaciones."
                icon={Award}
              />
            )}
          </CardContent>
        </Card>

        {/* Cumplimiento normativo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" />
              Cumplimiento Normativo
            </CardTitle>
            <CardDescription>
              Estado de cumplimiento de limites acusticos por estacion
            </CardDescription>
          </CardHeader>
          <CardContent>
            {cargandoCumplimiento ? (
              <ChartSkeleton height={300} />
            ) : datosCumplimiento.estaciones.length > 0 ? (
              <div className="space-y-3">
                {datosCumplimiento.estaciones.map((estacion, index) => (
                  <div
                    key={`compliance-${estacion.nmt}-${index}`}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700/50"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-sm text-white">{estacion.nombre}</p>
                      <p className="text-xs text-slate-500">
                        Diurno: {formatNumber(estacion.promedioDiurno, 1)} dB | Nocturno: {formatNumber(estacion.promedioNocturno, 1)} dB
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {estacion.excedencias > 0 && (
                        <span className="text-xs text-slate-400">{estacion.excedencias} excedencias</span>
                      )}
                      <Badge variant={estacion.cumple ? 'success' : 'destructive'}>
                        {estacion.cumple ? 'Cumple' : 'No cumple'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : datosCumplimiento.resumen ? (
              <div className="space-y-3">
                <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                  <p className="text-sm text-slate-300">
                    {datosCumplimiento.resumen.totalEstaciones != null && (
                      <span>Estaciones analizadas: <strong className="text-white">{datosCumplimiento.resumen.totalEstaciones}</strong></span>
                    )}
                  </p>
                  {datosCumplimiento.resumen.porcentajeCumplimiento != null && (
                    <p className="text-sm text-slate-300 mt-2">
                      Cumplimiento: <Badge variant={datosCumplimiento.resumen.porcentajeCumplimiento >= 80 ? 'success' : 'destructive'}>
                        {formatNumber(datosCumplimiento.resumen.porcentajeCumplimiento, 1)}%
                      </Badge>
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <EmptyState
                title="Sin datos de cumplimiento"
                description="No se pudo obtener informacion de cumplimiento normativo."
                icon={ShieldCheck}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tabla de datos */}
      <Card>
        <CardHeader>
          <CardTitle>Mediciones de Ruido</CardTitle>
          <CardDescription>
            Niveles de presion acustica por periodo del dia
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <TableSkeleton rows={6} columns={6} />
          ) : error ? (
            <ErrorState
              message={error.message || 'Error al cargar datos de ruido'}
              onRetry={() => refetch()}
            />
          ) : data.length === 0 ? (
            <EmptyState
              title="Sin mediciones"
              description="No se encontraron mediciones con los filtros seleccionados."
              icon={Volume2}
            />
          ) : (
            <>
              <Table label="Mediciones de contaminacion acustica" rowCount={pagination?.totalDocuments}>
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
                          variant={obtenerVarianteBadgeRuido(record.nivelDiurno)}
                          className="font-mono"
                        >
                          {record.nivelDiurno != null ? `${formatNumber(record.nivelDiurno, 1)} dB` : '-'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={obtenerVarianteBadgeRuido(record.nivelVespertino)}
                          className="font-mono"
                        >
                          {record.nivelVespertino != null ? `${formatNumber(record.nivelVespertino, 1)} dB` : '-'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={obtenerVarianteBadgeRuido(record.nivelNocturno)}
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

export default PaginaRuido;
