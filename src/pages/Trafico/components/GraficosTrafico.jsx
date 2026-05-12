/**
 * Bloque de graficos del modulo Trafico:
 *   - Congestion por distrito (bar)
 *   - Distribucion horaria de la intensidad (bar/line)
 *
 * Subcomponente de PaginaTrafico.
 */

import { memo, useMemo } from 'react';
import { BarChartCard } from '../../../components/charts';

const GraficosTrafico = memo(function GraficosTrafico({
  analisisCongestion,
  distribucionHoraria,
  isLoading
}) {
  const datosCongestion = useMemo(() => {
    if (!Array.isArray(analisisCongestion)) {return [];}
    return [...analisisCongestion]
      .filter(d => d.zona)
      .sort((a, b) => (b.porcentajeCongestion || 0) - (a.porcentajeCongestion || 0))
      .slice(0, 12)
      .map(d => ({
        name: d.zona,
        congestion: d.porcentajeCongestion || 0,
        fluido: d.porcentajeFluido || 0
      }));
  }, [analisisCongestion]);

  const datosHorarios = useMemo(() => {
    if (!Array.isArray(distribucionHoraria)) {return [];}
    return distribucionHoraria.map(d => ({
      name: d.periodo || '-',
      intensidad: d.intensidadPromedio || 0,
      congestion: d.nivelCongestion || 0
    }));
  }, [distribucionHoraria]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <BarChartCard
        title="Top 12 zonas por congestion (%)"
        data={datosCongestion}
        xKey="name"
        bars={[
          { key: 'congestion', name: 'Congestion', color: '#ef4444' },
          { key: 'fluido', name: 'Fluido', color: '#10b981' }
        ]}
        height={320}
        isLoading={isLoading}
      />
      <BarChartCard
        title="Intensidad por periodo del dia"
        data={datosHorarios}
        xKey="name"
        bars={[
          { key: 'intensidad', name: 'Intensidad media', color: '#06b6d4' }
        ]}
        height={320}
        isLoading={isLoading}
      />
    </div>
  );
});

export { GraficosTrafico };
