/**
 * Graficos de accidentes (bar chart top distritos + pie chart por tipo).
 * Subcomponente de PaginaAccidentes.
 */

import { memo } from 'react';
import { BarChartCard, PieChartCard } from '../../../components/charts';

const BARS_TOP_DISTRITOS = [{ key: 'totalAccidentes', name: 'Total accidentes', color: '#ef4444' }];

const GraficosAccidentes = memo(function GraficosAccidentes({
  datosGrafico,
  datosGraficoPastel
}) {
  if (datosGrafico.length === 0 && datosGraficoPastel.length === 0) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      {datosGrafico.length > 0 && (
        <BarChartCard
          title="Top 10 Distritos por Accidentes"
          data={datosGrafico}
          xKey="distrito"
          bars={BARS_TOP_DISTRITOS}
          height={280}
        />
      )}
      {datosGraficoPastel.length > 0 && (
        <PieChartCard
          title="Distribucion por Tipo de Accidente"
          data={datosGraficoPastel}
          height={280}
        />
      )}
    </div>
  );
});

export { GraficosAccidentes };
