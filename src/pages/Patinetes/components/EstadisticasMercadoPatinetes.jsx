/**
 * Graficos de mercado de patinetes (bar chart por distrito + pie chart por proveedor).
 * Subcomponente de PaginaPatinetes.
 */

import { memo } from 'react';
import { BarChartCard, PieChartCard } from '../../../components/charts';
import { CHART_COLORS } from '../../../constants';

const BARS_PATINETES = [{ key: 'totalPatinetes', name: 'Total patinetes', color: CHART_COLORS.primary }];

const EstadisticasMercadoPatinetes = memo(function EstadisticasMercadoPatinetes({
  datosGrafico,
  pieChartData
}) {
  if (datosGrafico.length === 0 && pieChartData.length === 0) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      {datosGrafico.length > 0 && (
        <BarChartCard
          title="Patinetes por distrito"
          data={datosGrafico}
          xKey="name"
          bars={BARS_PATINETES}
          height={280}
        />
      )}
      {pieChartData.length > 0 && (
        <PieChartCard
          title="Cuota de mercado por proveedor"
          data={pieChartData}
          height={280}
          donut
        />
      )}
    </div>
  );
});

export { EstadisticasMercadoPatinetes };
