/**
 * Grafico de lineas con niveles de ruido por estacion.
 * Subcomponente de PaginaRuido.
 */

import { memo } from 'react';
import { LineChartCard } from '../../../components/charts';
import { NOISE_LIMITS } from '../../../constants';

// Rampa de dominio de ruido (var(--color-noise-*) en index.css): tonos
// distintos para cada serie segun severidad del periodo.
const LINEAS_NIVELES = [
  { key: 'diurno', name: 'Diurno (dB)', color: '#3aa771' },
  { key: 'vespertino', name: 'Vespertino (dB)', color: '#aabe3a' },
  { key: 'nocturno', name: 'Nocturno (dB)', color: '#d44d3a' },
  { key: 'laeq24', name: 'LAeq24 (dB)', color: '#d4a14d' }
];

const REFERENCE_LINES = [
  { y: NOISE_LIMITS.DIURNO, label: `Límite diurno (${NOISE_LIMITS.DIURNO} dB)`, color: '#d4a14d' },
  { y: NOISE_LIMITS.NOCTURNO, label: `Límite nocturno (${NOISE_LIMITS.NOCTURNO} dB)`, color: '#d44d3a' }
];

const GraficoNivelesRuido = memo(function GraficoNivelesRuido({ datosGrafico }) {
  if (!datosGrafico || datosGrafico.length === 0) return null;
  return (
    <div className="mb-6">
      <LineChartCard
        title="Niveles de ruido por estación"
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
