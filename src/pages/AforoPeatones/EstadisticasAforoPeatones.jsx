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
  estadisticasCargando,
  estacionesCargando
}) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard
        title="Total Mediciones"
        value={formatNumber(totalMediciones)}
        icon={Activity}
        isLoading={estadisticasCargando}
      />
      <StatCard
        title="Peatones Contados"
        value={formatNumber(totalPeatones)}
        icon={Users}
        isLoading={estadisticasCargando}
      />
      <StatCard
        title="Promedio/Hora"
        value={formatNumber(Math.round(promedioPorHora || 0))}
        subtitle="Peatones por hora"
        icon={Clock}
        isLoading={estadisticasCargando}
      />
      <StatCard
        title="Estaciones Activas"
        value={totalEstaciones}
        icon={Radio}
        isLoading={estacionesCargando}
      />
    </div>
  );
}

export default memo(EstadisticasAforoPeatones);
