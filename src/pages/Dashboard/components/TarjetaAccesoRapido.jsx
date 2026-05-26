/**
 * Componente TarjetaAccesoRapido
 *
 * Tarjeta de acceso a un modulo del dashboard. Refactor anti AI-slop:
 *
 *   - Se elimina el `hover:-translate-y-1` (genericamente aplicado por la
 *     version anterior a TODOS los modulos). El movimiento sistematico
 *     denota plantilla.
 *   - El icono pasa de "cuadrado grande con gradient + chevron a la derecha"
 *     a un acento esquinero contenido, dejando el peso al titulo.
 *   - El borde inferior se ilumina en hover en lugar de la silueta entera
 *     (interaccion mas intencional, menos circo).
 *   - Cada modulo expone una etiqueta de categoria pequena (modulo numerico)
 *     que rompe la simetria absoluta.
 */

import { memo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { cn } from '../../../utils';

const VARIANTES_COLOR = {
  cyan: {
    accentBg: 'bg-cyan-500/10',
    accentIcon: 'text-cyan-400',
    underline: 'group-hover:via-cyan-400'
  },
  emerald: {
    accentBg: 'bg-emerald-500/10',
    accentIcon: 'text-emerald-400',
    underline: 'group-hover:via-emerald-400'
  },
  purple: {
    accentBg: 'bg-violet-500/10',
    accentIcon: 'text-violet-400',
    underline: 'group-hover:via-violet-400'
  },
  amber: {
    accentBg: 'bg-amber-500/10',
    accentIcon: 'text-amber-400',
    underline: 'group-hover:via-amber-400'
  },
  rose: {
    accentBg: 'bg-rose-500/10',
    accentIcon: 'text-rose-400',
    underline: 'group-hover:via-rose-400'
  },
  sky: {
    accentBg: 'bg-sky-500/10',
    accentIcon: 'text-sky-400',
    underline: 'group-hover:via-sky-400'
  }
};

function TarjetaAccesoRapidoImpl({ titulo, descripcion, icono, color, ruta, codigo }) {
  const colores = VARIANTES_COLOR[color] ?? VARIANTES_COLOR.cyan;
  const IconoComponente = icono;

  return (
    <Link
      to={ruta}
      className="relative group block h-full rounded-xl border border-border/60 bg-card/40 backdrop-blur-sm overflow-hidden transition-colors hover:border-border hover:bg-card/70"
      aria-label={`Ir a ${titulo}`}
    >
      <div className="p-6">
        <div className="flex items-start justify-between gap-4 mb-5">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            {codigo}
          </span>
          <div className={cn('shrink-0 size-10 rounded-lg flex items-center justify-center', colores.accentBg)}>
            <IconoComponente className={cn('size-5', colores.accentIcon)} aria-hidden="true" />
          </div>
        </div>

        <h3 className="font-display text-xl text-foreground font-bold mb-2 leading-snug">
          {titulo}
        </h3>

        <p className="text-sm text-muted-foreground leading-relaxed mb-6">
          {descripcion}
        </p>

        <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
          <span>Abrir modulo</span>
          <ArrowUpRight className="size-3.5 transition-transform group-hover:-translate-y-px group-hover:translate-x-px" aria-hidden="true" />
        </div>
      </div>

      {/* Hairline inferior con tinta de la variante en hover.
          Reemplaza al hover:translate-y-1 + shadow generico. */}
      <div
        className={cn(
          'absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent transition-colors',
          colores.underline
        )}
        aria-hidden="true"
      />
    </Link>
  );
}

export const TarjetaAccesoRapido = memo(TarjetaAccesoRapidoImpl);
TarjetaAccesoRapido.displayName = 'TarjetaAccesoRapido';
