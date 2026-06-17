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
  Cell,
  ScatterChart as RechartsScatterChart,
  Scatter
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent, Skeleton } from '../common';
import { CHART_COLORS } from '../../constants';
import { useTheme } from '../../context';
import { formatNumber } from '../../utils';

// Formateo de ticks del eje Y. Antes los ejes mostraban el numero crudo
// ("600000") o un "/1000 + k" que producia "7000k" para millones. Abreviamos
// en es-ES: 600000 -> "600 mil", 7000000 -> "7 M", y agrupamos por debajo de
// 10 mil ("8.450"). Mantiene la lectura corta sin romper el locale.
function formatearTickEje(valor) {
  const n = Number(valor);
  if (!Number.isFinite(n)) { return valor; }
  const abs = Math.abs(n);
  if (abs >= 1_000_000) { return `${formatNumber(n / 1_000_000, abs % 1_000_000 === 0 ? 0 : 1)} M`; }
  if (abs >= 10_000) { return `${formatNumber(Math.round(n / 1000))} mil`; }
  return formatNumber(n);
}

// Valor de tooltip con locale es-ES (separador de millar + coma decimal),
// con precision completa (a diferencia del eje, que abrevia).
function formatearValorTooltip(valor) {
  return Number.isFinite(Number(valor)) ? Number(valor).toLocaleString('es-ES') : valor;
}

// Tema de ejes/grid REACTIVO al tema (claro/oscuro). Recharts pinta estos
// colores como atributos SVG, asi que usamos valores resueltos (oklch) que
// equivalen a los tokens --border / --border-emphasis / --ink-tertiary / --alert.
// Al ser un hook de contexto dentro de un componente memo, el chart se re-pinta
// al alternar el tema.
function obtenerTemaChart(esOscuro) {
  return esOscuro
    ? { grid: 'oklch(0.34 0.014 250 / 0.55)', axis: 'oklch(0.42 0.016 250)', tick: 'oklch(0.70 0.014 250)', reference: 'oklch(0.66 0.18 27)' }
    : { grid: 'oklch(0.86 0.008 245 / 0.9)', axis: 'oklch(0.80 0.010 245)', tick: 'oklch(0.44 0.020 252)', reference: 'oklch(0.55 0.19 28)' };
}

// Recharts anima por JS (no por CSS), asi que el bloque global de
// prefers-reduced-motion no lo cubre. Gateamos la animacion de dibujo aqui
// para respetar la preferencia de accesibilidad.
function prefiereReduccionMovimiento() {
  return typeof window !== 'undefined'
    && window.matchMedia
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

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
    <div className="bg-popover border border-[var(--border-emphasis)] rounded-md p-3">
      <p className="text-sm font-medium text-foreground mb-2">{label}</p>
      {payload.map((entry, index) => (
        <p key={index} className="text-sm font-mono tabular-nums" style={{ color: entry.color }}>
          {entry.name}: {formatearValorTooltip(entry.value)}
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
  const { esOscuro } = useTheme();
  const CHART_THEME = obtenerTemaChart(esOscuro);
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
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.grid} />
            <XAxis
              dataKey={xKey}
              stroke={CHART_THEME.axis}
              tick={{ fill: CHART_THEME.tick, fontSize: 12 }}
            />
            <YAxis
              stroke={CHART_THEME.axis}
              tick={{ fill: CHART_THEME.tick, fontSize: 12 }}
              tickFormatter={formatearTickEje}
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
                label={{ value: ref.label, position: 'right', fill: ref.color || CHART_THEME.reference, fontSize: 11 }}
                stroke={ref.color || CHART_THEME.reference}
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
                isAnimationActive={!prefiereReduccionMovimiento()}
                animationDuration={900}
                animationEasing="ease-out"
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
  const { esOscuro } = useTheme();
  const CHART_THEME = obtenerTemaChart(esOscuro);
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
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.grid} />
            <XAxis
              dataKey={xKey}
              stroke={CHART_THEME.axis}
              tick={{ fill: CHART_THEME.tick, fontSize: 12 }}
            />
            <YAxis
              stroke={CHART_THEME.axis}
              tick={{ fill: CHART_THEME.tick, fontSize: 12 }}
              tickFormatter={formatearTickEje}
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
                label={{ value: ref.label, position: 'right', fill: ref.color || CHART_THEME.reference, fontSize: 11 }}
                stroke={ref.color || CHART_THEME.reference}
                strokeDasharray="5 5"
                strokeWidth={1.5}
              />
            ))}
            {bars.map((bar, index) => {
              const fillBase = bar.color || Object.values(CHART_COLORS)[index];
              return (
                <Bar
                  key={bar.key}
                  dataKey={bar.key}
                  name={bar.name}
                  fill={fillBase}
                  radius={[4, 4, 0, 0]}
                  isAnimationActive={!prefiereReduccionMovimiento()}
                  animationDuration={800}
                  animationEasing="ease-out"
                >
                  {/* Color por dato: si la barra declara `colorByDatum`, cada
                      entrada usa su propio `barColor` (p.ej. resaltar un item). */}
                  {bar.colorByDatum && data.map((entry, i) => (
                    <Cell key={`cell-${bar.key}-${i}`} fill={entry.barColor || fillBase} />
                  ))}
                </Bar>
              );
            })}
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
              isAnimationActive={!prefiereReduccionMovimiento()}
              animationDuration={800}
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

