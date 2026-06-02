/**
 * Correlacion Multas x Accidentes
 *
 * Los dos datasets viven en granularidades distintas en el CSV de origen:
 *  - Multas: indexadas por LUGAR (calle/punto kilometrico). No hay columna
 *    de distrito. Solo el 1.8% de las multas trae coordenadas UTM, por lo
 *    que reverse-geocoding no cubre la mayoria.
 *  - Accidentes: indexados por distrito municipal (21 distritos de Madrid).
 *
 * Forzar un cruce calle->distrito devolveria sesgo enorme. Mostramos en
 * paralelo el ranking real de cada dataset y un ratio global del corpus
 * como indicador agregado.
 */

import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileWarning, AlertTriangle, TrendingUp, Info } from 'lucide-react';
import { PageLayout } from '../../components/layout';
import {
  Card, CardHeader, CardTitle, CardDescription, CardContent, Button,
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell, TableCaption,
  EmptyState, TableSkeleton
} from '../../components/common';
import { StatCard, BarChartCard } from '../../components/charts';
import { useAccidentesComparativa, useMultasRanking } from '../../api/hooks';
import { ROUTES, CHART_COLORS } from '../../constants';
import { formatNumber } from '../../utils';

function PaginaMultasAccidentes() {
  const {
    data: accidentesResult,
    isLoading: cargandoAccidentes
  } = useAccidentesComparativa();
  const {
    data: rankingMultas,
    isLoading: cargandoMultas
  } = useMultasRanking({ groupBy: 'lugar', limit: 50 });

  const cargando = cargandoAccidentes || cargandoMultas;

  // Tolerar varias formas de respuesta del backend
  const accidentesPorDistrito = useMemo(() => {
    const accsRaw = accidentesResult?.data?.comparativa
      || accidentesResult?.data
      || accidentesResult
      || [];
    const accs = Array.isArray(accsRaw) ? accsRaw : [];
    return accs
      .map(a => ({
        nombre: (a._id || a.distrito || '').toString(),
        total: a.totalAccidentes || a.total || 0
      }))
      .filter(r => r.nombre)
      .sort((a, b) => b.total - a.total);
  }, [accidentesResult]);

  const multasPorLugar = useMemo(() => {
    const multasRaw = rankingMultas?.data?.ranking
      || rankingMultas?.data?.lugares
      || rankingMultas?.data
      || [];
    const multas = Array.isArray(multasRaw) ? multasRaw : [];
    return multas
      .map(m => ({
        nombre: (m._id || m.lugar || m.distrito || '').toString(),
        total: m.totalMultas || m.total || m.count || 0
      }))
      .filter(r => r.nombre)
      .sort((a, b) => b.total - a.total);
  }, [rankingMultas]);

  const totales = useMemo(() => {
    const totalAccidentes = accidentesPorDistrito.reduce((s, f) => s + f.total, 0);
    const totalMultas = multasPorLugar.reduce((s, f) => s + f.total, 0);
    const ratioGlobal = totalAccidentes > 0 ? totalMultas / totalAccidentes : 0;
    return { totalAccidentes, totalMultas, ratioGlobal };
  }, [accidentesPorDistrito, multasPorLugar]);

  const datosGraficoAccidentes = useMemo(() => {
    return accidentesPorDistrito.slice(0, 12).map(r => ({
      name: r.nombre,
      accidentes: r.total
    }));
  }, [accidentesPorDistrito]);

  const datosGraficoMultas = useMemo(() => {
    return multasPorLugar.slice(0, 12).map(r => ({
      name: r.nombre.length > 24 ? `${r.nombre.slice(0, 22)}...` : r.nombre,
      multas: r.total
    }));
  }, [multasPorLugar]);

  const sinDatos = !cargando
    && accidentesPorDistrito.length === 0
    && multasPorLugar.length === 0;

  return (
    <PageLayout
      title="Multas vs. Accidentes"
      description="Indicadores agregados por dataset. La cruzada distrito-a-distrito no es posible porque la base de multas se indexa por calle, no por distrito."
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
          subtitle="agregado por distrito"
          icon={AlertTriangle}
          isLoading={cargando}
        />
        <StatCard
          title="Total multas (top 50)"
          value={formatNumber(totales.totalMultas)}
          subtitle="agregado por lugar"
          icon={FileWarning}
          isLoading={cargando}
        />
        <StatCard
          title="Ratio multas/accidente"
          value={formatNumber(totales.ratioGlobal, 2)}
          subtitle="global del corpus"
          icon={TrendingUp}
          isLoading={cargando}
        />
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="size-4" aria-hidden="true" />
            Por que dos rankings paralelos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground leading-relaxed">
            El CSV de multas no incluye distrito; solo registra el lugar de la denuncia (calle o punto kilometrico). Solo el 1.8% trae coordenadas UTM, insuficiente para reverse-geocoding fiable. Por integridad mostramos cada dataset en su granularidad real: accidentes por distrito (21 unidades) y multas por lugar (top 50 calles).
          </p>
        </CardContent>
      </Card>

      {sinDatos ? (
        <EmptyState
          title="Sin datos"
          description="No se pudieron cargar accidentes ni multas."
          icon={FileWarning}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BarChartCard
            title="Top 12 distritos por accidentes"
            data={datosGraficoAccidentes}
            xKey="name"
            bars={[
              { key: 'accidentes', name: 'Accidentes', color: CHART_COLORS.tertiary }
            ]}
            height={360}
            isLoading={cargando}
          />
          <BarChartCard
            title="Top 12 lugares por multas"
            data={datosGraficoMultas}
            xKey="name"
            bars={[
              { key: 'multas', name: 'Multas', color: CHART_COLORS.danger }
            ]}
            height={360}
            isLoading={cargando}
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Distritos con mas accidentes</CardTitle>
            <CardDescription>
              Ranking municipal por distrito. Util para asignar recursos de patrullaje y mejora de infraestructura.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {cargando ? (
              <TableSkeleton rows={8} columns={2} />
            ) : accidentesPorDistrito.length === 0 ? (
              <EmptyState
                title="Sin datos"
                description="No hay accidentes en la consulta."
                icon={AlertTriangle}
              />
            ) : (
              <Table label="Top distritos por accidentes" rowCount={Math.min(20, accidentesPorDistrito.length)}>
                <TableCaption className="sr-only">Top 20 distritos con mas accidentes</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Distrito</TableHead>
                    <TableHead className="text-right">Accidentes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accidentesPorDistrito.slice(0, 20).map((r, idx) => (
                    <TableRow key={r.nombre}>
                      <TableCell className="font-mono text-muted-foreground">{idx + 1}</TableCell>
                      <TableCell className="font-medium">{r.nombre}</TableCell>
                      <TableCell className="text-right font-mono">{formatNumber(r.total)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lugares con mas multas</CardTitle>
            <CardDescription>
              Calles y puntos kilometricos con mayor numero de denuncias. Permite identificar focos sancionadores.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {cargando ? (
              <TableSkeleton rows={8} columns={2} />
            ) : multasPorLugar.length === 0 ? (
              <EmptyState
                title="Sin datos"
                description="No hay multas en la consulta."
                icon={FileWarning}
              />
            ) : (
              <Table label="Top lugares por multas" rowCount={Math.min(20, multasPorLugar.length)}>
                <TableCaption className="sr-only">Top 20 lugares con mas multas</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Lugar</TableHead>
                    <TableHead className="text-right">Multas</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {multasPorLugar.slice(0, 20).map((r, idx) => (
                    <TableRow key={r.nombre}>
                      <TableCell className="font-mono text-muted-foreground">{idx + 1}</TableCell>
                      <TableCell className="font-medium">{r.nombre}</TableCell>
                      <TableCell className="text-right font-mono">{formatNumber(r.total)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}

export default PaginaMultasAccidentes;
