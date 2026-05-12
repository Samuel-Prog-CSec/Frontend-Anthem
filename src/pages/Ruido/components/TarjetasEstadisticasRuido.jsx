/**
 * Tarjetas de estadisticas resumen de mediciones de ruido.
 * Subcomponente de PaginaRuido.
 */

import { memo } from 'react';
import { Volume2, Sun, Sunset, Moon, AlertTriangle } from 'lucide-react';
import { StatCard } from '../../../components/charts';
import { formatDecibels } from '../../../utils';

const TarjetasEstadisticasRuido = memo(function TarjetasEstadisticasRuido({ estadisticas }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <StatCard
        title="Promedio LAeq24"
        value={formatDecibels(estadisticas.promedioLaeq)}
        icon={Volume2}
      />
      <StatCard
        title="Promedio Diurno"
        value={formatDecibels(estadisticas.promedioDiurno)}
        subtitle="07:00 - 19:00"
        icon={Sun}
      />
      <StatCard
        title="Promedio Vespertino"
        value={formatDecibels(estadisticas.promedioVespertino)}
        subtitle="19:00 - 23:00"
        icon={Sunset}
      />
      <StatCard
        title="Promedio Nocturno"
        value={formatDecibels(estadisticas.promedioNocturno)}
        subtitle="23:00 - 07:00"
        icon={Moon}
      />
      <StatCard
        title="Exceden Limite"
        value={estadisticas.cantidadExceden}
        subtitle="mediciones"
        icon={AlertTriangle}
      />
    </div>
  );
});

export { TarjetasEstadisticasRuido };
