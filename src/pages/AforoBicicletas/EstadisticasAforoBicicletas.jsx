/**
 * Sub-componente EstadisticasAforoBicicletas
 *
 * Cuatro StatCards principales + banner ligero con bicicletas per capita.
 */

import { Activity, Bike, Clock, Radio } from 'lucide-react';
import { Card, CardContent } from '../../components/common';
import { StatCard } from '../../components/charts';
import { formatNumber } from '../../utils';

function EstadisticasAforoBicicletas({
  totalMediciones,
  totalBicicletas,
  promedioPorHora,
  totalEstaciones,
  bicicletasPerCapita,
  estadisticasCargando,
  estacionesCargando
}) {
  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total mediciones"
          value={formatNumber(totalMediciones)}
          icon={Activity}
          accent="cyan"
          isLoading={estadisticasCargando}
        />
        <StatCard
          title="Bicicletas contadas"
          value={formatNumber(totalBicicletas)}
          icon={Bike}
          accent="emerald"
          isLoading={estadisticasCargando}
        />
        <StatCard
          title="Promedio/hora"
          value={formatNumber(Math.round(promedioPorHora))}
          subtitle="Bicicletas por hora"
          icon={Clock}
          accent="amber"
          isLoading={estadisticasCargando}
        />
        <StatCard
          title="Estaciones activas"
          value={totalEstaciones}
          icon={Radio}
          accent="violet"
          isLoading={estacionesCargando}
        />
      </div>

      {bicicletasPerCapita && (
        <Card className="mb-6 border-[var(--border-emphasis)]">
          <CardContent className="py-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Bicicletas por cada 1.000 habitantes (datos del censo)
              </span>
              <span className="font-display text-lg font-bold text-foreground tabular-nums">
                {bicicletasPerCapita}
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}

export default EstadisticasAforoBicicletas;
