/**
 * Panel de detalle de estacion de aforo peatonal.
 */

import { memo } from 'react';
import { X } from 'lucide-react';
import {
  Card, CardHeader, CardTitle, CardContent, CardDescription, Button, CardSkeleton
} from '../../components/common';
import { formatNumber, formatearNombreDistrito } from '../../utils';

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

  return (
    <Card className="mb-6 border-emerald-500/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">
            Estacion: {identificador}
          </CardTitle>
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
            <p className="text-lg font-semibold text-white">
              {formatNumber(resumen.totalPeatones || 0)}
            </p>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <p className="text-sm text-muted-foreground">Mediciones</p>
            <p className="text-lg font-semibold text-white">
              {formatNumber(resumen.totalMediciones || 0)}
            </p>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <p className="text-sm text-muted-foreground">Distrito</p>
            <p className="text-lg font-semibold text-white">
              {formatearNombreDistrito(resumen.distrito)}
            </p>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <p className="text-sm text-muted-foreground">Nombre Vial</p>
            <p className="text-lg font-semibold text-white">
              {resumen.nombreVial || '-'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default memo(PanelDetalleEstacionPeatones);
