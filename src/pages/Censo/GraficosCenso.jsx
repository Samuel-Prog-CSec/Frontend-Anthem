/**
 * Sub-componente GraficosCenso
 *
 * BarChart con top 10 distritos por poblacion (espanoles vs extranjeros)
 * + PieChart con distribucion por grupo de edad.
 */

import { BarChartCard, PieChartCard } from '../../components/charts';
import { CHART_COLORS } from '../../constants';

function GraficosCenso({ datosGraficoDistritos, datosGraficoEdad }) {
  const tieneAlgo = datosGraficoDistritos.length > 0 || datosGraficoEdad.length > 0;
  if (!tieneAlgo) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      {datosGraficoDistritos.length > 0 && (
        <BarChartCard
          title="Poblacion por distrito (Top 10)"
          data={datosGraficoDistritos}
          xKey="nombre"
          bars={[
            { key: 'espanoles', name: 'Espanoles', color: CHART_COLORS.primary },
            { key: 'extranjeros', name: 'Extranjeros', color: CHART_COLORS.tertiary }
          ]}
        />
      )}
      {datosGraficoEdad.length > 0 && (
        <PieChartCard
          title="Distribucion por grupo de edad"
          data={datosGraficoEdad}
        />
      )}
    </div>
  );
}

export default GraficosCenso;
