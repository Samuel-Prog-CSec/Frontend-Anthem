/**
 * Sub-componente FiltrosCenso
 *
 * Card de filtros: distrito, grupo de edad y mes. Las opciones de
 * distrito se calculan en la pagina padre desde las estadisticas y se
 * inyectan por props (porque dependen del conjunto de distritos cargado).
 *
 * El dataset Anthem 2051 trae 12 snapshots mensuales: el censo tiene una
 * fila por persona-edad-seccion y mes (~237k personas x 12 = 2.85 M
 * filas). Cuando el usuario no aplica filtros se le muestra ese total y
 * el listado paginado lo hace inmanejable; el banner explica por que el
 * conteo es tan alto y sugiere acotar para una "foto" puntual.
 */

import { Filter, RefreshCw, X, Info } from 'lucide-react';
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
        {!hayFiltrosActivos && (
          <div className="flex items-start gap-3 mb-4 p-3 rounded-md bg-cyan-500/5 border border-cyan-500/20">
            <Info className="size-4 text-cyan-400 mt-0.5 flex-shrink-0" aria-hidden="true" />
            <p className="text-sm text-muted-foreground">
              El censo tiene una fila por persona, edad, seccion y mes (12 snapshots
              al año). Por eso ves <span className="font-mono text-foreground">2,85 M</span> registros
              sin filtros. Aplica un mes concreto para una "foto" mensual (~237k filas) o
              acota tambien por grupo de edad para granularidades manejables.
            </p>
          </div>
        )}
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
