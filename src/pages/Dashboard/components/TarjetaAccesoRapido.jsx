/**
 * Componente TarjetaAccesoRapido
 *
 * Tarjeta clickable con enlace a un modulo del dashboard.
 * Color seleccionable via variante prop, con animacion en hover.
 */

import { memo } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { cn } from '../../../utils';

const VARIANTES_COLOR = {
  cyan: {
    iconBg: 'bg-gradient-to-br from-cyan-500/20 to-cyan-600/10',
    iconColor: 'text-cyan-400',
    hoverBorder: 'group-hover:border-cyan-500/50',
    arrow: 'group-hover:text-cyan-400'
  },
  emerald: {
    iconBg: 'bg-gradient-to-br from-emerald-500/20 to-emerald-600/10',
    iconColor: 'text-emerald-400',
    hoverBorder: 'group-hover:border-emerald-500/50',
    arrow: 'group-hover:text-emerald-400'
  },
  purple: {
    iconBg: 'bg-gradient-to-br from-purple-500/20 to-purple-600/10',
    iconColor: 'text-purple-400',
    hoverBorder: 'group-hover:border-purple-500/50',
    arrow: 'group-hover:text-purple-400'
  },
  amber: {
    iconBg: 'bg-gradient-to-br from-amber-500/20 to-amber-600/10',
    iconColor: 'text-amber-400',
    hoverBorder: 'group-hover:border-amber-500/50',
    arrow: 'group-hover:text-amber-400'
  },
  rose: {
    iconBg: 'bg-gradient-to-br from-rose-500/20 to-rose-600/10',
    iconColor: 'text-rose-400',
    hoverBorder: 'group-hover:border-rose-500/50',
    arrow: 'group-hover:text-rose-400'
  },
  sky: {
    iconBg: 'bg-gradient-to-br from-sky-500/20 to-sky-600/10',
    iconColor: 'text-sky-400',
    hoverBorder: 'group-hover:border-sky-500/50',
    arrow: 'group-hover:text-sky-400'
  }
};

function TarjetaAccesoRapidoImpl({ titulo, descripcion, icono, color, ruta }) {
  const colores = VARIANTES_COLOR[color] ?? VARIANTES_COLOR.cyan;
  const IconoComponente = icono;

  return (
    <Link to={ruta} className="block group" aria-label={`Ir a ${titulo}`}>
      <div
        className={cn(
          'relative h-full p-6 rounded-2xl border border-border/60 bg-card/40 backdrop-blur-xl',
          'transition-all duration-300',
          'hover:bg-card/60 hover:shadow-xl hover:-translate-y-1',
          colores.hoverBorder
        )}
      >
        <div className="flex items-start justify-between mb-4">
          <div className={cn('size-14 rounded-xl flex items-center justify-center', colores.iconBg)}>
            <IconoComponente className={cn('size-7', colores.iconColor)} aria-hidden="true" />
          </div>
          <ChevronRight
            className={cn(
              'size-5 text-muted-foreground transition-all duration-300',
              'group-hover:translate-x-1',
              colores.arrow
            )}
            aria-hidden="true"
          />
        </div>

        <h3 className="text-lg font-bold text-foreground mb-2">{titulo}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{descripcion}</p>

        <div className="mt-4 pt-4 border-t border-border/60 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className={cn('text-sm font-medium', colores.iconColor)}>
            Explorar datos
          </span>
        </div>
      </div>
    </Link>
  );
}

export const TarjetaAccesoRapido = memo(TarjetaAccesoRapidoImpl);
TarjetaAccesoRapido.displayName = 'TarjetaAccesoRapido';
