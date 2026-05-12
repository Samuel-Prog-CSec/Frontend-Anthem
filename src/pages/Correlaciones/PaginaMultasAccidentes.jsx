/**
 * Correlacion Multas x Accidentes
 *
 * Comparativa por distrito: cuantos accidentes y cuantas multas se registran
 * en cada zona. Permite identificar patrones (zonas con muchas multas y
 * pocos accidentes pueden indicar control efectivo; al reves alerta de
 * riesgo no contenido).
 */

import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileWarning, AlertTriangle, TrendingUp } from 'lucide-react';
import { PageLayout } from '../../components/layout';
import {
  Card, CardHeader, CardTitle, CardDescription, CardContent, Button,
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell, TableCaption,
  Badge, EmptyState, TableSkeleton
} from '../../components/common';
import { StatCard, BarChartCard } from '../../components/charts';
import { useAccidentesComparativa, useMultasRanking } from '../../api/hooks';
import { ROUTES } from '../../constants';
import { formatNumber } from '../../utils';

function PaginaMultasAccidentes() {
  const {
    data: accidentesResult,
    isLoading: cargandoAccidentes
  } = useAccidentesComparativa();
  const {
    data: rankingMultas,
    isLoading: cargandoMultas
  } = useMultasRanking({ groupBy: 'distrito', limit: 50 });

  const cargando = cargandoAccidentes || cargandoMultas;

  const filas = useMemo(() => {
    const accs = accidentesResult?.data || [];
    const multas = rankingMultas?.data?.ranking || rankingMultas?.data || [];

    // Indexar accidentes por distrito (uppercase) -> total
    const indexAcc = new Map();
    accs.forEach(a => {
      const nombre = a._id || a.distrito;
      if (nombre) {indexAcc.set(nombre.toUpperCase(), a.totalAccidentes || a.total || 0);}
    });

    // Indexar multas por distrito (toleramos varias formas del backend)
    const indexMultas = new Map();
    multas.forEach(m => {
      const nombre = m._id || m.distrito || m.lugar;
      if (nombre) {indexMultas.set(String(nombre).toUpperCase(), m.totalMultas || m.total || m.count || 0);}
    });

    // Union de claves
    const claves = new Set([...indexAcc.keys(), ...indexMultas.keys()]);
    const resultado = [];
    claves.forEach(k => {
      resultado.push({
        distrito: k,
        accidentes: indexAcc.get(k) || 0,
        multas: indexMultas.get(k) || 0
      });
    });

    // Ratio multas/accidente: alto = mas control que siniestros, bajo = lo contrario
    return resultado.map(r => ({
      ...r,
      ratio: r.accidentes > 0 ? r.multas / r.accidentes : (r.multas > 0 ? Infinity : 0)
    }));
  }, [accidentesResult, rankingMultas]);

  const filasTop = useMemo(() => {
    return [...filas]
      .filter(f => f.accidentes > 0 || f.multas > 0)
      .sort((a, b) => (b.accidentes + b.multas) - (a.accidentes + a.multas))
      .slice(0, 20);
  }, [filas]);

  const datosGrafico = useMemo(() => {
    return filasTop.slice(0, 12).map(f => ({
      name: f.distrito,
      multas: f.multas,
      accidentes: f.accidentes
    }));
  }, [filasTop]);

  const totales = useMemo(() => {
    const totalAccidentes = filas.reduce((s, f) => s + f.accidentes, 0);
    const totalMultas = filas.reduce((s, f) => s + f.multas, 0);
    const ratioGlobal = totalAccidentes > 0 ? totalMultas / totalAccidentes : 0;
    return { totalAccidentes, totalMultas, ratioGlobal };
  }, [filas]);

  return (
    <PageLayout
      title="Multas vs. Accidentes"
      description="Cruce por distrito entre multas registradas y accidentes ocurridos."
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
          title="Total accidentes"
          value={formatNumber(totales.totalAccidentes)}
          icon={AlertTriangle}
          isLoading={cargando}
        />
        <StatCard
          title="Total multas"
          value={formatNumber(totales.totalMultas)}
          icon={FileWarning}
          isLoading={cargando}
        />
        <StatCard
          title="Ratio multas/accidente"
          value={formatNumber(totales.ratioGlobal, 2)}
          subtitle="global del dataset"
          icon={TrendingUp}
          isLoading={cargando}
        />
      </div>

      <BarChartCard
        title="Top 12 distritos: accidentes vs. multas"
        data={datosGrafico}
        xKey="name"
        bars={[
          { key: 'multas', name: 'Multas', color: '#ef4444' },
          { key: 'accidentes', name: 'Accidentes', color: '#f59e0b' }
        ]}
        height={360}
        isLoading={cargando}
      />

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Comparativa por distrito (top 20)</CardTitle>
          <CardDescription>
            Ratios altos pueden indicar zonas con mucho control sancionador y baja siniestralidad. Ratios bajos sugieren riesgo no contenido por la normativa actual.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {cargando ? (
            <TableSkeleton rows={8} columns={5} />
          ) : filasTop.length === 0 ? (
            <EmptyState
              title="Sin datos cruzados"
              description="No se pudo construir la comparativa."
              icon={FileWarning}
            />
          ) : (
            <Table label="Comparativa multas vs accidentes" rowCount={filasTop.length}>
              <TableCaption className="sr-only">Comparativa por distrito</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Distrito</TableHead>
                  <TableHead className="text-right">Accidentes</TableHead>
                  <TableHead className="text-right">Multas</TableHead>
                  <TableHead className="text-right">Ratio M/A</TableHead>
                  <TableHead className="text-center">Indicador</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filasTop.map(f => {
                  const ratioFinito = Number.isFinite(f.ratio);
                  const indicador = !ratioFinito || f.accidentes === 0
                    ? { variant: 'info', label: 'Sin accidentes' }
                    : f.ratio > totales.ratioGlobal * 1.5
                      ? { variant: 'success', label: 'Alto control' }
                      : f.ratio < totales.ratioGlobal * 0.5
                        ? { variant: 'destructive', label: 'Riesgo' }
                        : { variant: 'secondary', label: 'Equilibrado' };
                  return (
                    <TableRow key={f.distrito}>
                      <TableCell className="font-medium text-cyan-400">{f.distrito}</TableCell>
                      <TableCell className="text-right font-mono">{formatNumber(f.accidentes)}</TableCell>
                      <TableCell className="text-right font-mono">{formatNumber(f.multas)}</TableCell>
                      <TableCell className="text-right font-mono text-foreground">
                        {ratioFinito ? formatNumber(f.ratio, 2) : '∞'}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={indicador.variant}>{indicador.label}</Badge>
                      </TableCell>
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

export default PaginaMultasAccidentes;
