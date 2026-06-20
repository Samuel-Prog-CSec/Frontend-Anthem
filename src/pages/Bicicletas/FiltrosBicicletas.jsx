/**
 * Sub-componente FiltrosBicicletas
 *
 * Card de filtros - actualmente solo filtro de mes.
 */

import { Filter } from 'lucide-react';
import {
  Card, CardHeader, CardTitle, CardContent,
  Button, Select
} from '../../components/common';
import { opcionesMes } from './opcionesFiltros';

function FiltrosBicicletas({ filtros, onCambioFiltro, onLimpiar }) {
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
            <label htmlFor="filtro-mes-bicicletas" className="text-sm text-muted-foreground mb-1 block">
              Mes
            </label>
            <Select
              id="filtro-mes-bicicletas"
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

export default FiltrosBicicletas;
