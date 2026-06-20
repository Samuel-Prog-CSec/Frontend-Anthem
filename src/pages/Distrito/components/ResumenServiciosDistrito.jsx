/**
 * Resumen de servicios urbanos en el distrito.
 *
 * BI cross-project: cruza Contenedores con Censo (poblacion total) para
 * calcular cobertura per capita por tipo de residuo.
 *
 * Subcomponente de PaginaDistrito.
 */

import { memo, useMemo } from 'react';
import { Recycle, ArrowRight } from 'lucide-react';
import {
  Card, CardHeader, CardTitle, CardDescription, CardContent,
  Badge, Skeleton, EmptyState
} from '../../../components/common';
import { Button } from '../../../components/common';
import { Link } from 'react-router-dom';
import { useContenedoresPorDistrito } from '../../../api/hooks';
import { formatNumber } from '../../../utils';
import { ROUTES, CONTAINER_TYPE_LABELS } from '../../../constants';

const ResumenServiciosDistrito = memo(function ResumenServiciosDistrito({
  nombreDistrito,
  totalPoblacion
}) {
  const {
    data: contenedoresResult,
    isLoading: cargando
  } = useContenedoresPorDistrito(nombreDistrito);

  const stats = useMemo(() => {
    const lista = contenedoresResult?.data?.estadisticas || [];
    if (!Array.isArray(lista) || lista.length === 0) {return null;}
    // Sin fallback a lista[0]: si el distrito buscado no aparece, mostrar estado
    // vacio en vez de las estadisticas de OTRO distrito (el primero del array).
    const distritoStats = lista.find(d => (d.distrito || '').toUpperCase() === (nombreDistrito || '').toUpperCase());
    if (!distritoStats) {return null;}

    const totalContenedores = distritoStats.totalGeneral || 0;
    const porTipo = distritoStats.contenedoresPorTipo || [];
    const cobertura = totalPoblacion > 0
      ? (totalContenedores / totalPoblacion) * 1000 // contenedores por 1000 hab
      : null;

    return { totalContenedores, porTipo, cobertura };
  }, [contenedoresResult, nombreDistrito, totalPoblacion]);

  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div className="flex-1">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Recycle className="size-5" aria-hidden="true" />
            Servicios urbanos
          </CardTitle>
          <CardDescription>
            Cobertura de contenedores y reciclaje en el distrito.
            {totalPoblacion > 0 && stats?.cobertura != null && (
              <> {formatNumber(stats.cobertura, 2)} contenedores por 1.000 habitantes.</>
            )}
          </CardDescription>
        </div>
        {nombreDistrito && (
          <Button asChild variant="outline" size="sm">
            <Link to={`${ROUTES.CONTENEDORES}?distrito=${encodeURIComponent(nombreDistrito)}`}>
              Ver detalle
              <ArrowRight className="size-4 ml-2" aria-hidden="true" />
            </Link>
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {cargando ? (
          <Skeleton className="h-24 w-full" />
        ) : !stats ? (
          <EmptyState
            title="Sin datos de contenedores"
            description="No hay registros de contenedores para este distrito."
            icon={Recycle}
          />
        ) : (
          <>
            <div className="mb-4 flex items-baseline gap-3">
              <span className="text-3xl font-bold text-foreground">
                {formatNumber(stats.totalContenedores)}
              </span>
              <span className="text-sm text-muted-foreground">
                contenedores totales
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {stats.porTipo.map(item => (
                <Badge
                  key={item.tipo}
                  variant="secondary"
                  className="text-xs"
                  title={`${formatNumber(item.ubicaciones)} puntos de aportación`}
                >
                  {CONTAINER_TYPE_LABELS[item.tipo] || item.tipo}: {formatNumber(item.total)}
                </Badge>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
});

export { ResumenServiciosDistrito };
