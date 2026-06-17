/**
 * Correlacion Censo x Contenedores
 *
 * Calcula y visualiza la cobertura de contenedores por cada 1.000 habitantes
 * en cada distrito, cruzando:
 *   - useCensoResumenDistritos: poblacion total por distrito
 *   - useContenedoresPorDistrito (sin filtro): contenedores por distrito
 *
 * Detecta distritos infra-cubiertos o sobre-cubiertos respecto a la media.
 */

import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Recycle, Users, Award, AlertTriangle } from 'lucide-react';
import { PageLayout } from '../../components/layout';
import {
  Card, CardHeader, CardTitle, CardDescription, CardContent,
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell, TableCaption,
  Badge, Button, EmptyState, TableSkeleton
} from '../../components/common';
import { StatCard } from '../../components/charts';
import { BarChartCard, ScatterChartCard } from '../../components/charts/Charts';
import { useCensoResumenDistritos, useContenedoresPorDistrito } from '../../api/hooks';
import { ROUTES, DATE_CONFIG, CHART_COLORS } from '../../constants';
import { formatNumber, formatearNombreDistritoTitulo } from '../../utils';

function clasificarCobertura(ratio, media) {
  if (!Number.isFinite(ratio) || !Number.isFinite(media) || media === 0) {return 'desconocida';}
  if (ratio < media * 0.7) {return 'infra';}
  if (ratio > media * 1.3) {return 'sobre';}
  return 'normal';
}

function variantePorClasificacion(clasificacion) {
  switch (clasificacion) {
    case 'infra': return 'destructive';
    case 'sobre': return 'info';
    case 'normal': return 'success';
    default: return 'secondary';
  }
}

function etiquetaClasificacion(clasificacion) {
  switch (clasificacion) {
    case 'infra': return 'Infra-cubierto';
    case 'sobre': return 'Sobre-cubierto';
    case 'normal': return 'Cobertura normal';
    default: return 'Sin datos';
  }
}

