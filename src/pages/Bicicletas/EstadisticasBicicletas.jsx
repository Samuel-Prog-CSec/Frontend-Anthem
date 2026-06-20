/**
 * Sub-componente EstadisticasBicicletas
 *
 * Cuatro StatCards con los indicadores principales del servicio.
 */

import { TrendingUp, Bike, Clock, BarChart3 } from 'lucide-react';
import { StatCard } from '../../components/charts';
import { formatNumber } from '../../utils';

function EstadisticasBicicletas({ stats, serieUsosDiarios, isLoading }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <StatCard
        title="Promedio usos diarios"
        value={formatNumber(stats.promedioUsosDiarios, 0)}
        icon={TrendingUp}
        accent="dominio"
        serie={serieUsosDiarios}
        isLoading={isLoading}
      />
      <StatCard
        title="Media bicis disponibles"
        value={formatNumber(stats.mediaBicisDisponibles, 1)}
        icon={Bike}
        accent="dominio"
        isLoading={isLoading}
      />
      <StatCard
        title="Tasa ocupación"
        value={`${formatNumber(stats.tasaOcupacion, 1)}%`}
        icon={Clock}
        accent="dominio"
        isLoading={isLoading}
      />
      <StatCard
        title="Total registros"
        value={formatNumber(stats.totalRegistros)}
        icon={BarChart3}
        accent="dominio"
        isLoading={isLoading}
      />
    </div>
  );
}

export default EstadisticasBicicletas;
