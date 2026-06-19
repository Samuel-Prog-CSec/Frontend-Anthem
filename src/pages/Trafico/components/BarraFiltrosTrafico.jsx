/**
 * Barra de filtros obligatorios del modulo Trafico.
 *
 * El usuario debe especificar startDate y endDate (max 7 dias) para
 * que se ejecuten las queries pesadas. Tambien puede filtrar por
 * tipoElemento (URB | M30).
 */

import { memo, useState, useMemo } from 'react';
import { CalendarRange, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Select, Button, Input } from '../../../components/common';
import { cn } from '../../../utils';
import { opcionesTipoElemento, validarRangoMapa } from '../helpers';
import { TRAFICO_MAPA_MAX_DIAS } from '../../../constants';

// Semanas de muestra (1a semana de cada trimestre de 2051): atajos de un clic a
// un rango valido, para no tener que elegir dos fechas a mano dentro de un ano
// completo y para explorar la estacionalidad del trafico.
const PRESETS_RANGO = [
  { etiqueta: 'Enero', startDate: '2051-01-01', endDate: '2051-01-07' },
  { etiqueta: 'Abril', startDate: '2051-04-01', endDate: '2051-04-07' },
  { etiqueta: 'Julio', startDate: '2051-07-01', endDate: '2051-07-07' },
  { etiqueta: 'Octubre', startDate: '2051-10-01', endDate: '2051-10-07' }
];

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

  // Los presets son rangos validos de 7 dias: aplican directamente (un clic).
  const aplicarPreset = (preset) => {
    const next = { ...borrador, startDate: preset.startDate, endDate: preset.endDate };
    setBorrador(next);
    onAplicar(next);
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <CalendarRange className="size-5" aria-hidden="true" />
          Filtros del análisis
        </CardTitle>
        <CardDescription>
          Selecciona un rango de fechas (máximo {TRAFICO_MAPA_MAX_DIAS} días) y
          opcionalmente un tipo de vía para empezar el análisis. Sin filtros
          el sistema no carga datos por su volumen.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="text-sm text-muted-foreground mb-1 block" htmlFor="trafico-start">
              Fecha inicio
            </label>
            <Input
              id="trafico-start"
              type="date"
              value={borrador.startDate}
              onChange={(e) => setBorrador(b => ({ ...b, startDate: e.target.value }))}
              min="2051-01-01"
              max="2051-12-31"
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1 block" htmlFor="trafico-end">
              Fecha fin
            </label>
            <Input
              id="trafico-end"
              type="date"
              value={borrador.endDate}
              onChange={(e) => setBorrador(b => ({ ...b, endDate: e.target.value }))}
              min="2051-01-01"
              max="2051-12-31"
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1 block" htmlFor="trafico-tipo">
              Tipo de vía
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

        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">Saltar a una semana de muestra:</span>
          {PRESETS_RANGO.map((preset) => {
            const activo = borrador.startDate === preset.startDate && borrador.endDate === preset.endDate;
            return (
              <button
                key={preset.etiqueta}
                type="button"
                onClick={() => aplicarPreset(preset)}
                aria-pressed={activo}
                className={cn(
                  'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                  activo
                    ? 'border-dominio bg-dominio-soft text-dominio'
                    : 'border-border text-muted-foreground hover:border-[var(--border-emphasis)] hover:text-foreground'
                )}
              >
                {preset.etiqueta}
              </button>
            );
          })}
        </div>

        {!validacion.valido && (
          <div className="flex items-start gap-2 text-sm text-destructive">
            <AlertCircle className="size-4 mt-0.5 shrink-0" aria-hidden="true" />
            <span>{validacion.error}</span>
          </div>
        )}
        {validacion.valido && (
          <p className="text-xs text-muted-foreground">
            Rango de {validacion.dias} día{validacion.dias === 1 ? '' : 's'} seleccionado.
            Pulsa Aplicar filtros para cargar datos.
          </p>
        )}
      </CardContent>
    </Card>
  );
});

export { BarraFiltrosTrafico };
