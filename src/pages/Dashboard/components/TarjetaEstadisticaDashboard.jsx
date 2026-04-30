/**
 * Componente TarjetaEstadisticaDashboard
 *
 * Tarjeta de metrica destacada para el dashboard con icono coloreado,
 * indicador de actividad y skeleton de carga integrado.
 */

import { memo } from 'react';
import { cn } from '../../../utils';

const VARIANTES_COLOR = {
  cyan: {
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/30',
    icon: 'text-cyan-400',
    glow: 'shadow-cyan-500/10'
  },
  emerald: {
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    icon: 'text-emerald-400',
    glow: 'shadow-emerald-500/10'
  },
  purple: {
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    icon: 'text-purple-400',
    glow: 'shadow-purple-500/10'
  }
};

function TarjetaEstadisticaDashboardImpl({ titulo, valor, subtitulo, icono, color = 'cyan', cargando }) {
  const colores = VARIANTES_COLOR[color] ?? VARIANTES_COLOR.cyan;
  const IconoComponente = icono;

  return (
    <div
      className={cn(
        'relative group p-6 rounded-2xl border transition-all duration-300',
        'bg-card/40 backdrop-blur-xl',
        colores.border,
        'hover:scale-[1.02] hover:shadow-xl',
        colores.glow
      )}
    >
      <div className={cn('w-14 h-14 rounded-xl flex items-center justify-center mb-4', colores.bg)}>
        <IconoComponente className={cn('w-7 h-7', colores.icon)} aria-hidden="true" />
      </div>

      <div className="mb-1">
        {cargando ? (
          <div className="h-10 w-24 bg-muted/50 animate-pulse rounded-lg" aria-label="Cargando" />
        ) : (
          <span className="text-4xl font-bold text-foreground tracking-tight">{valor}</span>
        )}
      </div>

      <h3 className="text-lg font-semibold text-foreground">{titulo}</h3>
      <p className="text-sm text-muted-foreground">{subtitulo}</p>

      <div className="absolute top-4 right-4 flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
        <span className="text-xs text-muted-foreground">Activo</span>
      </div>
    </div>
  );
}

export const TarjetaEstadisticaDashboard = memo(TarjetaEstadisticaDashboardImpl);
TarjetaEstadisticaDashboard.displayName = 'TarjetaEstadisticaDashboard';
