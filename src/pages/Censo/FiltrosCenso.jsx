/**
 * Sub-componente FiltrosCenso
 *
 * Card de filtros: distrito, grupo de edad y mes. Las opciones de
 * distrito se calculan en la pagina padre desde las estadisticas y se
 * inyectan por props (porque dependen del conjunto de distritos cargado).
 *
 * Los datos de Anthem 2051 traen doce fotos mensuales: el censo tiene una
 * fila por persona, edad y seccion en cada mes. Cuando el usuario no aplica
 * filtros se le muestra ese total y el listado paginado se hace inmanejable;
 * el banner explica por que el conteo es tan alto y sugiere acotar para una
 * foto puntual.
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
  opcionesBarrio = [],
  hayFiltrosActivos,
  onCambioFiltro,
  onLimpiar,
  onRefrescar
}) {
  // El barrio depende del distrito: el backend filtra por codigo de barrio
  // (numerico) y las opciones se calculan desde los barrios del distrito
  // seleccionado. Sin distrito no hay barrios que ofrecer, asi que el control
  // se deshabilita en vez de mostrar una lista vacia.
  const barrioDeshabilitado = !filtros.distrito || opcionesBarrio.length === 0;
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
              aria-label="Recargar datos"
            >
              <RefreshCw className="size-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!hayFiltrosActivos && (
          <div className="flex items-start gap-3 mb-4 p-3 rounded-md bg-info/5 border border-info/20">
            <Info className="size-4 text-info mt-0.5 shrink-0" aria-hidden="true" />
            <p className="text-sm text-muted-foreground">
              El censo tiene una fila por persona, edad y sección en cada mes, y hay
              doce meses. Por eso, sin filtros, ves todos los registros del año a la vez.
              Aplica un mes concreto para ver una foto mensual, o acota también por grupo
              de edad para manejar mejor el listado.
            </p>
          </div>
        )}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Select
            options={opcionesDistrito}
            value={filtros.distrito}
            onChange={(e) => onCambioFiltro('distrito', e.target.value)}
            placeholder="Todos los distritos"
            ariaLabel="Filtrar por distrito"
          />
          <Select
            options={opcionesBarrio}
            value={filtros.barrio}
            onChange={(e) => onCambioFiltro('barrio', e.target.value)}
            placeholder={barrioDeshabilitado ? 'Elige un distrito' : 'Todos los barrios'}
            disabled={barrioDeshabilitado}
            ariaLabel="Filtrar por barrio"
          />
          <Select
            options={opcionesGrupoEdad}
            value={filtros.grupoEdad}
            onChange={(e) => onCambioFiltro('grupoEdad', e.target.value)}
            placeholder="Todos los grupos de edad"
            ariaLabel="Filtrar por grupo de edad"
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
