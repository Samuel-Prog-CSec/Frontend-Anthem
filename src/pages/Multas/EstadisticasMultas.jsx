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
          accent="dominio"
          isLoading={isLoading}
        />
        <StatCard
          title="Importe medio"
          value={formatearImporte(importeMedio)}
          icon={Banknote}
          accent="dominio"
          isLoading={isLoading}
        />
        <StatCard
          title="Puntos totales"
          value={formatNumber(puntosTotales)}
          subtitle="Puntos detraídos"
          icon={AlertOctagon}
          accent="dominio"
          isLoading={isLoading}
        />
        <StatCard
          title="% Graves + muy graves"
          value={Number.isFinite(Number(porcentajeGraves)) ? `${Number(porcentajeGraves).toFixed(1)}%` : '-'}
          icon={ShieldAlert}
          accent="dominio"
          isLoading={isLoading}
        />
      </div>

      {distritoFiltrado ? (
        <Card className="mb-6 border-warning/20 bg-warning/5">
          <CardContent className="py-3">
            <div className="flex items-start gap-3">
              <Info className="size-4 text-warning mt-0.5 shrink-0" aria-hidden="true" />
              <p className="text-sm text-muted-foreground">
                El dataset de multas no incluye distrito normalizado, así que el
                total y la métrica per cápita siguen siendo de toda Anthem
                aunque tengas el filtro <strong className="text-foreground">{distritoFiltrado}</strong> activo.
                Para datos por distrito consulta la página del distrito con la estimación por zona.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : multasPerCapita ? (
        <Card className="mb-6 border-[var(--border-emphasis)]">
          <CardContent className="py-3">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-muted-foreground">
                Multas por cada 1.000 habitantes (Anthem 2051 entero, censo del último mes)
              </span>
              <span className="font-display text-lg font-bold text-foreground tabular-nums">
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
