/**
 * Filtros del modulo Contenedores.
 * Subcomponente de PaginaContenedores.
 *
 * Cascada distrito -> barrio: el select de barrio depende del distrito
 * seleccionado, y se deshabilita si no hay distrito.
 */

import { memo } from 'react';
import { Filter, X } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Select, Button } from '../../../components/common';
import { opcionesTipoContenedor, opcionesLote } from '../helpers';

const FiltrosContenedores = memo(function FiltrosContenedores({
  filtros,
  opcionesDistrito,
  opcionesBarrio,
  cargandoBarrios,
  manejarCambioFiltro,
  limpiarFiltros
}) {
  const algunFiltroActivo = Boolean(
    filtros.tipoContenedor || filtros.lote || filtros.distrito || filtros.barrio
  );

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Filter className="size-5" aria-hidden="true" />
          Filtros
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="text-sm text-muted-foreground mb-1 block" htmlFor="filtro-tipo">
              Tipo de residuo
            </label>
            <Select
              id="filtro-tipo"
              value={filtros.tipoContenedor}
              onChange={(e) => manejarCambioFiltro('tipoContenedor', e.target.value)}
              options={opcionesTipoContenedor}
              placeholder="Todos los tipos"
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1 block" htmlFor="filtro-lote">
              Lote
            </label>
            <Select
              id="filtro-lote"
              value={filtros.lote}
              onChange={(e) => manejarCambioFiltro('lote', e.target.value)}
              options={opcionesLote}
              placeholder="Todos los lotes"
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1 block" htmlFor="filtro-distrito">
              Distrito
            </label>
            <Select
              id="filtro-distrito"
              value={filtros.distrito}
              onChange={(e) => manejarCambioFiltro('distrito', e.target.value)}
              options={opcionesDistrito}
              placeholder="Todos los distritos"
              opcionLimpiar="Todos los distritos"
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1 block" htmlFor="filtro-barrio">
              Barrio
            </label>
            <Select
              id="filtro-barrio"
              value={filtros.barrio}
              onChange={(e) => manejarCambioFiltro('barrio', e.target.value)}
              options={opcionesBarrio}
              placeholder={
                !filtros.distrito
                  ? 'Selecciona distrito primero'
                  : (cargandoBarrios ? 'Cargando barrios...' : 'Todos los barrios')
              }
              disabled={!filtros.distrito || cargandoBarrios}
            />
          </div>
          <div className="flex items-end">
            <Button
              variant="ghost"
              onClick={limpiarFiltros}
              disabled={!algunFiltroActivo}
              className="w-full"
            >
              <X className="size-4 mr-2" aria-hidden="true" />
              Limpiar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

export { FiltrosContenedores };
