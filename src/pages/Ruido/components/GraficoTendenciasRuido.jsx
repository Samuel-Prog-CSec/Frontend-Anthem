/**
 * Grafico de tendencias temporales de ruido (LAeq24 mensual).
 * Subcomponente de PaginaRuido.
 */

import { memo } from 'react';
import { LineChartCard } from '../../../components/charts';
import { DATE_CONFIG } from '../../../constants';

// Rampa de dominio de ruido (var(--color-noise-*) en index.css): minimo
// (bajo) verde, promedio (alto) ambar, maximo (muy alto) rojo.
const LINEAS_TENDENCIA = [
  { key: 'promedio', name: 'Promedio', color: '#d4a14d' },
  { key: 'maximo', name: 'Maximo', color: '#d44d3a' },
  { key: 'minimo', name: 'Minimo', color: '#3aa771' }
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
