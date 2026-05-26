/**
 * Componentes de graficos con Recharts
 *
 * Graficos personalizados para el dashboard de Smart City.
 * Usa Recharts (https://recharts.org/) para visualizaciones.
 *
 * Todos los componentes estan envueltos en `React.memo` porque Recharts
 * es costoso de re-renderizar y suelen recibir props estables (data,
 * configuracion de lineas/barras). Sin memo, cada cambio de filtro o
 * estado en la pagina padre re-renderizaba el chart innecesariamente.
 */

import { memo } from 'react';
import {
  LineChart as RechartsLineChart,
  Line,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  PieChart as RechartsPieChart,
  Pie,
  Cell
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent, Skeleton } from '../common';
import { CHART_COLORS } from '../../constants';

// Alturas pseudoaleatorias estables para barras de placeholder.
// Evita Math.random() en render (impuro segun React Compiler)
const ALTURAS_PLACEHOLDER_BARRAS = [45, 72, 38, 85, 60, 50, 78, 42];

/**
 * Placeholder de carga para graficos
 * @param {Object} props
 * @param {string} [props.title] - Titulo del grafico
 * @param {number} [props.height] - Altura del area del grafico
 */
const ChartSkeleton = memo(function ChartSkeleton({ title, height = 300 }) {
  return (
    <Card>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <div style={{ height }} className="flex items-end gap-2 pt-8">
          {ALTURAS_PLACEHOLDER_BARRAS.map((altura, i) => (
            <Skeleton
              key={i}
              className="flex-1 rounded-t"
              style={{ height: `${altura}%` }}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
});

/**
 * Tooltip personalizado para graficos
 */
const CustomTooltip = memo(function CustomTooltip({ active, payload, label }) {
  if (!active || !payload) return null;

  return (
    <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
      <p className="text-sm font-medium text-foreground mb-2">{label}</p>
      {payload.map((entry, index) => (
        <p key={index} className="text-sm" style={{ color: entry.color }}>
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  );
});

/**
 * Grafico de lineas
 * @param {Object} props - Props del componente
 * @param {Array} props.data - Datos del grafico
 * @param {string} props.xKey - Key para el eje X
 * @param {Array} props.lines - Configuracion de lineas [{key, name, color}]
 * @param {string} [props.title] - Titulo del grafico
 * @param {number} [props.height] - Altura del grafico
 * @param {Array} [props.referenceLines] - Lineas de referencia [{y, label, color}]
 */
const LineChartCard = memo(function LineChartCard({ data, xKey, lines, title, height = 300, referenceLines = [], isLoading }) {
  if (isLoading) return <ChartSkeleton title={title} height={height} />;

  return (
    <Card>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <div
          role="img"
          aria-label={title ? `Grafico: ${title}` : 'Grafico de datos'}
          style={{ width: '100%', height }}
        >
        <ResponsiveContainer width="100%" height={height}>
          <RechartsLineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis
              dataKey={xKey}
              stroke="#64748b"
              tick={{ fill: '#94a3b8', fontSize: 12 }}
            />
            <YAxis
              stroke="#64748b"
              tick={{ fill: '#94a3b8', fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: '1rem' }}
              formatter={(value) => <span className="text-muted-foreground">{value}</span>}
            />
            {referenceLines.map((ref, index) => (
              <ReferenceLine
                key={`ref-line-${index}`}
                y={ref.y}
                label={{ value: ref.label, position: 'right', fill: ref.color || '#ef4444', fontSize: 11 }}
                stroke={ref.color || '#ef4444'}
                strokeDasharray="5 5"
                strokeWidth={1.5}
              />
            ))}
            {lines.map((line, index) => (
              <Line
                key={line.key}
                type="monotone"
                dataKey={line.key}
                name={line.name}
                stroke={line.color || Object.values(CHART_COLORS)[index]}
                strokeWidth={2}
                dot={{ fill: line.color || Object.values(CHART_COLORS)[index], r: 3 }}
                activeDot={{ r: 5 }}
              />
            ))}
          </RechartsLineChart>
        </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
});

/**
 * Grafico de barras
 * @param {Object} props - Props del componente
 * @param {Array} props.data - Datos del grafico
 * @param {string} props.xKey - Key para el eje X
 * @param {Array} props.bars - Configuracion de barras [{key, name, color}]
 * @param {string} [props.title] - Titulo del grafico
 * @param {number} [props.height] - Altura del grafico
 * @param {Array} [props.referenceLines] - Lineas de referencia [{y, label, color}]
 */
const BarChartCard = memo(function BarChartCard({ data, xKey, bars, title, height = 300, referenceLines = [], isLoading }) {
  if (isLoading) return <ChartSkeleton title={title} height={height} />;
  return (
    <Card>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <div
          role="img"
          aria-label={title ? `Grafico: ${title}` : 'Grafico de datos'}
          style={{ width: '100%', height }}
        >
        <ResponsiveContainer width="100%" height={height}>
          <RechartsBarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis
              dataKey={xKey}
              stroke="#64748b"
              tick={{ fill: '#94a3b8', fontSize: 12 }}
            />
            <YAxis
              stroke="#64748b"
              tick={{ fill: '#94a3b8', fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: '1rem' }}
              formatter={(value) => <span className="text-muted-foreground">{value}</span>}
            />
            {referenceLines.map((ref, index) => (
              <ReferenceLine
                key={`ref-bar-${index}`}
                y={ref.y}
                label={{ value: ref.label, position: 'right', fill: ref.color || '#ef4444', fontSize: 11 }}
                stroke={ref.color || '#ef4444'}
                strokeDasharray="5 5"
                strokeWidth={1.5}
              />
            ))}
            {bars.map((bar, index) => (
              <Bar
                key={bar.key}
                dataKey={bar.key}
                name={bar.name}
                fill={bar.color || Object.values(CHART_COLORS)[index]}
                radius={[4, 4, 0, 0]}
              />
            ))}
          </RechartsBarChart>
        </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
});

/**
 * Grafico de pastel/dona
 * @param {Object} props - Props del componente
 * @param {Array} props.data - Datos del grafico [{name, value}]
 * @param {string} [props.title] - Titulo del grafico
 * @param {number} [props.height] - Altura del grafico
 * @param {boolean} [props.donut] - Si es grafico de dona
 */
const PieChartCard = memo(function PieChartCard({ data, title, height = 300, donut = false, isLoading }) {
  if (isLoading) return <ChartSkeleton title={title} height={height} />;
  const colors = Object.values(CHART_COLORS);

  return (
    <Card>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <div
          role="img"
          aria-label={title ? `Grafico: ${title}` : 'Grafico de datos'}
          style={{ width: '100%', height }}
        >
        <ResponsiveContainer width="100%" height={height}>
          <RechartsPieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={donut ? 60 : 0}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              labelLine={false}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color || colors[index % colors.length]}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </RechartsPieChart>
        </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
});

export { LineChartCard, BarChartCard, PieChartCard, CustomTooltip };
