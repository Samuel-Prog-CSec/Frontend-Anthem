/**
 * Grafico de lineas con niveles de ruido por estacion.
 * Subcomponente de PaginaRuido.
 */

import { memo } from 'react';
import { LineChartCard } from '../../../components/charts';
import { NOISE_LIMITS } from '../../../constants';

const LINEAS_NIVELES = [
  { key: 'diurno', name: 'Diurno (dB)', color: '#f59e0b' },
  { key: 'vespertino', name: 'Vespertino (dB)', color: '#f97316' },
  { key: 'nocturno', name: 'Nocturno (dB)', color: '#8b5cf6' },
  { key: 'laeq24', name: 'LAeq24 (dB)', color: '#06b6d4' }
];

const REFERENCE_LINES = [
  { y: NOISE_LIMITS.DIURNO, label: `Limite diurno (${NOISE_LIMITS.DIURNO} dB)`, color: '#f59e0b' },
  { y: NOISE_LIMITS.NOCTURNO, label: `Limite nocturno (${NOISE_LIMITS.NOCTURNO} dB)`, color: '#8b5cf6' }
];

const GraficoNivelesRuido = memo(function GraficoNivelesRuido({ datosGrafico }) {
  if (!datosGrafico || datosGrafico.length === 0) return null;
  return (
    <div className="mb-6">
      <LineChartCard
        title="Niveles de Ruido por Estacion"
        data={datosGrafico}
        xKey="estacion"
        lines={LINEAS_NIVELES}
        referenceLines={REFERENCE_LINES}
        height={280}
      />
    </div>
  );
});

export { GraficoNivelesRuido };
