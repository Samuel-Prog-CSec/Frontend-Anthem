/**
 * Barra de filtros obligatorios del modulo Trafico.
 *
 * El usuario debe especificar startDate y endDate (max 7 dias) para
 * que se ejecuten las queries pesadas. Tambien puede filtrar por
 * tipoElemento (URB | M30).
 */

import { memo, useState, useMemo } from 'react';
import { CalendarRange, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Select, Button } from '../../../components/common';
import { opcionesTipoElemento, validarRangoMapa } from '../helpers';
import { TRAFICO_MAPA_MAX_DIAS } from '../../../constants';

const BarraFiltrosTrafico = memo(function BarraFiltrosTrafico({
  filtrosActivos,
  onAplicar
}) {
  const [borrador, setBorrador] = useState(filtrosActivos);

  const validacion = useMemo(
    () => validarRangoMapa(borrador.startDate, borrador.endDate),
    [borrador.startDate, borrador.endDate]
  );

  const aplicar = () => {
    if (!validacion.valido) {return;}
    onAplicar(borrador);
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <CalendarRange className="size-5" aria-hidden="true" />
          Filtros del analisis
        </CardTitle>
        <CardDescription>
          Selecciona un rango de fechas (maximo {TRAFICO_MAPA_MAX_DIAS} dias) y
          opcionalmente un tipo de via para empezar el analisis. Sin filtros
          el sistema no carga datos por su volumen.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="text-sm text-muted-foreground mb-1 block" htmlFor="trafico-start">
              Fecha inicio
            </label>
            <input
              id="trafico-start"
              type="date"
              value={borrador.startDate}
              onChange={(e) => setBorrador(b => ({ ...b, startDate: e.target.value }))}
              min="2051-01-01"
              max="2051-12-31"
              className="flex h-10 w-full rounded-md border border-border bg-input/60 px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1 block" htmlFor="trafico-end">
              Fecha fin
            </label>
            <input
              id="trafico-end"
              type="date"
              value={borrador.endDate}
              onChange={(e) => setBorrador(b => ({ ...b, endDate: e.target.value }))}
              min="2051-01-01"
              max="2051-12-31"
              className="flex h-10 w-full rounded-md border border-border bg-input/60 px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1 block" htmlFor="trafico-tipo">
              Tipo de via
            </label>
            <Select
              id="trafico-tipo"
              value={borrador.tipoElemento}
              onChange={(e) => setBorrador(b => ({ ...b, tipoElemento: e.target.value }))}
              options={opcionesTipoElemento}
              placeholder="Todos los tipos"
            />
          </div>
          <div className="flex items-end">
            <Button
              variant="primary"
              onClick={aplicar}
              disabled={!validacion.valido}
              className="w-full"
            >
              Aplicar filtros
            </Button>
          </div>
        </div>

        {!validacion.valido && (
          <div className="flex items-start gap-2 text-sm text-destructive">
            <AlertCircle className="size-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
            <span>{validacion.error}</span>
          </div>
        )}
        {validacion.valido && (
          <p className="text-xs text-muted-foreground">
            Rango de {validacion.dias} dia{validacion.dias === 1 ? '' : 's'} seleccionado.
            Click en Aplicar filtros para cargar datos.
          </p>
        )}
      </CardContent>
    </Card>
  );
});

export { BarraFiltrosTrafico };
