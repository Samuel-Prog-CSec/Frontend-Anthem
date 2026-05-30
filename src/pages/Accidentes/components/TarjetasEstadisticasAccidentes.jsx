/**
 * Tarjetas de estadisticas resumen de accidentes.
 * Subcomponente de PaginaAccidentes.
 */

import { memo } from 'react';
import { ShieldAlert, Skull, Wine, Users } from 'lucide-react';
import { StatCard } from '../../../components/charts';
import { formatNumber } from '../../../utils';

const TarjetasEstadisticasAccidentes = memo(function TarjetasEstadisticasAccidentes({
  estadisticas,
  estadisticasGenerales
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <StatCard
        title="Total Personas Afectadas"
        value={formatNumber(estadisticasGenerales?.totalAccidentes || estadisticas.totalPersonasAfectadas)}
        icon={Users}
      />
      <StatCard
        title="Accidentes Graves"
        value={formatNumber(estadisticasGenerales?.accidentesGraves || estadisticas.accidentesGraves)}
        subtitle={estadisticasGenerales ? 'total global' : 'en pagina actual'}
        icon={ShieldAlert}
      />
      <StatCard
        title="Accidentes Mortales"
        value={formatNumber(estadisticasGenerales?.accidentesMortales || estadisticas.accidentesMortales)}
        subtitle={estadisticasGenerales ? 'total global' : 'en pagina actual'}
        icon={Skull}
      />
      <StatCard
        title="Con Alcohol"
        value={formatNumber(
          estadisticasGenerales?.accidentesConAlcohol != null
            ? estadisticasGenerales.accidentesConAlcohol
            : estadisticas.conAlcohol
        )}
        subtitle={estadisticasGenerales?.accidentesConAlcohol != null ? 'total global' : 'en pagina actual'}
        icon={Wine}
      />
    </div>
  );
});

export { TarjetasEstadisticasAccidentes };
