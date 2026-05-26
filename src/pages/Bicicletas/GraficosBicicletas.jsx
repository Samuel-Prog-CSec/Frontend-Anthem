/**
 * Sub-componente GraficosBicicletas
 *
 * LineChart con las tendencias mensuales de uso (total, anual, ocasional).
 */

import { LineChartCard } from '../../components/charts';
import { CHART_COLORS } from '../../constants';

function GraficosBicicletas({ datos }) {
  if (!datos || datos.length === 0) return null;

  return (
    <div className="mb-6">
      <LineChartCard
        title="Tendencias mensuales de uso"
        data={datos}
        xKey="mes"
        lines={[
          { key: 'totalUsos', name: 'Total usos', color: CHART_COLORS.primary },
          { key: 'usosAnual', name: 'Usos anual', color: CHART_COLORS.secondary },
          { key: 'usosOcasional', name: 'Usos ocasional', color: CHART_COLORS.quaternary }
        ]}
        height={280}
      />
    </div>
  );
}

export default GraficosBicicletas;
