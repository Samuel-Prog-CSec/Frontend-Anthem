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
import { NumeroAnimado } from '../../../components/charts';

function TarjetaEstadisticaDashboardImpl({ titulo, valor, subtitulo, icono, cargando, error, dominio }) {
  const IconoComponente = icono;

  return (
    <div
      data-dominio={dominio}
      className="relative group h-full rounded-xl border border-border bg-card transition-colors duration-300 hover:border-[var(--border-emphasis)]"
    >
      {/* Acento vertical izquierdo (1px) del color del dominio: marca la familia
          de datos del card sin saturarlo. */}
      <div className="absolute left-0 top-6 bottom-6 w-px bg-dominio" aria-hidden="true" />

      <div className="p-6 pl-7">
        <div className="flex items-start justify-between gap-4 mb-6">
          <p className="text-sm font-medium leading-snug text-muted-foreground">
            {titulo}
          </p>
          <div className="shrink-0 size-9 rounded-lg flex items-center justify-center border border-dominio/30 bg-dominio-soft">
            <IconoComponente className="size-4 text-dominio" aria-hidden="true" />
          </div>
        </div>

        <div className="space-y-2">
          {cargando ? (
            <div className="h-12 w-32 bg-muted/40 animate-pulse rounded-md" aria-label="Cargando" />
          ) : error ? (
            // Estado de error explicito: distingue "fallo de carga" de "dato cero".
            // No mostramos 0 (enganoso); el subtitulo lo aclara.
            <p className="text-2xl sm:text-3xl text-muted-foreground/80 leading-none" role="status">
              No disponible
            </p>
          ) : (
            <p className="stat-number text-3xl sm:text-4xl lg:text-5xl text-foreground leading-none tabular-nums">
              <NumeroAnimado value={valor} />
            </p>
          )}
          <p className="text-sm text-muted-foreground leading-snug">
            {error ? 'No se pudieron cargar los datos' : subtitulo}
          </p>
        </div>
      </div>
    </div>
  );
}

export const TarjetaEstadisticaDashboard = memo(TarjetaEstadisticaDashboardImpl);
TarjetaEstadisticaDashboard.displayName = 'TarjetaEstadisticaDashboard';
