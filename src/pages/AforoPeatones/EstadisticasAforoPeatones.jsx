/**
 * Tarjetas de estadisticas para Aforo de Peatones.
 */

import { memo } from 'react';
import { Activity, Users, Clock, Radio } from 'lucide-react';
import { StatCard } from '../../components/charts';
import { formatNumber } from '../../utils';

function EstadisticasAforoPeatones({
  totalMediciones,
  totalPeatones,
  promedioPorHora,
  totalEstaciones,
  seriePatronHorario,
  estadisticasCargando,
  estacionesCargando
}) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard
        title="Total mediciones"
        value={formatNumber(totalMediciones)}
        icon={Activity}
        isLoading={estadisticasCargando}
      />
      <StatCard
        title="Peatones contados"
        value={formatNumber(totalPeatones)}
        icon={Users}
        isLoading={estadisticasCargando}
      />
      <StatCard
        title="Promedio/hora"
        value={formatNumber(Math.round(promedioPorHora || 0))}
        subtitle="Peatones por hora"
        icon={Clock}
        serie={seriePatronHorario}
        isLoading={estadisticasCargando}
      />
      <StatCard
        title="Estaciones activas"
        value={totalEstaciones}
        icon={Radio}
        isLoading={estacionesCargando}
      />
    </div>
  );
}

export default memo(EstadisticasAforoPeatones);
