/**
 * Piramide poblacional real (hombres / mujeres por grupo de edad).
 *
 * Sustituye al donut "Distribucion por grupo de edad". Barras divergentes
 * horizontales: hombres a la izquierda (valor negativo), mujeres a la derecha.
 * El eje X muestra valores absolutos. Reactivo al tema.
 */

import { memo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ReferenceLine, ResponsiveContainer, Legend
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent, EmptyState } from '../../components/common';
import { CHART_COLORS } from '../../constants';
import { useTheme } from '../../context';
import { formatNumber } from '../../utils';

// Eje divergente (valores absolutos). Abrevia en es-ES igual que el resto de
// charts: "7 M" para millones (antes "7000k"), "150 mil" para decenas de miles.
function formatearEjeMiles(valor) {
  const abs = Math.abs(valor);
  if (abs >= 1_000_000) { return `${formatNumber(abs / 1_000_000, abs % 1_000_000 === 0 ? 0 : 1)} M`; }
  if (abs >= 10_000) { return `${formatNumber(Math.round(abs / 1000))} mil`; }
  return formatNumber(abs);
}

const TooltipPiramide = memo(function TooltipPiramide({ active, payload, label }) {
  if (!active || !payload || payload.length === 0) { return null; }
  return (
    <div className="rounded-md border border-[var(--border-emphasis)] bg-popover p-3">
      <p className="mb-2 text-sm font-medium text-foreground">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} className="font-mono text-sm tabular-nums" style={{ color: entry.color }}>
          {entry.name}: {formatNumber(Math.abs(entry.value))}
        </p>
      ))}
    </div>
  );
});

const PiramidePoblacional = memo(function PiramidePoblacional({ datos, title = 'Pirámide poblacional' }) {
  const { esOscuro } = useTheme();
  const tick = esOscuro ? 'oklch(0.70 0.014 250)' : 'oklch(0.44 0.020 252)';
  const eje = esOscuro ? 'oklch(0.42 0.016 250)' : 'oklch(0.80 0.010 245)';
  const cero = esOscuro ? 'oklch(0.48 0.018 250)' : 'oklch(0.74 0.012 245)';

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {(!datos || datos.length === 0) ? (
          <EmptyState
            title="Sin datos demográficos"
            description="No hay reparto por sexo y edad para los filtros actuales."
            className="py-10"
          />
        ) : (
          <div
            role="img"
            aria-label="Pirámide poblacional por sexo y grupo de edad"
            style={{ width: '100%', height: 340 }}
          >
            <ResponsiveContainer width="100%" height={340}>
              <BarChart data={datos} layout="vertical" stackOffset="sign" margin={{ top: 4, right: 12, bottom: 4, left: 8 }}>
                <XAxis
                  type="number"
                  tickFormatter={formatearEjeMiles}
                  stroke={eje}
                  tick={{ fill: tick, fontSize: 12 }}
                />
                <YAxis
                  type="category"
                  dataKey="grupo"
                  width={132}
                  stroke={eje}
                  tick={{ fill: tick, fontSize: 11 }}
                />
                <Tooltip content={<TooltipPiramide />} cursor={{ fill: 'transparent' }} />
                <Legend
                  wrapperStyle={{ paddingTop: '0.75rem' }}
                  formatter={(value) => <span className="text-muted-foreground">{value}</span>}
                />
                <ReferenceLine x={0} stroke={cero} />
                <Bar dataKey="hombres" name="Hombres" stackId="sexo" fill={CHART_COLORS.primary} />
                <Bar dataKey="mujeres" name="Mujeres" stackId="sexo" fill={CHART_COLORS.accent} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

export default PiramidePoblacional;
