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
          Cumplimiento normativo
        </CardTitle>
        <CardDescription>
          Estado de cumplimiento de límites acústicos por estación
        </CardDescription>
      </CardHeader>
      <CardContent>
        {cargando ? (
          <ChartSkeleton height={300} />
        ) : datos.estaciones.length > 0 ? (
          <div className="flex flex-col gap-2 max-h-[440px] overflow-y-auto pr-1">
            {datos.resumen && (
              <div className="p-3 mb-1 border border-[var(--border-hairline)] bg-[var(--surface-inset)] flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                  Cumplimiento global ({datos.resumen.totalEstaciones} estaciones)
                </span>
                <Badge variant={datos.resumen.cumplimientoPromedioGlobal >= 80 ? 'success' : datos.resumen.cumplimientoPromedioGlobal >= 50 ? 'warning' : 'destructive'}>
                  {formatNumber(datos.resumen.cumplimientoPromedioGlobal, 1)} %
                </Badge>
              </div>
            )}
            {datos.estaciones.map((estacion) => (
              <div
                key={`compliance-${estacion.nmt}`}
                className="flex items-center justify-between p-3 border border-[var(--border-hairline)]"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-foreground truncate">{estacion.nombre}</p>
                  {/*
                    El wrapper aplica `uppercase` para el tono editorial
                    del CTC; las unidades "dB" se anyaden con
                    `normal-case` para que no se transformen en "DB"
                    (que no es la sigla correcta del decibelio).
                  */}
                  <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground mt-0.5">
                    NMT {estacion.nmt} / LAeq24 {formatNumber(estacion.promedioGeneral, 1)}<span className="normal-case"> dB</span> / diurno medio {formatNumber(estacion.promedioDiurno, 1)}<span className="normal-case"> dB</span>
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-3">
                  {estacion.excedencias > 0 && (
                    <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--caution)]">
                      {estacion.excedencias} / {estacion.totalMediciones} excede
                    </span>
                  )}
                  <Badge variant={estacion.cumple ? 'success' : estacion.porcentajeCumplimiento >= 50 ? 'warning' : 'destructive'}>
                    {formatNumber(estacion.porcentajeCumplimiento, 0)} %
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="Sin datos de cumplimiento"
            description="No se pudo obtener información de cumplimiento normativo."
            icon={ShieldCheck}
          />
        )}
      </CardContent>
    </Card>
  );
});

export { IndicadorCumplimiento };
