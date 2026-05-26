/**
 * Graficos de patron horario y top estaciones para Aforo de Peatones.
 */

import { memo } from 'react';
import { LineChartCard, BarChartCard } from '../../components/charts';
import { CHART_COLORS } from '../../constants';

function GraficosAforoPeatones({ datosPatronHorario, datosTopEstaciones }) {
  if (datosPatronHorario.length === 0 && datosTopEstaciones.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      {datosPatronHorario.length > 0 && (
        <LineChartCard
          title="Patron horario (promedio de peatones por hora)"
          data={datosPatronHorario}
          xKey="hora"
          lines={[
            { key: 'promedio', name: 'Promedio peatones', color: CHART_COLORS.primary }
          ]}
        />
      )}
      {datosTopEstaciones.length > 0 && (
        <BarChartCard
          title="Top 10 estaciones por volumen"
          data={datosTopEstaciones}
          xKey="nombre"
          bars={[
            { key: 'total', name: 'Total peatones', color: CHART_COLORS.secondary }
          ]}
        />
      )}
    </div>
  );
}

export default memo(GraficosAforoPeatones);
