/**
 * Sub-componente FiltrosAforoBicicletas
 *
 * Card de filtros: distrito (extraido de las estaciones), franja
 * horaria y mes.
 */

import { Filter, RefreshCw, X } from 'lucide-react';
import {
  Card, CardHeader, CardTitle, CardContent,
  Button, Select
} from '../../components/common';
import { opcionesFranjaHoraria, opcionesMes } from './opcionesFiltros';

function FiltrosAforoBicicletas({
  filtros,
  opcionesDistrito,
  hayFiltrosActivos,
  onCambioFiltro,
  onLimpiar,
  onRefrescar
}) {
  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="size-4 text-cyan-400" aria-hidden="true" />
            <CardTitle className="text-base">Filtros</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {hayFiltrosActivos && (
              <Button variant="ghost" size="sm" onClick={onLimpiar}>
                <X className="size-4 mr-1" aria-hidden="true" />
                Limpiar
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={onRefrescar} aria-label="Refrescar">
              <RefreshCw className="size-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <Select
            options={opcionesDistrito}
            value={filtros.distrito}
            onChange={(e) => onCambioFiltro('distrito', e.target.value)}
            placeholder="Todos los distritos"
          />
          <Select
            options={opcionesFranjaHoraria}
            value={filtros.franjaHoraria}
            onChange={(e) => onCambioFiltro('franjaHoraria', e.target.value)}
            placeholder="Todas las franjas"
          />
          <Select
            options={opcionesMes}
            value={filtros.mes}
            onChange={(e) => onCambioFiltro('mes', e.target.value)}
            placeholder="Todos los meses"
          />
        </div>
      </CardContent>
    </Card>
  );
}

export default FiltrosAforoBicicletas;
