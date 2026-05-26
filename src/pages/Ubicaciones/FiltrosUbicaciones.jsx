/**
 * Sub-componente FiltrosUbicaciones
 *
 * Card con selector de tipo + buscador por nombre (debounced en el padre)
 * y boton de limpiar.
 */

import { Filter, Search } from 'lucide-react';
import {
  Card, CardHeader, CardTitle, CardContent,
  Button, Input, Select
} from '../../components/common';
import { opcionesTipo } from './constantes';

function FiltrosUbicaciones({
  filtros,
  onCambioTipo,
  onCambioBusqueda,
  onLimpiar
}) {
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
            <label className="text-sm text-muted-foreground mb-1 block">Tipo de ubicacion</label>
            <Select
              value={filtros.tipo}
              onChange={onCambioTipo}
              options={opcionesTipo}
              placeholder="Todos los tipos"
            />
          </div>
          <div className="flex-1">
            <label className="text-sm text-muted-foreground mb-1 block">Buscar por nombre</label>
            <Input
              value={filtros.busqueda}
              onChange={onCambioBusqueda}
              placeholder="Buscar ubicacion..."
              startIcon={Search}
            />
          </div>
          <div className="flex items-end">
            <Button variant="ghost" onClick={onLimpiar}>
              Limpiar filtros
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default FiltrosUbicaciones;
