/**
 * Hero/cabecera de la pagina por distrito.
 * Muestra el nombre del distrito, su codigo, y un breadcrumb a Censo.
 *
 * Subcomponente de PaginaDistrito.
 */

import { memo } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, MapPin } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Skeleton } from '../../../components/common';
import { ROUTES, DATE_CONFIG } from '../../../constants';
import { formatNumber, formatearNombreDistritoTitulo } from '../../../utils';

const HeroDistrito = memo(function HeroDistrito({ distrito, isLoading }) {
  if (isLoading || !distrito) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <Skeleton className="size-4 w-40 mb-2" />
          <Skeleton className="h-8 w-72" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-5 w-48" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <Link
          to={ROUTES.CENSO}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
        >
          <ChevronLeft className="size-4" />
          Volver al Censo
        </Link>
        <CardTitle className="flex items-center gap-3 text-3xl">
          <span className="inline-flex items-center justify-center size-10 rounded-xl bg-primary/15 text-primary">
            <MapPin className="size-5" aria-hidden="true" />
          </span>
          {formatearNombreDistritoTitulo(distrito.nombre)}
          <span className="text-base font-mono text-muted-foreground">
            (código {String(distrito.codigo).padStart(2, '0')})
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Resumen demográfico, accidentalidad, multas y movilidad del distrito {formatearNombreDistritoTitulo(distrito.nombre)} en {DATE_CONFIG.DATASET_YEAR}.
          Población registrada:{' '}
          <strong className="text-foreground">{formatNumber(distrito.totalPoblacion || 0)}</strong> habitantes.
        </p>
      </CardContent>
    </Card>
  );
});

export { HeroDistrito };
