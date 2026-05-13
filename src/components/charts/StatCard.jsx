/**
 * Componente StatCard
 * 
 * Tarjeta de estadistica para el dashboard.
 * Muestra un valor, etiqueta e icono.
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
 */
function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  isLoading,
  className
}) {
  if (isLoading) {
    return (
      <Card className={cn('p-6', className)}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <Skeleton className="h-4 w-24 mb-3" />
            <Skeleton className="h-8 w-20 mb-2" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="size-12 rounded-lg" />
        </div>
      </Card>
    );
  }
  const trendColors = {
    up: 'text-emerald-400',
    down: 'text-destructive',
    neutral: 'text-muted-foreground'
  };

  return (
    <Card className={cn('p-6', className)}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-2 text-3xl font-bold text-foreground">{value}</p>

          {(subtitle || trendValue) && (
            <div className="mt-2 flex items-center gap-2">
              {trendValue && (
                <span className={cn('text-sm font-medium', trendColors[trend] || trendColors.neutral)}>
                  {trend === 'up' && '+'}
                  {trend === 'down' && '-'}
                  {trendValue}
                </span>
              )}
              {subtitle && (
                <span className="text-sm text-muted-foreground">{subtitle}</span>
              )}
            </div>
          )}
        </div>

        {Icon && (
          <div className="rounded-lg bg-primary/10 p-3">
            <Icon className="size-6 text-primary" aria-hidden="true" />
          </div>
        )}
      </div>
    </Card>
  );
}

export { StatCard };
