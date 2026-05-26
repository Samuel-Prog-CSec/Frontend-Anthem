/**
 * Sub-componente EstadisticasCenso
 *
 * Cuatro StatCards con metricas del resumen general del censo.
 */

import { Users, Globe, UserCheck, MapPin } from 'lucide-react';
import { StatCard } from '../../components/charts';
import { formatNumber } from '../../utils';
import { formatearPorcentaje } from './helpers';

function EstadisticasCenso({
  poblacionTotal,
  porcentajeExtranjeros,
  ratioGenero,
  totalDistritos,
  isLoading
}) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard
        title="Poblacion total"
        value={formatNumber(poblacionTotal)}
        icon={Users}
        accent="cyan"
        isLoading={isLoading}
      />
      <StatCard
        title="% Extranjeros"
        value={formatearPorcentaje(porcentajeExtranjeros)}
        icon={Globe}
        accent="violet"
        isLoading={isLoading}
      />
      <StatCard
        title="Ratio H/M"
        value={ratioGenero ? ratioGenero.toFixed(2) : '-'}
        subtitle="Hombres por mujer"
        icon={UserCheck}
        accent="emerald"
        isLoading={isLoading}
      />
      <StatCard
        title="Distritos"
        value={totalDistritos}
        icon={MapPin}
        accent="amber"
        isLoading={isLoading}
      />
    </div>
  );
}

export default EstadisticasCenso;