/**
 * Tooltip del scatter: muestra el nombre de la entidad (p.ej. distrito) + los
 * dos valores cruzados. Recibe las claves via props (Recharts clona el content
 * inyectando active/payload y preserva el resto de props).
 */
const ScatterTooltip = memo(function ScatterTooltip({ active, payload, nameKey, xKey, yKey, xName, yName }) {
  if (!active || !payload || !payload.length) return null;
  const punto = payload[0]?.payload || {};
  return (
    <div className="bg-popover border border-[var(--border-emphasis)] rounded-md p-3">
      <p className="text-sm font-medium text-foreground mb-1">{punto[nameKey]}</p>
      <p className="text-sm font-mono tabular-nums text-muted-foreground">
        {xName}: {Number(punto[xKey]).toLocaleString('es-ES')}
      </p>
      <p className="text-sm font-mono tabular-nums text-muted-foreground">
        {yName}: {Number(punto[yKey]).toLocaleString('es-ES')}
      </p>
    </div>
  );
});

/**
 * Grafico de dispersion (scatter): un punto por entidad (p.ej. distrito) que
 * cruza dos magnitudes (xKey vs yKey). Revela la RELACION (correlacion, outliers)
 * que dos rankings paralelos no muestran. Cada dato puede llevar su `color`.
 * @param {Object} props
 * @param {Array} props.data - [{ [nameKey], [xKey], [yKey], color? }]
 */
const ScatterChartCard = memo(function ScatterChartCard({
  data, xKey, yKey, xName, yName, nameKey = 'name', title, height = 360, isLoading
}) {
  const { esOscuro } = useTheme();
  const CHART_THEME = obtenerTemaChart(esOscuro);
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
          aria-label={title ? `Grafico de dispersion: ${title}` : 'Grafico de dispersion'}
          style={{ width: '100%', height }}
        >
          <ResponsiveContainer width="100%" height={height}>
            <RechartsScatterChart margin={{ top: 10, right: 24, bottom: 28, left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.grid} />
              <XAxis
                type="number"
                dataKey={xKey}
                name={xName}
                stroke={CHART_THEME.axis}
                tick={{ fill: CHART_THEME.tick, fontSize: 12 }}
                tickFormatter={(v) => Number(v).toLocaleString('es-ES')}
              />
              <YAxis
                type="number"
                dataKey={yKey}
                name={yName}
                stroke={CHART_THEME.axis}
                tick={{ fill: CHART_THEME.tick, fontSize: 12 }}
                tickFormatter={(v) => Number(v).toLocaleString('es-ES')}
              />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                content={<ScatterTooltip nameKey={nameKey} xKey={xKey} yKey={yKey} xName={xName} yName={yName} />}
              />
              <Scatter
                data={data}
                fill={CHART_COLORS.primary}
                isAnimationActive={!prefiereReduccionMovimiento()}
                animationDuration={700}
              >
                {data.map((entry, index) => (
                  <Cell key={`punto-${index}`} fill={entry.color || CHART_COLORS.primary} />
                ))}
              </Scatter>
            </RechartsScatterChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
});

export { LineChartCard, BarChartCard, PieChartCard, ScatterChartCard, CustomTooltip };
