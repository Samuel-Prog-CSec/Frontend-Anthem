/**
 * Sub-componente EstadisticasMultas
 *
 * Fila de 4 StatCards principales + un banner ligero con la metrica
 * cruzada (multas / 1000 habitantes) extraida del censo.
 */

import { FileWarning, Banknote, AlertOctagon, ShieldAlert } from 'lucide-react';
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

      {multasPerCapita && (
        <Card className="mb-6 border-cyan-500/20">
          <CardContent className="py-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Multas por cada 1.000 habitantes (datos del censo)
              </span>
              <span className="font-display text-lg font-bold text-cyan-400 tabular-nums">
                {multasPerCapita}
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}

export default EstadisticasMultas;
