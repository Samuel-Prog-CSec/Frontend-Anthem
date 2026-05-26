/**
 * Componente TarjetaEstadisticaDashboard
 *
 * Tarjeta de metrica con tratamiento "data-first": cifra dominante en
 * font-display + tabular-nums, etiqueta minuscula como apoyo, icono
 * subordinado al valor (no al reves).
 *
 * Cambios anti AI-slop respecto a la version previa:
 *   - Se elimina el chip "Activo" pulse verde (era decoracion sin estado real).
 *   - Se elimina el hover scale 1.02 sistematico (que se acumulaba en cada
 *     card del dashboard generando una pagina que "respira" demasiado).
 *   - El icono pasa de un cuadrado grande arriba a una marca lateral fina
 *     que actua como acento, no como protagonista.
 *   - Cada variante de color usa un accent diferente (no solo el iconos)
 *     -- linea izquierda, valor con tinta sutil del color.
 */

import { memo } from 'react';
import { cn } from '../../../utils';

const VARIANTES_COLOR = {
  cyan: {
    accent: 'bg-cyan-500',
    iconBg: 'bg-cyan-500/10',
    iconColor: 'text-cyan-400'
  },
  emerald: {
    accent: 'bg-emerald-500',
    iconBg: 'bg-emerald-500/10',
    iconColor: 'text-emerald-400'
  },
  purple: {
    accent: 'bg-violet-500',
    iconBg: 'bg-violet-500/10',
    iconColor: 'text-violet-400'
  },
  amber: {
    accent: 'bg-amber-500',
    iconBg: 'bg-amber-500/10',
    iconColor: 'text-amber-400'
  }
};

function TarjetaEstadisticaDashboardImpl({ titulo, valor, subtitulo, icono, color = 'cyan', cargando }) {
  const colores = VARIANTES_COLOR[color] ?? VARIANTES_COLOR.cyan;
  const IconoComponente = icono;

  return (
    <div className="relative group h-full rounded-xl border border-border/60 bg-card/40 backdrop-blur-sm transition-colors duration-300 hover:border-border hover:bg-card/60">
      {/* Acento vertical izquierdo (1px) que da color sin saturar el card */}
      <div className={cn('absolute left-0 top-6 bottom-6 w-px', colores.accent)} aria-hidden="true" />

      <div className="p-6 pl-7">
        <div className="flex items-start justify-between gap-4 mb-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground leading-snug">
            {titulo}
          </p>
          <div className={cn('shrink-0 size-9 rounded-lg flex items-center justify-center', colores.iconBg)}>
            <IconoComponente className={cn('size-4', colores.iconColor)} aria-hidden="true" />
          </div>
        </div>

        <div className="space-y-2">
          {cargando ? (
            <div className="h-12 w-32 bg-muted/40 animate-pulse rounded-md" aria-label="Cargando" />
          ) : (
            <p className="stat-number text-4xl lg:text-5xl text-foreground leading-none">
              {valor}
            </p>
          )}
          <p className="text-sm text-muted-foreground leading-snug">{subtitulo}</p>
        </div>
      </div>
    </div>
  );
}

export const TarjetaEstadisticaDashboard = memo(TarjetaEstadisticaDashboardImpl);
TarjetaEstadisticaDashboard.displayName = 'TarjetaEstadisticaDashboard';
