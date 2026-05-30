/**
 * Sub-componente PanelDetalleEstacion (Bicicletas)
 *
 * Panel desplegable con el resumen de trafico ciclista de una estacion
 * concreta seleccionada en la tabla.
 */

import { X } from 'lucide-react';
import {
  Card, CardHeader, CardTitle, CardContent, CardDescription,
  Button, CardSkeleton
} from '../../components/common';
import { formatNumber, formatearNombreDistrito } from '../../utils';
import { descomponerIdentificadorAforo } from './helpers';

function PanelDetalleEstacion({ identificador, detalle, isLoading, onCerrar }) {
  if (!identificador) return null;
  if (isLoading) return <CardSkeleton lines={5} />;
  if (!detalle?.data) return null;

  const summary = detalle.data.summary || detalle.data.data || detalle.data;
  const partes = descomponerIdentificadorAforo(identificador);

  return (
    <Card className="mb-6 border-emerald-500/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-mono">{identificador}</CardTitle>
            {partes.legible && (
              <p className="text-xs text-muted-foreground mt-1">{partes.legible}</p>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCerrar}
            aria-label="Cerrar detalle"
          >
            <X className="size-4" aria-hidden="true" />
          </Button>
        </div>
        <CardDescription>Resumen de trafico ciclista de la estacion.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Celda etiqueta="Total bicicletas" valor={formatNumber(summary.totalBicicletas || 0)} />
          <Celda etiqueta="Mediciones" valor={formatNumber(summary.totalMediciones || 0)} />
          <Celda etiqueta="Distrito" valor={formatearNombreDistrito(summary.distrito)} />
          <Celda etiqueta="Nombre vial" valor={summary.nombreVial || '-'} />
        </div>
      </CardContent>
    </Card>
  );
}

function Celda({ etiqueta, valor }) {
  return (
    <div className="p-3 rounded-lg bg-muted/50 text-center">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-1.5">
        {etiqueta}
      </p>
      <p className="font-display text-base font-bold text-foreground truncate" title={valor}>
        {valor}
      </p>
    </div>
  );
}

export default PanelDetalleEstacion;
