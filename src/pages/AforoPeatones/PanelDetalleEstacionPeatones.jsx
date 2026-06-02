/**
 * Panel de detalle de estacion de aforo peatonal.
 */

import { memo } from 'react';
import { X } from 'lucide-react';
import {
  Card, CardHeader, CardTitle, CardContent, CardDescription, Button, CardSkeleton
} from '../../components/common';
import { formatNumber, formatearNombreDistrito, descomponerIdentificadorAforo } from '../../utils';

function PanelDetalleEstacionPeatones({
  identificador,
  detalleEstacion,
  isLoading,
  onCerrar
}) {
  if (isLoading) {
    return <CardSkeleton lines={5} />;
  }

  if (!detalleEstacion?.data) {
    return null;
  }

  const resumen = detalleEstacion.data.summary || detalleEstacion.data.data || {};
  const partes = descomponerIdentificadorAforo(identificador);

  return (
    <Card className="mb-6 border-[var(--border-emphasis)]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-mono">
              {identificador}
            </CardTitle>
            {partes.legible && (
              <p className="text-xs text-muted-foreground mt-1">{partes.legible}</p>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCerrar}
            aria-label="Cerrar panel de detalle"
          >
            <X className="size-4" />
          </Button>
        </div>
        <CardDescription>Resumen de trafico peatonal de la estacion</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <p className="text-sm text-muted-foreground">Total Peatones</p>
            <p className="text-lg font-semibold text-foreground">
              {formatNumber(resumen.totalPeatones || 0)}
            </p>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <p className="text-sm text-muted-foreground">Mediciones</p>
            <p className="text-lg font-semibold text-foreground">
              {formatNumber(resumen.totalMediciones || 0)}
            </p>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <p className="text-sm text-muted-foreground">Distrito</p>
            <p className="text-lg font-semibold text-foreground">
              {formatearNombreDistrito(resumen.distrito)}
            </p>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <p className="text-sm text-muted-foreground">Nombre Vial</p>
            <p className="text-lg font-semibold text-foreground">
              {resumen.nombreVial || '-'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default memo(PanelDetalleEstacionPeatones);
