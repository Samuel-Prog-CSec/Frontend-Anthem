/**
 * Filtros de la pagina de ruido.
 * Subcomponente de PaginaRuido.
 */

import { memo } from 'react';
import { Filter } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Select, Button } from '../../../components/common';
import { opcionesMes } from '../helpers';

const FiltrosRuido = memo(function FiltrosRuido({
  filtros,
  stationOptions,
  manejarCambioFiltro,
  limpiarFiltros
}) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Filter className="size-5" />
          Filtros
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="text-sm text-slate-400 mb-1 block">Mes</label>
            <Select
              value={filtros.mes}
              onChange={(e) => manejarCambioFiltro('mes', e.target.value)}
              options={opcionesMes}
              placeholder="Todos los meses"
            />
          </div>
          <div className="flex-1">
            <label className="text-sm text-slate-400 mb-1 block">Estacion (NMT)</label>
            <Select
              value={filtros.nmt}
              onChange={(e) => manejarCambioFiltro('nmt', e.target.value)}
              options={stationOptions}
              placeholder="Todas las estaciones"
            />
          </div>
          <div className="flex items-end">
            <Button variant="ghost" onClick={limpiarFiltros}>
              Limpiar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

export { FiltrosRuido };
