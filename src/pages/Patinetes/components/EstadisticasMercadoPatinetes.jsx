/**
 * Graficos de mercado de patinetes (bar chart por distrito + pie chart por proveedor).
 * Subcomponente de PaginaPatinetes.
 */

import { memo } from 'react';
import { BarChartCard, PieChartCard } from '../../../components/charts';

const BARS_PATINETES = [{ key: 'totalPatinetes', name: 'Total Patinetes', color: '#06b6d4' }];

const EstadisticasMercadoPatinetes = memo(function EstadisticasMercadoPatinetes({
  datosGrafico,
  pieChartData
}) {
  if (datosGrafico.length === 0 && pieChartData.length === 0) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      {datosGrafico.length > 0 && (
        <BarChartCard
          title="Patinetes por Distrito"
          data={datosGrafico}
          xKey="name"
          bars={BARS_PATINETES}
          height={280}
        />
      )}
      {pieChartData.length > 0 && (
        <PieChartCard
          title="Cuota de Mercado por Proveedor"
          data={pieChartData}
          height={280}
          donut
        />
      )}
    </div>
  );
});

export { EstadisticasMercadoPatinetes };
