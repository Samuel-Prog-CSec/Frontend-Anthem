/**
 * Tarjetas de estadisticas resumen de accidentes.
 * Subcomponente de PaginaAccidentes.
 */

import { memo } from 'react';
import { ShieldAlert, Skull, CarFront, Users } from 'lucide-react';
import { StatCard } from '../../../components/charts';
import { formatNumber } from '../../../utils';

const TarjetasEstadisticasAccidentes = memo(function TarjetasEstadisticasAccidentes({
  estadisticas,
  estadisticasGenerales
}) {
  // Un accidente (expediente) puede afectar a varias personas; por eso se
  // distinguen "Accidentes" (expedientes unicos) de "Personas afectadas"
  // (filas). El backend ya devuelve ambas metricas en data.resumen.
  const global = Boolean(estadisticasGenerales);
  const subtitle = global ? 'total del periodo' : 'en página actual';

  const totalAccidentes = estadisticasGenerales?.totalAccidentes ?? estadisticas.totalAccidentes;
  const totalAfectados = estadisticasGenerales?.totalAfectados ?? estadisticas.totalPersonasAfectadas;
  const graves = estadisticasGenerales?.accidentesGraves ?? estadisticas.accidentesGraves;
  const mortales = estadisticasGenerales?.accidentesMortales ?? estadisticas.accidentesMortales;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <StatCard
        title="Accidentes"
        value={formatNumber(totalAccidentes)}
        subtitle="expedientes únicos"
        icon={CarFront}
      />
      <StatCard
        title="Personas afectadas"
        value={formatNumber(totalAfectados)}
        subtitle="conductores, peatones y pasajeros"
        icon={Users}
      />
      {/* `graves` (esGrave del backend) cuenta accidentes NO leves, e INCLUYE
          los mortales (umbral de severidad grave+mortal). El titulo lo refleja
          para no dar a entender que "graves" y "mortales" son disjuntos: al
          filtrar por gravedad=Mortal ambas tarjetas coinciden, que es correcto. */}
      <StatCard
        title="Graves y mortales"
        value={formatNumber(graves)}
        subtitle={subtitle}
        icon={ShieldAlert}
      />
      <StatCard
        title="Accidentes mortales"
        value={formatNumber(mortales)}
        subtitle={subtitle}
        icon={Skull}
      />
    </div>
  );
});

export { TarjetasEstadisticasAccidentes };
