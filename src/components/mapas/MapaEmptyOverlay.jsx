/**
 * MapaEmptyOverlay - mensaje visual cuando una capa GeoJSON entrega 0
 * features.
 *
 * Antes del rediseno, las paginas con mapa mostraban un mapa de Madrid
 * en blanco si el filtro no devolvia datos, sin feedback de por que.
 * Este overlay se monta sobre el mapa (absolute) y comunica claramente
 * el estado vacio, con accion opcional de "Limpiar filtros".
 *
 * Uso:
 *   <MapaInteractivo>
 *     ... layers ...
 *     {hayFiltros && features.length === 0 && (
 *       <MapaEmptyOverlay
 *         titulo="Sin registros para los filtros aplicados"
 *         onLimpiar={limpiarFiltros}
 *       />
 *     )}
 *   </MapaInteractivo>
 */

import { memo } from 'react';
import { MapPinOff } from 'lucide-react';

const MapaEmptyOverlay = memo(function MapaEmptyOverlay({
  titulo = 'Sin registros para los filtros aplicados',
  descripcion = 'No hay datos para los filtros aplicados. Prueba a relajar los filtros o cambiar el rango temporal.',
  onLimpiar,
  textoBotonLimpiar = 'Limpiar filtros'
}) {
  return (
    <div
      className="absolute inset-0 z-[400] flex items-center justify-center pointer-events-none"
      role="status"
      aria-live="polite"
    >
      <div className="pointer-events-auto max-w-md bg-[var(--surface)] border border-[var(--border-emphasis)] p-6 rounded-sm shadow-lg">
        <div className="flex items-start gap-4">
          <div
            className="shrink-0 size-10 rounded-sm border border-[var(--border-emphasis)] flex items-center justify-center text-[var(--ink-tertiary)]"
            aria-hidden="true"
          >
            <MapPinOff className="size-5" strokeWidth={1.5} />
          </div>
          <div className="space-y-3 flex-1">
            <p className="font-display text-xl font-semibold text-foreground leading-tight">
              {titulo}
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {descripcion}
            </p>
            {onLimpiar && (
              <button
                type="button"
                onClick={onLimpiar}
                className="mt-1 inline-flex items-center gap-2 rounded-md border border-[var(--border-emphasis)] px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:border-[var(--marca)] hover:text-[var(--marca)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--marca)]"
              >
                {textoBotonLimpiar}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

export { MapaEmptyOverlay };
