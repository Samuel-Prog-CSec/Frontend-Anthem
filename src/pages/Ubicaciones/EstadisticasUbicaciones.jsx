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
        accent="dominio"
      />
      <StatCard
        title="Est. acústicas"
        value={stats?.estacion_acustica ?? '-'}
        icon={AudioLines}
        accent="dominio"
      />
      <StatCard
        title="Puntos tráfico"
        value={stats?.punto_trafico ?? '-'}
        icon={Car}
        accent="dominio"
      />
      <StatCard
        title="Rutas transporte"
        value={stats?.rutas_transporte ?? '-'}
        icon={Train}
        accent="dominio"
      />
    </div>
  );
}

export default EstadisticasUbicaciones;
