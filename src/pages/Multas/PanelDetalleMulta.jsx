/**
 * Sub-componente PanelDetalleMulta
 *
 * Card desplegable con los detalles de una multa concreta seleccionada
 * en la tabla: importes, calificacion, descripcion y, si la infraccion
 * es de velocidad, un mini-grid con limite vs circulacion vs exceso.
 */

import { X } from 'lucide-react';
import {
  Card, CardHeader, CardTitle, CardContent,
  Badge, Button, CardSkeleton
} from '../../components/common';
import { ETIQUETAS_CALIFICACION_MULTA } from '../../constants';
import { obtenerVarianteBadgeCalificacion, formatearImporte } from './helpers';

function PanelDetalleMulta({ detalle, isLoading, onCerrar }) {
  if (isLoading) {
    return <CardSkeleton lines={5} />;
  }
  if (!detalle) return null;

  const d = detalle;

  return (
    <Card className="mb-6 border-cyan-500/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Detalle de la multa</CardTitle>
          <Button variant="ghost" size="sm" onClick={onCerrar} aria-label="Cerrar detalle">
            <X className="size-4" aria-hidden="true" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <Celda etiqueta="Importe boletin" valor={formatearImporte(d.importeBoletín)} />
          <Celda etiqueta="Importe final" valor={formatearImporte(d.importeFinal)} />
          <Celda etiqueta="Puntos" valor={d.puntosDetraídos || 0} />
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-1.5">
              Calificacion
            </p>
            <Badge variant={obtenerVarianteBadgeCalificacion(d.calificacion)}>
              {ETIQUETAS_CALIFICACION_MULTA[d.calificacion] || d.calificacion}
            </Badge>
          </div>
        </div>

        {d.descripcionInfraccion && (
          <div className="p-3 rounded-lg bg-muted/50 mb-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-1">
              Descripcion de la infraccion
            </p>
            <p className="text-sm text-foreground">{d.descripcionInfraccion}</p>
          </div>
        )}

        {d.datosVelocidad?.velocidadLimite && (
          <div className="grid grid-cols-3 gap-4">
            <Celda
              etiqueta="Vel. limite"
              valor={`${d.datosVelocidad.velocidadLimite} km/h`}
              variant="alert"
            />
            <Celda
              etiqueta="Vel. circulacion"
              valor={`${d.datosVelocidad.velocidadCirculacion} km/h`}
              variant="alert"
              destaque
            />
            <Celda
              etiqueta="Exceso"
              valor={`+${d.datosVelocidad.exceso} km/h`}
              variant="alert"
              destaque
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Celda({ etiqueta, valor, variant = 'neutral', destaque = false }) {
  const bg = variant === 'alert' ? 'bg-rose-950/30 border border-rose-500/20' : 'bg-muted/50';
  const valorClass = destaque ? 'text-rose-400' : 'text-foreground';
  return (
    <div className={`p-3 rounded-lg ${bg}`}>
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-1.5">
        {etiqueta}
      </p>
      <p className={`font-display text-base font-bold ${valorClass}`}>{valor}</p>
    </div>
  );
}

export default PanelDetalleMulta;
