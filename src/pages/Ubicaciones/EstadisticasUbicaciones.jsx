/**
 * Sub-componente EstadisticasUbicaciones
 *
 * Cuatro StatCards con totales por tipo de infraestructura.
 */

import { MapPin, AudioLines, Car, Train } from 'lucide-react';
import { StatCard } from '../../components/charts';

function EstadisticasUbicaciones({ stats }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <StatCard
        title="Total"
        value={stats?.total ?? '-'}
        icon={MapPin}
        accent="cyan"
      />
      <StatCard
        title="Est. acusticas"
        value={stats?.estacion_acustica ?? '-'}
        icon={AudioLines}
        accent="violet"
      />
      <StatCard
        title="Puntos trafico"
        value={stats?.punto_trafico ?? '-'}
        icon={Car}
        accent="amber"
      />
      <StatCard
        title="Rutas transporte"
        value={stats?.rutas_transporte ?? '-'}
        icon={Train}
        accent="emerald"
      />
    </div>
  );
}

export default EstadisticasUbicaciones;
