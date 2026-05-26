/**
 * Sub-componente GraficosAforoBicicletas
 *
 * LineChart con el patron horario (0-23h) + BarChart con top 10
 * estaciones por volumen.
 */

import { LineChartCard, BarChartCard } from '../../components/charts';
import { CHART_COLORS } from '../../constants';

function GraficosAforoBicicletas({ datosPatronHorario, datosTopEstaciones }) {
  const tieneAlgo = datosPatronHorario.length > 0 || datosTopEstaciones.length > 0;
  if (!tieneAlgo) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      {datosPatronHorario.length > 0 && (
        <LineChartCard
          title="Patron horario (promedio de bicicletas por hora)"
          data={datosPatronHorario}
          xKey="hora"
          lines={[
            { key: 'promedio', name: 'Promedio bicicletas', color: CHART_COLORS.primary }
          ]}
        />
      )}
      {datosTopEstaciones.length > 0 && (
        <BarChartCard
          title="Top 10 estaciones por volumen"
          data={datosTopEstaciones}
          xKey="nombre"
          bars={[
            { key: 'total', name: 'Total bicicletas', color: CHART_COLORS.secondary }
          ]}
        />
      )}
    </div>
  );
}

export default GraficosAforoBicicletas;
