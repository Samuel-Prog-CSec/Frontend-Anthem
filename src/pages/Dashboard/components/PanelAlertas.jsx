/**
 * Componente PanelAlertas
 *
 * Banda de "señales" del centro de control: convierte el dashboard de un
 * catalogo de totales en una vista accionable, destacando indicadores que
 * requieren atencion. Esta primera version cubre seguridad vial (la senal
 * mas critica de una Smart City) a partir de las estadisticas de
 * accidentalidad de 2051, que ya vienen agregadas por accidente (expediente)
 * desde el backend. Cada senal enlaza con su vista detallada.
 */

import { memo, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Skull, MapPin, ArrowRight } from 'lucide-react';
import {
  Card, CardHeader, CardTitle, CardDescription, CardContent, Skeleton
} from '../../../components/common';
import { useAccidentesEstadisticas } from '../../../api/hooks';
import { ROUTES, DATE_CONFIG } from '../../../constants';
import { formatNumber } from '../../../utils';

const RANGO_DATASET = {
  startDate: `${DATE_CONFIG.DATASET_YEAR}-01-01`,
  endDate: `${DATE_CONFIG.DATASET_YEAR}-12-31`
};

const PanelAlertas = memo(function PanelAlertas() {
  const { data, isLoading } = useAccidentesEstadisticas(RANGO_DATASET);

  const senales = useMemo(() => {
    const resumen = data?.data?.resumen || {};
    const puntosNegros = data?.data?.puntosNegros || [];
    const distritos = data?.data?.distribucionDistritos || [];
    const calleTop = puntosNegros[0];
    const distritoTop = distritos[0];
    return {
      mortales: resumen.accidentesMortales ?? 0,
      totalAccidentes: resumen.totalAccidentes ?? 0,
      calleTop: calleTop
        ? { calle: calleTop._id?.calle, distrito: calleTop._id?.distrito, total: calleTop.totalAccidentes }
        : null,
      distritoTop: distritoTop
        ? { nombre: distritoTop._id, total: distritoTop.totalAccidentes }
        : null
    };
  }, [data]);

  return (
    <Card className="mb-12">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <ShieldAlert className="size-5 text-destructive" aria-hidden="true" />
          Senales de seguridad vial
        </CardTitle>
        <CardDescription>
          Indicadores de atencion de la accidentalidad en {DATE_CONFIG.DATASET_YEAR}.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-28 w-full rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Skull className="size-4 text-destructive" aria-hidden="true" />
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                  Victimas mortales
                </p>
              </div>
              <p className="stat-number text-3xl text-foreground">{formatNumber(senales.mortales)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                de {formatNumber(senales.totalAccidentes)} accidentes
              </p>
            </div>

            <div className="rounded-lg border border-border p-4">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="size-4 text-warning" aria-hidden="true" />
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                  Calle mas peligrosa
                </p>
              </div>
              <p className="font-medium text-sm text-foreground truncate" title={senales.calleTop?.calle || ''}>
                {senales.calleTop?.calle || '—'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {senales.calleTop
                  ? `${formatNumber(senales.calleTop.total)} accidentes - ${senales.calleTop.distrito}`
                  : 'Sin datos'}
              </p>
            </div>

            <div className="rounded-lg border border-border p-4">
              <div className="flex items-center gap-2 mb-2">
                <ShieldAlert className="size-4 text-warning" aria-hidden="true" />
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                  Distrito mas accidentado
                </p>
              </div>
              <p className="font-medium text-sm text-foreground truncate" title={senales.distritoTop?.nombre || ''}>
                {senales.distritoTop?.nombre || '—'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {senales.distritoTop ? `${formatNumber(senales.distritoTop.total)} accidentes` : 'Sin datos'}
              </p>
            </div>
          </div>
        )}

        <Link
          to={ROUTES.ACCIDENTES}
          className="inline-flex items-center gap-1 mt-4 text-primary hover:opacity-80 text-sm font-medium"
        >
          Ver analisis de accidentalidad
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </CardContent>
    </Card>
  );
});

export { PanelAlertas };
