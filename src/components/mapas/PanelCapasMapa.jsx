/**
 * PanelCapasMapa - panel lateral del mapa unificado.
 *
 * Permite al usuario activar/desactivar capas conmutables y ver una leyenda
 * de colores. El estado de capas activas se controla desde fuera (estado
 * elevado al MapaUnificado) para que cualquier integracion pueda persistir
 * o sincronizar con URL si lo necesita.
 *
 * Accesibilidad:
 *   - Cada toggle es un boton con role implicito y aria-pressed para indicar
 *     estado al lector de pantalla.
 *   - Layout responsive: en movil ocupa toda la anchura, en escritorio se
 *     ancla al lado del mapa.
 */

import { memo } from 'react';
import { Layers, Check } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button } from '../common';
import { cn } from '../../utils';
import { CAPAS_DISPONIBLES } from './configCapas';

const PanelCapasMapa = memo(function PanelCapasMapa({
  capasActivas,
  onToggleCapa,
  onActivarTodas,
  onOcultarTodas,
  className
}) {
  const totalCapas = CAPAS_DISPONIBLES.length;
  const totalActivas = capasActivas.size;

  return (
    <Card className={cn('h-full', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Layers className="size-4" />
          Capas del mapa
        </CardTitle>
        <CardDescription>
          {totalActivas} de {totalCapas} capas activas
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <div className="flex items-center gap-2 mb-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onActivarTodas}
            aria-label="Activar todas las capas"
            className="text-xs"
          >
            Activar todas
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onOcultarTodas}
            aria-label="Ocultar todas las capas"
            className="text-xs"
          >
            Ocultar todas
          </Button>
        </div>

        <ul className="flex flex-col gap-1.5" role="list">
          {CAPAS_DISPONIBLES.map((capa) => {
            const Icon = capa.icon;
            const activa = capasActivas.has(capa.id);
            return (
              <li key={capa.id}>
                <button
                  type="button"
                  onClick={() => onToggleCapa(capa.id)}
                  aria-pressed={activa}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2 rounded-md border text-left transition-all',
                    'hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40',
                    activa
                      ? 'border-border bg-muted/30'
                      : 'border-border/40 bg-transparent opacity-70 hover:opacity-100'
                  )}
                >
                  {/* Indicador de color de la capa */}
                  <span
                    className="inline-flex items-center justify-center size-6 rounded-md shrink-0"
                    style={{ backgroundColor: capa.color, color: '#0f172a' }}
                    aria-hidden="true"
                  >
                    <Icon className="size-3.5" />
                  </span>

                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-medium truncate">{capa.nombre}</span>
                    <span className="block text-xs text-muted-foreground truncate">
                      {capa.descripcion}
                    </span>
                  </span>

                  {/* Estado del toggle: casilla (cuadrada = multi-seleccion, no
                      circulo que sugeriria single-select) con check si activa */}
                  <span
                    className={cn(
                      'inline-flex items-center justify-center size-5 rounded border shrink-0 transition-colors',
                      activa
                        ? 'bg-primary border-primary text-primary-foreground'
                        : 'bg-transparent border-border/60'
                    )}
                    aria-hidden="true"
                  >
                    {activa && <Check className="size-3" strokeWidth={3} />}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
});

export { PanelCapasMapa };
