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
  descripcion = 'La consulta a la malla sensorizada no devolvio datos en esta seleccion. Prueba a relajar los filtros o cambiar el rango temporal.',
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
            className="flex-shrink-0 size-10 rounded-sm border border-[var(--border-emphasis)] flex items-center justify-center text-[var(--ink-tertiary)]"
            aria-hidden="true"
          >
            <MapPinOff className="size-5" strokeWidth={1.5} />
          </div>
          <div className="space-y-3 flex-1">
            <div className="space-y-1">
              <p className="eyebrow text-[var(--ink-tertiary)]">SIN COBERTURA EN LOS FILTROS</p>
              <p className="font-display italic text-xl text-foreground leading-tight">
                {titulo}
              </p>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {descripcion}
            </p>
            {onLimpiar && (
              <button
                type="button"
                onClick={onLimpiar}
                className="inline-flex items-center gap-2 px-3 py-1.5 mt-1 font-mono text-[10px] uppercase tracking-[0.12em] border border-[var(--border-emphasis)] hover:border-[var(--signal)] hover:text-[var(--signal)] transition-colors rounded-sm"
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
