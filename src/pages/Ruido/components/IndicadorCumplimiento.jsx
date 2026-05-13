/**
 * Indicador de cumplimiento normativo de niveles de ruido.
 * Subcomponente de PaginaRuido.
 */

import { memo } from 'react';
import { ShieldCheck } from 'lucide-react';
import {
  Card, CardHeader, CardTitle, CardDescription, CardContent,
  Badge, EmptyState, ChartSkeleton
} from '../../../components/common';
import { formatNumber } from '../../../utils';

const IndicadorCumplimiento = memo(function IndicadorCumplimiento({ datos, cargando }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="size-5" />
          Cumplimiento Normativo
        </CardTitle>
        <CardDescription>
          Estado de cumplimiento de limites acusticos por estacion
        </CardDescription>
      </CardHeader>
      <CardContent>
        {cargando ? (
          <ChartSkeleton height={300} />
        ) : datos.estaciones.length > 0 ? (
          <div className="flex flex-col gap-3">
            {datos.estaciones.map((estacion, index) => (
              <div
                key={`compliance-${estacion.nmt}-${index}`}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border/50"
              >
                <div className="flex-1">
                  <p className="font-medium text-sm text-white">{estacion.nombre}</p>
                  <p className="text-xs text-foreground0">
                    Diurno: {formatNumber(estacion.promedioDiurno, 1)} dB | Nocturno: {formatNumber(estacion.promedioNocturno, 1)} dB
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {estacion.excedencias > 0 && (
                    <span className="text-xs text-muted-foreground">{estacion.excedencias} excedencias</span>
                  )}
                  <Badge variant={estacion.cumple ? 'success' : 'destructive'}>
                    {estacion.cumple ? 'Cumple' : 'No cumple'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        ) : datos.resumen ? (
          <div className="flex flex-col gap-3">
            <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
              <p className="text-sm text-foreground/80">
                {datos.resumen.totalEstaciones != null && (
                  <span>Estaciones analizadas: <strong className="text-white">{datos.resumen.totalEstaciones}</strong></span>
                )}
              </p>
              {datos.resumen.porcentajeCumplimiento != null && (
                <p className="text-sm text-foreground/80 mt-2">
                  Cumplimiento: <Badge variant={datos.resumen.porcentajeCumplimiento >= 80 ? 'success' : 'destructive'}>
                    {formatNumber(datos.resumen.porcentajeCumplimiento, 1)}%
                  </Badge>
                </p>
              )}
            </div>
          </div>
        ) : (
          <EmptyState
            title="Sin datos de cumplimiento"
            description="No se pudo obtener informacion de cumplimiento normativo."
            icon={ShieldCheck}
          />
        )}
      </CardContent>
    </Card>
  );
});

export { IndicadorCumplimiento };
