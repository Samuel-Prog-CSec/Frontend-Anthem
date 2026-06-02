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

function TarjetaAccesoRapidoImpl({ titulo, descripcion, icono, ruta, codigo }) {
  const IconoComponente = icono;

  return (
    <Link
      to={ruta}
      className="relative group block h-full rounded-xl border border-border bg-card overflow-hidden transition-colors hover:border-[var(--border-emphasis)]"
      aria-label={`Ir a ${titulo}`}
    >
      <div className="p-6">
        <div className="flex items-start justify-between gap-4 mb-5">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            {codigo}
          </span>
          <div className="shrink-0 size-10 rounded-lg flex items-center justify-center border border-border">
            <IconoComponente className="size-5 text-muted-foreground" aria-hidden="true" />
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

      {/* Hairline inferior que se enfatiza en hover.
          Reemplaza al hover:translate-y-1 + shadow generico. */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px bg-border transition-colors group-hover:bg-[var(--border-strong)]"
        aria-hidden="true"
      />
    </Link>
  );
}

export const TarjetaAccesoRapido = memo(TarjetaAccesoRapidoImpl);
TarjetaAccesoRapido.displayName = 'TarjetaAccesoRapido';
