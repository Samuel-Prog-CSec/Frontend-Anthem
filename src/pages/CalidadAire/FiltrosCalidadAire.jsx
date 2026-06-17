/**
 * Sub-componente FiltrosCalidadAire
 *
 * Card con selectores de contaminante y mes.
 */

import { Filter } from 'lucide-react';
import {
  Card, CardHeader, CardTitle, CardContent,
  Button, Select
} from '../../components/common';
import { opcionesMagnitud, opcionesMes } from './opcionesFiltros';

function FiltrosCalidadAire({ filtros, onCambioFiltro, onLimpiar }) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Filter className="size-5" aria-hidden="true" />
          Filtros
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="filtro-magnitud" className="text-sm text-muted-foreground mb-1 block">Contaminante</label>
            <Select
              id="filtro-magnitud"
              value={filtros.magnitud}
              onChange={(e) => onCambioFiltro('magnitud', e.target.value)}
              options={opcionesMagnitud}
              placeholder="Seleccionar contaminante"
            />
          </div>
          <div className="flex-1">
            <label htmlFor="filtro-mes" className="text-sm text-muted-foreground mb-1 block">Mes</label>
            <Select
              id="filtro-mes"
              value={filtros.mes}
              onChange={(e) => onCambioFiltro('mes', e.target.value)}
              options={opcionesMes}
              placeholder="Todos los meses"
            />
          </div>
          <div className="flex items-end">
            <Button variant="ghost" onClick={onLimpiar}>
              Limpiar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default FiltrosCalidadAire;
