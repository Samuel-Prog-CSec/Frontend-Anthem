/**
 * Grafico de tendencias temporales de ruido (LAeq24 mensual).
 * Subcomponente de PaginaRuido.
 */

import { memo } from 'react';
import { LineChartCard } from '../../../components/charts';
import { DATE_CONFIG } from '../../../constants';

const LINEAS_TENDENCIA = [
  { key: 'promedio', name: 'Promedio', color: '#06b6d4' },
  { key: 'maximo', name: 'Maximo', color: '#ef4444' },
  { key: 'minimo', name: 'Minimo', color: '#10b981' }
];

const GraficoTendenciasRuido = memo(function GraficoTendenciasRuido({ datosTendencia }) {
  if (!datosTendencia || datosTendencia.length === 0) return null;
  return (
    <div className="mb-6">
      <LineChartCard
        title={`Tendencias Temporales de Ruido (LAeq24) - ${DATE_CONFIG.DATASET_YEAR}`}
        data={datosTendencia}
        xKey="periodo"
        lines={LINEAS_TENDENCIA}
        height={280}
      />
    </div>
  );
});

export { GraficoTendenciasRuido };
