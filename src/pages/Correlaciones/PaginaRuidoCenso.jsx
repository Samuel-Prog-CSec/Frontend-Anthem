/**
 * Correlacion Ruido x Censo
 *
 * Aproximacion a la poblacion potencialmente expuesta a niveles de ruido
 * superiores al limite legal diurno (65 dB). Cruza:
 *   - useRuidoRanking: estaciones ordenadas por LAEQ24
 *   - useCensoResumenDistritos: poblacion por distrito
 *
 * Limitacion conocida: el dataset no asocia directamente cada estacion NMT
 * a un distrito; el calculo es a nivel de distrito agregado y solo cuando
 * el ranking incluye `distrito` como dimension.
 */

import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Volume2, Users, AlertTriangle } from 'lucide-react';
import { PageLayout } from '../../components/layout';
import {
  Card, CardHeader, CardTitle, CardDescription, CardContent, Button,
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell, TableCaption,
  Badge, EmptyState, TableSkeleton
} from '../../components/common';
import { StatCard, BarChartCard } from '../../components/charts';
import { useRuidoRanking, useCensoResumenDistritos } from '../../api/hooks';
import { ROUTES, DATE_CONFIG, NOISE_LIMITS, CHART_COLORS } from '../../constants';
import { formatNumber, formatDecibels, formatearNombreDistrito } from '../../utils';

