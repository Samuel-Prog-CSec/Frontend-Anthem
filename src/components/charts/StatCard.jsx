/**
 * Componente StatCard
 *
 * Tarjeta de estadistica generica usada en todas las paginas de detalle.
 * Cifra dominante (stat-number), etiqueta sans de apoyo, icono acento y,
 * opcionalmente, una sparkline inline con la serie temporal del KPI.
 */

import { Card, Skeleton } from '../common';
import { cn } from '../../utils';
import { NumeroAnimado } from './NumeroAnimado';

/**
 * @param {'cyan'|'emerald'|'amber'|'violet'|'rose'|'dominio'} [props.accent='dominio']
 * Acento lateral + icono + sparkline. Por defecto usa el color del dominio de la
 * pagina (--dominio), para que los KPIs de cada area sean coherentes con su
 * cabecera y con el Dashboard, en vez de un arcoiris decorativo.
 */
const ACENTOS = {
  cyan: { line: 'bg-info', iconBg: 'bg-info/10', iconColor: 'text-info' },
  emerald: { line: 'bg-success', iconBg: 'bg-success/10', iconColor: 'text-success' },
  amber: { line: 'bg-warning', iconBg: 'bg-warning/10', iconColor: 'text-warning' },
  violet: { line: 'bg-primary', iconBg: 'bg-primary/10', iconColor: 'text-primary' },
  rose: { line: 'bg-destructive', iconBg: 'bg-destructive/10', iconColor: 'text-destructive' },
  // Acento del dominio de la pagina (hereda --dominio del contenedor)
  dominio: { line: 'bg-dominio', iconBg: 'bg-dominio-soft', iconColor: 'text-dominio' }
};

/**
 * Sparkline ligera (SVG polyline, sin dependencias). Hereda el color via
 * `currentColor`, asi que el contenedor le pasa el color del acento.
 * @param {Object} props
 * @param {Array<number>} props.datos
 */
function Sparkline({ datos }) {
  if (!Array.isArray(datos)) { return null; }
  const numeros = datos.map(Number).filter((n) => Number.isFinite(n));
  if (numeros.length < 2) { return null; }

  const ancho = 120;
  const alto = 28;
  const min = Math.min(...numeros);
  const max = Math.max(...numeros);
  const span = max - min || 1;
  const puntos = numeros
    .map((v, i) => {
      const x = (i / (numeros.length - 1)) * ancho;
      const y = alto - 1 - ((v - min) / span) * (alto - 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <svg
      viewBox={`0 0 ${ancho} ${alto}`}
      preserveAspectRatio="none"
      className="mt-3 h-7 w-full opacity-90"
      aria-hidden="true"
    >
      <polyline
        points={puntos}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        pathLength={1}
        className="trazo-dibujado"
      />
    </svg>
  );
}

/**
 * Tarjeta de estadistica
 * @param {Object} props
 * @param {string} props.title
 * @param {string|number} props.value
 * @param {string} [props.subtitle]
 * @param {React.ComponentType} [props.icon]
 * @param {string} [props.trend] - 'up' | 'down' | 'neutral'
 * @param {string} [props.trendValue]
 * @param {boolean} [props.isLoading]
 * @param {string} [props.className]
 * @param {string} [props.accent='cyan']
 * @param {Array<number>} [props.serie] - Serie temporal para la sparkline inline
 */
function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  isLoading,
  className,
  accent = 'dominio',
  serie
}) {
  const colores = ACENTOS[accent] ?? ACENTOS.dominio;

  if (isLoading) {
    return (
      <Card className={cn('relative p-5 pl-6 overflow-hidden', className)}>
        <div className={cn('absolute left-0 top-5 bottom-5 w-px', colores.line)} aria-hidden="true" />
        <Skeleton className="h-3 w-28 mb-4" />
        <Skeleton className="h-9 w-24 mb-2" />
        <Skeleton className="h-3 w-20" />
      </Card>
    );
  }

  const trendColors = {
    up: 'text-success',
    down: 'text-destructive',
    neutral: 'text-muted-foreground'
  };

  return (
    <Card className={cn('relative p-5 pl-6 overflow-hidden', className)}>
      <div className={cn('absolute left-0 top-5 bottom-5 w-px', colores.line)} aria-hidden="true" />

      <div className="flex items-start justify-between gap-3 mb-3">
        <p className="pr-2 text-sm font-medium leading-snug text-muted-foreground">
          {title}
        </p>
        {Icon && (
          <div className={cn('shrink-0 size-8 rounded-md flex items-center justify-center', colores.iconBg)}>
            <Icon className={cn('size-4', colores.iconColor)} aria-hidden="true" />
          </div>
        )}
      </div>

      <p className="stat-hero text-2xl sm:text-3xl lg:text-4xl text-foreground leading-none mb-2">
        <NumeroAnimado value={value} />
      </p>

      {(subtitle || trendValue) && (
        <div className="flex items-center gap-2 text-xs">
          {trendValue && (
            <span className={cn('font-medium', trendColors[trend] || trendColors.neutral)}>
              {trend === 'up' && '+'}
              {trend === 'down' && '-'}
              {trendValue}
            </span>
          )}
          {subtitle && (
            <span className="text-muted-foreground">{subtitle}</span>
          )}
        </div>
      )}

      {serie && (
        <div className={colores.iconColor}>
          <Sparkline datos={serie} />
        </div>
      )}
    </Card>
  );
}

export { StatCard };
