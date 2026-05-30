/**
 * Sub-componente EstadisticasMultas
 *
 * Fila de 4 StatCards principales + un banner con la metrica cruzada
 * `multas / 1000 habitantes` calculada con el censo.
 *
 * Nota sobre el dataset: el CSV de multas NO trae el distrito
 * normalizado, asi que `totalMultas` siempre es el global (1,99 M),
 * tambien cuando el usuario tiene un filtro geografico activo.
 * Cuando ese filtro esta activo:
 *   - El total y los porcentajes siguen siendo de toda Anthem.
 *   - El banner per-capita se suprime y se sustituye por una nota
 *     explicativa para no inducir a interpretar "598 multas/1.000 hab
 *     del distrito CENTRO".
 */

import { FileWarning, Banknote, AlertOctagon, ShieldAlert, Info } from 'lucide-react';
import { Card, CardContent } from '../../components/common';
import { StatCard } from '../../components/charts';
import { formatNumber } from '../../utils';
import { formatearImporte } from './helpers';

function EstadisticasMultas({
  totalMultas,
  importeMedio,
  puntosTotales,
  porcentajeGraves,
  multasPerCapita,
  distritoFiltrado,
  isLoading
}) {
  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total multas"
          value={formatNumber(totalMultas)}
          icon={FileWarning}
          accent="cyan"
          isLoading={isLoading}
        />
        <StatCard
          title="Importe medio"
          value={formatearImporte(importeMedio)}
          icon={Banknote}
          accent="emerald"
          isLoading={isLoading}
        />
        <StatCard
          title="Puntos totales"
          value={formatNumber(puntosTotales)}
          subtitle="Puntos detraidos"
          icon={AlertOctagon}
          accent="amber"
          isLoading={isLoading}
        />
        <StatCard
          title="% Graves + muy graves"
          value={porcentajeGraves ? `${Number(porcentajeGraves).toFixed(1)}%` : '-'}
          icon={ShieldAlert}
          accent="rose"
          isLoading={isLoading}
        />
      </div>

      {distritoFiltrado ? (
        <Card className="mb-6 border-amber-500/20">
          <CardContent className="py-3">
            <div className="flex items-start gap-3">
              <Info className="size-4 text-amber-400 mt-0.5 flex-shrink-0" aria-hidden="true" />
              <p className="text-sm text-muted-foreground">
                El dataset de multas no incluye distrito normalizado, asi que el
                total y la metrica per capita siguen siendo de toda Anthem
                aunque tengas el filtro <strong className="text-foreground">{distritoFiltrado}</strong> activo.
                Para distrito ver la pagina del distrito con la aproximacion por bbox.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : multasPerCapita ? (
        <Card className="mb-6 border-cyan-500/20">
          <CardContent className="py-3">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-muted-foreground">
                Multas por cada 1.000 habitantes (Anthem 2051 entero, censo del ultimo mes)
              </span>
              <span className="font-display text-lg font-bold text-cyan-400 tabular-nums">
                {multasPerCapita}
              </span>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </>
  );
}

export default EstadisticasMultas;
