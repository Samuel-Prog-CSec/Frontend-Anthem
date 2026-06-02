/**
 * Sub-componente FiltrosMultas
 *
 * Card de filtros (calificacion, denunciante, mes, descuento) con
 * botones de limpiar y refrescar en la cabecera.
 */

import { Filter, RefreshCw, X } from 'lucide-react';
import {
  Card, CardHeader, CardTitle, CardContent,
  Button, Select
} from '../../components/common';
import {
  opcionesCalificacion, opcionesDenunciante, opcionesMes, opcionesDescuento
} from './opcionesFiltros';

function FiltrosMultas({
  filtros,
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
            <Filter className="size-4 text-muted-foreground" aria-hidden="true" />
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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Select
            options={opcionesCalificacion}
            value={filtros.calificacion}
            onChange={(e) => onCambioFiltro('calificacion', e.target.value)}
            placeholder="Todas las calificaciones"
          />
          <Select
            options={opcionesDenunciante}
            value={filtros.denunciante}
            onChange={(e) => onCambioFiltro('denunciante', e.target.value)}
            placeholder="Todos los denunciantes"
          />
          <Select
            options={opcionesMes}
            value={filtros.mes}
            onChange={(e) => onCambioFiltro('mes', e.target.value)}
            placeholder="Todos los meses"
          />
          <Select
            options={opcionesDescuento}
            value={filtros.tieneDescuento}
            onChange={(e) => onCambioFiltro('tieneDescuento', e.target.value)}
            placeholder="Descuento: todos"
          />
        </div>
      </CardContent>
    </Card>
  );
}

export default FiltrosMultas;
