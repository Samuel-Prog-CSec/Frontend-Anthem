/**
 * Tarjetas KPI superiores del modulo Trafico.
 * Subcomponente de PaginaTrafico.
 */

import { memo } from 'react';
import { Activity, Gauge, AlertTriangle, ShieldCheck } from 'lucide-react';
import { StatCard } from '../../../components/charts';
import { formatNumber } from '../../../utils';

const TarjetasResumenTrafico = memo(function TarjetasResumenTrafico({
  resumen,
  isLoading
}) {
  const totalMediciones = resumen?.totalMediciones || 0;
  const intensidadPromedio = resumen?.intensidadPromedio || 0;
  const porcentajeCongestion = resumen?.porcentajeCongestion || 0;
  const porcentajeConfiabilidad = resumen?.porcentajeConfiabilidad || 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <StatCard
        title="Mediciones"
        value={formatNumber(totalMediciones)}
        subtitle="en el rango filtrado"
        icon={Activity}
        isLoading={isLoading}
      />
      <StatCard
        title="Intensidad media"
        value={`${formatNumber(intensidadPromedio, 0)}`}
        subtitle="vehiculos/hora"
        icon={Gauge}
        isLoading={isLoading}
      />
      <StatCard
        title="Congestion"
        value={`${formatNumber(porcentajeCongestion, 1)}%`}
        subtitle="del total de mediciones"
        icon={AlertTriangle}
        isLoading={isLoading}
      />
      <StatCard
        title="Confiabilidad"
        value={`${formatNumber(porcentajeConfiabilidad, 1)}%`}
        subtitle="datos de calidad"
        icon={ShieldCheck}
        isLoading={isLoading}
      />
    </div>
  );
});

export { TarjetasResumenTrafico };
