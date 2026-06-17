/**
 * Filtros para la pagina de Aforo de Peatones.
 */

import { memo } from 'react';
import { Filter, RefreshCw, X } from 'lucide-react';
import {
  Card, CardHeader, CardContent, CardTitle,
  Button, Select
} from '../../components/common';
import { ETIQUETAS_FRANJAS_HORARIAS } from '../../constants';

const opcionesFranjaHoraria = Object.entries(ETIQUETAS_FRANJAS_HORARIAS).map(([value, label]) => ({
  value, label
}));

const opcionesMes = Array.from({ length: 12 }, (_, i) => ({
  value: String(i + 1),
  label: new Date(2051, i, 1).toLocaleString('es-ES', { month: 'long' })
}));

function FiltrosAforoPeatones({
  filtros,
  opcionesDistrito,
  hayFiltrosActivos,
  onCambioFiltro,
  onLimpiarFiltros,
  onRefrescar
}) {
  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="size-4 text-muted-foreground" />
            <CardTitle className="text-base">Filtros</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {hayFiltrosActivos && (
              <Button variant="ghost" size="sm" onClick={onLimpiarFiltros}>
                <X className="size-4 mr-1" />
                Limpiar
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefrescar}
              aria-label="Recargar datos"
            >
              <RefreshCw className="size-4" />
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
            aria-label="Filtrar por distrito"
          />
          <Select
            options={opcionesFranjaHoraria}
            value={filtros.franjaHoraria}
            onChange={(e) => onCambioFiltro('franjaHoraria', e.target.value)}
            placeholder="Todas las franjas"
            aria-label="Filtrar por franja horaria"
          />
          <Select
            options={opcionesMes}
            value={filtros.mes}
            onChange={(e) => onCambioFiltro('mes', e.target.value)}
            placeholder="Todos los meses"
            aria-label="Filtrar por mes"
          />
        </div>
      </CardContent>
    </Card>
  );
}

export default memo(FiltrosAforoPeatones);
