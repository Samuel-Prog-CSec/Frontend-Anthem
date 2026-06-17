/**
 * Tarjetas KPI superiores del modulo Trafico.
 * Subcomponente de PaginaTrafico.
 */

import { memo } from 'react';
import { Activity, Gauge, AlertTriangle, ShieldCheck } from 'lucide-react';
import { StatCard } from '../../../components/charts';
import { Card, CardContent, ErrorState } from '../../../components/common';
import { formatNumber } from '../../../utils';

const TarjetasResumenTrafico = memo(function TarjetasResumenTrafico({
  resumen,
  serieIntensidad,
  isLoading,
  error,
  onReintentar
}) {
  // Nunca pintar ceros fabricados si la peticion de estadisticas fallo: mostrar
  // un estado de error claro con reintento (el endpoint es pesado y puede
  // exceder el limite con rangos grandes).
  if (error && !isLoading) {
    return (
      <Card className="mb-6">
        <CardContent>
          <ErrorState
            message="No se pudieron cargar las estadísticas de tráfico para este rango. Prueba con un rango menor o reinténtalo."
            onRetry={onReintentar}
          />
        </CardContent>
      </Card>
    );
  }

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
        subtitle="vehículos/hora"
        icon={Gauge}
        serie={serieIntensidad && serieIntensidad.length >= 2 ? serieIntensidad : undefined}
        isLoading={isLoading}
      />
      <StatCard
        title="Congestión"
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
