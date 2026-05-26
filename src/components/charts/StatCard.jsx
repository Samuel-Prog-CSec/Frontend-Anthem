/**
 * Componente StatCard
 *
 * Tarjeta de estadistica generica utilizada en todas las paginas de
 * detalle (Calidad del Aire, Ruido, Multas, etc.). Alineada con el
 * lenguaje visual editorial introducido en el rediseno del Dashboard:
 *
 *   - Eyebrow mono/uppercase para el titulo (apoyo, no protagonista).
 *   - Cifra dominante con stat-number (font-display + tabular-nums).
 *   - Icono pequeno como acento, no como bloque grande con color.
 *   - Subtitulo y trend en linea inferior con peso visual bajo.
 */

import { Card, Skeleton } from '../common';
import { cn } from '../../utils';

/**
 * Tarjeta de estadistica
 * @param {Object} props - Props del componente
 * @param {string} props.title - Titulo/etiqueta
 * @param {string|number} props.value - Valor principal
 * @param {string} [props.subtitle] - Subtitulo o descripcion
 * @param {React.ComponentType} [props.icon] - Icono
 * @param {string} [props.trend] - Tendencia: 'up', 'down', 'neutral'
 * @param {string} [props.trendValue] - Valor de la tendencia
 * @param {boolean} [props.isLoading] - Mostrar skeleton de carga
 * @param {string} [props.className] - Clases adicionales
 * @param {'cyan'|'emerald'|'amber'|'violet'|'rose'} [props.accent='cyan'] - Color del acento lateral e icono
 */
const ACENTOS = {
  cyan: { line: 'bg-cyan-500', iconBg: 'bg-cyan-500/10', iconColor: 'text-cyan-400' },
  emerald: { line: 'bg-emerald-500', iconBg: 'bg-emerald-500/10', iconColor: 'text-emerald-400' },
  amber: { line: 'bg-amber-500', iconBg: 'bg-amber-500/10', iconColor: 'text-amber-400' },
  violet: { line: 'bg-violet-500', iconBg: 'bg-violet-500/10', iconColor: 'text-violet-400' },
  rose: { line: 'bg-rose-500', iconBg: 'bg-rose-500/10', iconColor: 'text-rose-400' }
};

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  isLoading,
  className,
  accent = 'cyan'
}) {
  const colores = ACENTOS[accent] ?? ACENTOS.cyan;

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
    up: 'text-emerald-400',
    down: 'text-destructive',
    neutral: 'text-muted-foreground'
  };

  return (
    <Card className={cn('relative p-5 pl-6 overflow-hidden', className)}>
      <div className={cn('absolute left-0 top-5 bottom-5 w-px', colores.line)} aria-hidden="true" />

      <div className="flex items-start justify-between gap-3 mb-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground leading-snug pr-2">
          {title}
        </p>
        {Icon && (
          <div className={cn('shrink-0 size-8 rounded-md flex items-center justify-center', colores.iconBg)}>
            <Icon className={cn('size-4', colores.iconColor)} aria-hidden="true" />
          </div>
        )}
      </div>

      <p className="stat-number text-3xl lg:text-4xl text-foreground leading-none mb-2">
        {value}
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
    </Card>
  );
}

export { StatCard };
