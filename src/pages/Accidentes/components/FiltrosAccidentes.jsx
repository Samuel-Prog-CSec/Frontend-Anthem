/**
 * Filtros de la pagina de accidentes.
 * Subcomponente de PaginaAccidentes.
 */

import { memo } from 'react';
import { Filter } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Select, Button } from '../../../components/common';
import { opcionesMes, opcionesTipoAccidente, opcionesGravedad } from '../helpers';

const FiltrosAccidentes = memo(function FiltrosAccidentes({
  filtros,
  opcionesDistrito,
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
              options={opcionesDistrito}
              placeholder="Todos los distritos"
              opcionLimpiar="Todos los distritos"
            />
          </div>
          <div className="flex-1">
            <label htmlFor="filtro-tipo-accidente" className="text-sm text-muted-foreground mb-1 block">Tipo de accidente</label>
            <Select
              id="filtro-tipo-accidente"
              value={filtros.tipoAccidente}
              onChange={(e) => manejarCambioFiltro('tipoAccidente', e.target.value)}
              options={opcionesTipoAccidente}
              placeholder="Todos los tipos"
            />
          </div>
          <div className="flex-1">
            <label htmlFor="filtro-gravedad" className="text-sm text-muted-foreground mb-1 block">Gravedad</label>
            <Select
              id="filtro-gravedad"
              value={filtros.gravedad}
              onChange={(e) => manejarCambioFiltro('gravedad', e.target.value)}
              options={opcionesGravedad}
              placeholder="Todas las gravedades"
            />
          </div>
          <div className="flex-1">
            <label htmlFor="filtro-mes" className="text-sm text-muted-foreground mb-1 block">Mes</label>
            <Select
              id="filtro-mes"
              value={filtros.mes}
              onChange={(e) => manejarCambioFiltro('mes', e.target.value)}
              options={opcionesMes}
              placeholder="Todos los meses"
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

export { FiltrosAccidentes };
