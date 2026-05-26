/**
 * Sub-componente FiltrosCenso
 *
 * Card de filtros: distrito, grupo de edad y mes. Las opciones de
 * distrito se calculan en la pagina padre desde las estadisticas y se
 * inyectan por props (porque dependen del conjunto de distritos cargado).
 */

import { Filter, RefreshCw, X } from 'lucide-react';
import {
  Card, CardHeader, CardTitle, CardContent,
  Button, Select
} from '../../components/common';
import { opcionesGrupoEdad, opcionesMes } from './opcionesFiltros';

function FiltrosCenso({
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
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefrescar}
              aria-label="Refrescar datos"
            >
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
            options={opcionesGrupoEdad}
            value={filtros.grupoEdad}
            onChange={(e) => onCambioFiltro('grupoEdad', e.target.value)}
            placeholder="Todos los grupos de edad"
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

export default FiltrosCenso;
