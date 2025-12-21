/**
 * Componentes de graficos con Recharts
 * 
 * Graficos personalizados para el dashboard de Smart City.
 * Usa Recharts (https://recharts.org/) para visualizaciones.
 */

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
  PieChart as RechartsPieChart,
  Pie,
  Cell
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '../common';
import { CHART_COLORS } from '../../constants';

/**
 * Tooltip personalizado para graficos
 */
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload) return null;

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 shadow-lg">
      <p className="text-sm font-medium text-white mb-2">{label}</p>
      {payload.map((entry, index) => (
        <p key={index} className="text-sm" style={{ color: entry.color }}>
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  );
}

/**
 * Grafico de lineas
 * @param {Object} props - Props del componente
 * @param {Array} props.data - Datos del grafico
 * @param {string} props.xKey - Key para el eje X
 * @param {Array} props.lines - Configuracion de lineas [{key, name, color}]
 * @param {string} [props.title] - Titulo del grafico
 * @param {number} [props.height] - Altura del grafico
 */
function LineChartCard({ data, xKey, lines, title, height = 300 }) {
  return (
    <Card>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent>
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
              formatter={(value) => <span className="text-slate-300">{value}</span>}
            />
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
      </CardContent>
    </Card>
  );
}

/**
 * Grafico de barras
 * @param {Object} props - Props del componente
 * @param {Array} props.data - Datos del grafico
 * @param {string} props.xKey - Key para el eje X
 * @param {Array} props.bars - Configuracion de barras [{key, name, color}]
 * @param {string} [props.title] - Titulo del grafico
 * @param {number} [props.height] - Altura del grafico
 */
function BarChartCard({ data, xKey, bars, title, height = 300 }) {
  return (
    <Card>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent>
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
              formatter={(value) => <span className="text-slate-300">{value}</span>}
            />
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
      </CardContent>
    </Card>
  );
}

/**
 * Grafico de pastel/dona
 * @param {Object} props - Props del componente
 * @param {Array} props.data - Datos del grafico [{name, value}]
 * @param {string} [props.title] - Titulo del grafico
 * @param {number} [props.height] - Altura del grafico
 * @param {boolean} [props.donut] - Si es grafico de dona
 */
function PieChartCard({ data, title, height = 300, donut = false }) {
  const colors = Object.values(CHART_COLORS);

  return (
    <Card>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent>
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
      </CardContent>
    </Card>
  );
}

export { LineChartCard, BarChartCard, PieChartCard, CustomTooltip };