function PaginaRuidoCenso() {
  const {
    data: rankingResult,
    isLoading: cargandoRuido
  } = useRuidoRanking({ limit: 50, orderBy: 'laeq24' });

  const {
    data: censoResult,
    isLoading: cargandoCenso
  } = useCensoResumenDistritos({ año: DATE_CONFIG.DATASET_YEAR });

  const cargando = cargandoRuido || cargandoCenso;

  const estaciones = useMemo(() => {
    return rankingResult?.data?.ranking || rankingResult?.data || [];
  }, [rankingResult]);

  const distritos = useMemo(() => {
    return censoResult?.data?.data || censoResult?.data || [];
  }, [censoResult]);

  // Mapear estaciones a distritos cuando viene la info, contar incumplimientos
  const stats = useMemo(() => {
    // El censo devuelve CHAMBERI/CHAMARTIN/TETUAN/VICALVARO sin tildes (los
    // CSV de origen las eliminan), pero el ranking ruido viene con tildes
    // porque las hereda de accidents. Para que el lookup matchee hay que
    // normalizar quitando diacríticos en ambos lados.
    const normalizarClave = (s) => (s || '')
      .toString()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toUpperCase()
      .trim();

    const totalEstaciones = estaciones.length;
    const incumplimientos = estaciones.filter(e =>
      (e.laeq24 || e.promedioLaeq24 || 0) > NOISE_LIMITS.DIURNO
    );
    const porDistrito = new Map();
    incumplimientos.forEach(e => {
      const distrito = e.distrito || e.zona || 'SIN_ASIGNAR';
      const acc = porDistrito.get(distrito) || { distrito, estacionesAfectadas: 0, sumLaeq: 0 };
      acc.estacionesAfectadas += 1;
      acc.sumLaeq += (e.laeq24 || e.promedioLaeq24 || 0);
      porDistrito.set(distrito, acc);
    });

    const indexCenso = new Map();
    distritos.forEach(d => {
      const nombre = d.nombre || d._id;
      if (nombre) {indexCenso.set(normalizarClave(nombre), d.totalPoblacion || 0);}
    });

    const distritosAfectados = Array.from(porDistrito.values()).map(d => ({
      ...d,
      laeqMedio: d.estacionesAfectadas > 0 ? d.sumLaeq / d.estacionesAfectadas : 0,
      poblacion: indexCenso.get(normalizarClave(d.distrito)) || 0
    }))
    .sort((a, b) => b.poblacion - a.poblacion);

    const poblacionExpuestaEstimada = distritosAfectados.reduce((s, d) => s + d.poblacion, 0);

    return {
      totalEstaciones,
      totalIncumplimientos: incumplimientos.length,
      distritosAfectados,
      poblacionExpuestaEstimada
    };
  }, [estaciones, distritos]);

  const datosGrafico = useMemo(() => {
    return stats.distritosAfectados
      .filter(d => d.distrito && d.distrito !== 'SIN_ASIGNAR')
      .slice(0, 12)
      .map(d => ({
        name: d.distrito,
        poblacion: d.poblacion,
        laeqMedio: Number(d.laeqMedio.toFixed(1))
      }));
  }, [stats.distritosAfectados]);

  return (
    <PageLayout
      title="Ruido vs. Censo"
      description={`Distritos con estaciones acústicas que superan el límite diurno (${NOISE_LIMITS.DIURNO} dB) y su población. La cifra de población es una COTA SUPERIOR: cuenta el distrito completo, no solo el entorno de la estación. Muestra parcial (30 estaciones, no todos los distritos tienen sensor).`}
      actions={
        <Button asChild variant="outline" size="sm">
          <Link to={ROUTES.CORRELACIONES}>
            <ArrowLeft className="size-4 mr-2" aria-hidden="true" />
            Volver a correlaciones
          </Link>
        </Button>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard
          title="Estaciones analizadas"
          value={formatNumber(stats.totalEstaciones)}
          icon={Volume2}
          isLoading={cargando}
        />
        <StatCard
          title="Estaciones con incumplimiento"
          value={formatNumber(stats.totalIncumplimientos)}
          subtitle={`LAeq24 > ${NOISE_LIMITS.DIURNO} dB`}
          icon={AlertTriangle}
          isLoading={cargando}
        />
        <StatCard
          title="Población en distritos afectados"
          value={formatNumber(stats.poblacionExpuestaEstimada)}
          subtitle="cota superior: distrito completo, no solo el entorno de la estación"
          icon={Users}
          isLoading={cargando}
        />
      </div>

      <BarChartCard
        title="Top 12 distritos: población en zonas con incumplimiento"
        data={datosGrafico}
        xKey="name"
        bars={[{ key: 'poblacion', name: 'Habitantes', color: CHART_COLORS.accent }]}
        height={360}
        isLoading={cargando}
      />

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Detalle por distrito</CardTitle>
          <CardDescription>
            Distritos con al menos una estación en incumplimiento del límite diurno. La población proviene del censo agregado del distrito completo (estimación superior).
          </CardDescription>
        </CardHeader>
        <CardContent>
          {cargando ? (
            <TableSkeleton rows={6} columns={4} />
          ) : stats.distritosAfectados.length === 0 ? (
            <EmptyState
              title="Sin distritos afectados"
              description="No se detectaron estaciones por encima del límite diurno."
              icon={Volume2}
            />
          ) : (
            <Table label="Distritos afectados por ruido" rowCount={stats.distritosAfectados.length}>
              <TableCaption className="sr-only">Distritos con incumplimiento</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Distrito</TableHead>
                  <TableHead className="text-right">Estaciones afectadas</TableHead>
                  <TableHead className="text-right">LAeq24 medio</TableHead>
                  <TableHead className="text-right">Población</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.distritosAfectados.map(d => {
                  const excedeMucho = d.laeqMedio - NOISE_LIMITS.DIURNO > 5;
                  return (
                    <TableRow key={d.distrito}>
                      <TableCell className="font-medium text-info">{formatearNombreDistrito(d.distrito)}</TableCell>
                      <TableCell className="text-right font-mono">{formatNumber(d.estacionesAfectadas)}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant={excedeMucho ? 'destructive' : 'warning'}>
                          {formatDecibels(d.laeqMedio)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono">{formatNumber(d.poblacion)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </PageLayout>
  );
}

export default PaginaRuidoCenso;