function PaginaCensoContenedores() {
  const {
    data: censoResult,
    isLoading: cargandoCenso
  } = useCensoResumenDistritos({ año: DATE_CONFIG.DATASET_YEAR });
  const {
    data: contenedoresResult,
    isLoading: cargandoContenedores
  } = useContenedoresPorDistrito();

  const cargando = cargandoCenso || cargandoContenedores;

  const filas = useMemo(() => {
    const distritos = censoResult?.data?.data || censoResult?.data || [];
    const stats = contenedoresResult?.data?.estadisticas || [];
    if (!distritos.length || !stats.length) {return [];}

    // Indexar contenedores por nombre de distrito (uppercase)
    const indexContenedores = new Map();
    stats.forEach(s => {
      if (s.distrito) {indexContenedores.set(s.distrito.toUpperCase(), s);}
    });

    return distritos.map(d => {
      const nombre = d.nombre || d._id;
      const poblacion = d.totalPoblacion || 0;
      const stat = indexContenedores.get((nombre || '').toUpperCase());
      const totalContenedores = stat?.totalGeneral || 0;
      const ratio = poblacion > 0 ? (totalContenedores / poblacion) * 1000 : 0;
      return {
        codigo: d.codigo || d.cod_distrito,
        distrito: nombre,
        poblacion,
        totalContenedores,
        ratio
      };
    });
  }, [censoResult, contenedoresResult]);

  const mediaRatio = useMemo(() => {
    const conDatos = filas.filter(f => Number.isFinite(f.ratio) && f.ratio > 0);
    if (!conDatos.length) {return 0;}
    return conDatos.reduce((sum, f) => sum + f.ratio, 0) / conDatos.length;
  }, [filas]);

  const filasOrdenadas = useMemo(() => {
    return [...filas]
      .filter(f => f.ratio > 0)
      .sort((a, b) => b.ratio - a.ratio)
      .map(f => ({ ...f, clasificacion: clasificarCobertura(f.ratio, mediaRatio) }));
  }, [filas, mediaRatio]);

  const datosGrafico = useMemo(() => {
    return filasOrdenadas.map(f => ({
      name: formatearNombreDistritoTitulo(f.distrito),
      ratio: Number(f.ratio.toFixed(2))
    }));
  }, [filasOrdenadas]);

  // Datos del scatter de RELACION: un punto por distrito (poblacion vs
  // contenedores), coloreado por clasificacion de cobertura. Revela si los
  // contenedores escalan con la poblacion y que distritos se desvian.
  const datosScatter = useMemo(() => {
    return filasOrdenadas.map(f => ({
      nombre: formatearNombreDistritoTitulo(f.distrito),
      poblacion: f.poblacion,
      contenedores: f.totalContenedores,
      color: f.clasificacion === 'infra'
        ? CHART_COLORS.danger
        : f.clasificacion === 'sobre'
          ? CHART_COLORS.quaternary
          : CHART_COLORS.secondary
    }));
  }, [filasOrdenadas]);

  const totales = useMemo(() => {
    const infraCount = filasOrdenadas.filter(f => f.clasificacion === 'infra').length;
    const sobreCount = filasOrdenadas.filter(f => f.clasificacion === 'sobre').length;
    return { infraCount, sobreCount, total: filasOrdenadas.length };
  }, [filasOrdenadas]);

  return (
    <PageLayout
      title="Censo vs. Contenedores"
      description="Cobertura de contenedores por 1.000 habitantes en cada distrito."
      actions={
        <Button asChild variant="outline" size="sm">
          <Link to={ROUTES.CORRELACIONES}>
            <ArrowLeft className="size-4 mr-2" aria-hidden="true" />
            Volver a correlaciones
          </Link>
        </Button>
      }
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Distritos analizados"
          value={formatNumber(totales.total)}
          icon={Users}
          isLoading={cargando}
        />
        <StatCard
          title="Cobertura media"
          value={`${formatNumber(mediaRatio, 2)}`}
          subtitle="por 1.000 habitantes"
          icon={Recycle}
          isLoading={cargando}
        />
        <StatCard
          title="Infra-cubiertos"
          value={formatNumber(totales.infraCount)}
          subtitle="<70% de la media"
          icon={AlertTriangle}
          isLoading={cargando}
        />
        <StatCard
          title="Sobre-cubiertos"
          value={formatNumber(totales.sobreCount)}
          subtitle=">130% de la media"
          icon={Award}
          isLoading={cargando}
        />
      </div>

      <ScatterChartCard
        title="Relación: población vs. contenedores por distrito"
        data={datosScatter}
        xKey="poblacion"
        yKey="contenedores"
        xName="Población"
        yName="Contenedores"
        nameKey="nombre"
        height={380}
        isLoading={cargando}
      />
      <p className="mt-2 mb-6 text-xs leading-relaxed text-muted-foreground">
        Cada punto es un distrito. Rojo: infra-cubierto; violeta: sobre-cubierto;
        teal: cobertura normal. Los puntos por encima de la nube tienen más
        contenedores de los que su población sugeriría, y al revés.
      </p>

      <BarChartCard
        title="Ranking de cobertura por distrito (contenedores / 1.000 habitantes)"
        data={datosGrafico}
        xKey="name"
        bars={[{ key: 'ratio', name: 'Cobertura', color: CHART_COLORS.secondary }]}
        height={360}
        isLoading={cargando}
        referenceLines={mediaRatio > 0 ? [{ y: Number(mediaRatio.toFixed(2)), label: 'Media', color: CHART_COLORS.primary }] : []}
      />

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Detalle por distrito</CardTitle>
          <CardDescription>
            Distritos con clasificación de cobertura. Los distritos infra-cubiertos pueden necesitar refuerzo del servicio.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {cargando ? (
            <TableSkeleton rows={8} columns={5} />
          ) : filasOrdenadas.length === 0 ? (
            <EmptyState
              title="Sin datos cruzados"
              description="No se pudieron cruzar datos de Censo y Contenedores."
              icon={Recycle}
            />
          ) : (
            <Table label="Cobertura por distrito" rowCount={filasOrdenadas.length}>
              <TableCaption className="sr-only">Detalle de cobertura por distrito</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Distrito</TableHead>
                  <TableHead className="text-right">Población</TableHead>
                  <TableHead className="text-right">Contenedores</TableHead>
                  <TableHead className="text-right">Por 1.000 hab.</TableHead>
                  <TableHead className="text-center">Clasificación</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filasOrdenadas.map(f => (
                  <TableRow key={f.distrito}>
                    <TableCell className="font-medium text-info">{formatearNombreDistritoTitulo(f.distrito)}</TableCell>
                    <TableCell className="text-right font-mono">{formatNumber(f.poblacion)}</TableCell>
                    <TableCell className="text-right font-mono">{formatNumber(f.totalContenedores)}</TableCell>
                    <TableCell className="text-right font-mono text-foreground">{formatNumber(f.ratio, 2)}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={variantePorClasificacion(f.clasificacion)}>
                        {etiquetaClasificacion(f.clasificacion)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {Number.isFinite(f.codigo) && (
                        <Button asChild variant="ghost" size="sm">
                          <Link to={ROUTES.DISTRITO_PATH(f.codigo)}>Ver distrito</Link>
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </PageLayout>
  );
}

export default PaginaCensoContenedores;
