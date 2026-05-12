/**
 * Tarjetas de estadisticas resumen de asignacion de patinetes.
 * Subcomponente de PaginaPatinetes.
 */

import { memo } from 'react';
import { Zap, MapPin, BarChart3, Users } from 'lucide-react';
import { StatCard } from '../../../components/charts';
import { formatNumber } from '../../../utils';

const TarjetasEstadisticasPatinetes = memo(function TarjetasEstadisticasPatinetes({ estadisticas }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <StatCard
        title="Total Patinetes"
        value={formatNumber(estadisticas.totalPatinetes)}
        icon={Zap}
      />
      <StatCard
        title="Areas Registradas"
        value={estadisticas.totalAreas}
        icon={MapPin}
      />
      <StatCard
        title="Promedio por Barrio"
        value={formatNumber(Math.round(estadisticas.promedioPorBarrio))}
        icon={BarChart3}
      />
      <StatCard
        title="Proveedores Activos"
        value={Math.round(estadisticas.proveedoresActivos)}
        subtitle="promedio por area"
        icon={Users}
      />
    </div>
  );
});

export { TarjetasEstadisticasPatinetes };
