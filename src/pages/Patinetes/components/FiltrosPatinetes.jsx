/**
 * Filtros de la pagina de patinetes.
 * Subcomponente de PaginaPatinetes.
 */

import { memo } from 'react';
import { Filter } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Select, Button } from '../../../components/common';
import { densityOptions, zoneTypeOptions } from '../helpers';

const FiltrosPatinetes = memo(function FiltrosPatinetes({
  filtros,
  districtOptions,
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
            <label htmlFor="filtro-distrito" className="text-sm text-muted-foreground mb-1 block">Distrito</label>
            <Select
              id="filtro-distrito"
              value={filtros.distrito}
              onChange={(e) => manejarCambioFiltro('distrito', e.target.value)}
              options={districtOptions}
              placeholder="Todos los distritos"
            />
          </div>
          <div className="flex-1">
            <label htmlFor="filtro-densidad" className="text-sm text-muted-foreground mb-1 block">Densidad</label>
            <Select
              id="filtro-densidad"
              value={filtros.densidad}
              onChange={(e) => manejarCambioFiltro('densidad', e.target.value)}
              options={densityOptions}
              placeholder="Todas las densidades"
            />
          </div>
          <div className="flex-1">
            <label htmlFor="filtro-tipo-zona" className="text-sm text-muted-foreground mb-1 block">Tipo de zona</label>
            <Select
              id="filtro-tipo-zona"
              value={filtros.tipoZona}
              onChange={(e) => manejarCambioFiltro('tipoZona', e.target.value)}
              options={zoneTypeOptions}
              placeholder="Todos los tipos"
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

export { FiltrosPatinetes };
