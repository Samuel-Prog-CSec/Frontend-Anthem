/**
 * Sub-componente TablaUbicaciones
 *
 * Tabla principal de ubicaciones (paginada). Cada fila resalta el tipo
 * con un Badge coloreado segun `variantesBadgePorTipo`.
 */

import { MapPin } from 'lucide-react';
import {
  Card, CardHeader, CardTitle, CardContent,
  Badge,
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
  ErrorState, EmptyState, Pagination, TableSkeleton
} from '../../components/common';
import { LOCATION_TYPE_LABELS, nombreDistrito } from '../../constants';
import { formatUbicacionCoords } from '../../utils';
import { iconosPorTipo, variantesBadgePorTipo } from './constantes';

function TablaUbicaciones({
  locations,
  paginacion,
  paginaActual,
  elementosPorPagina,
  isLoading,
  error,
  onCambioPagina,
  onReintentar
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Listado de ubicaciones</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <TableSkeleton rows={6} columns={5} />
        ) : error ? (
          <ErrorState
            message={error.message || 'Error al cargar ubicaciones'}
            onRetry={onReintentar}
          />
        ) : locations.length === 0 ? (
          <EmptyState
            title="Sin resultados para estos filtros"
            description="No se encontraron ubicaciones con los filtros seleccionados."
            icon={MapPin}
          />
        ) : (
          <>
            <Table
              label="Listado de ubicaciones"
              rowCount={paginacion?.totalDocuments}
              colCount={5}
            >
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead className="hidden md:table-cell">ID</TableHead>
                  <TableHead className="hidden lg:table-cell">Distrito</TableHead>
                  <TableHead className="hidden xl:table-cell">Coordenadas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {locations.map((location) => {
                  const Icon = iconosPorTipo[location.tipo] || MapPin;
                  return (
                    <TableRow key={location._id}>
                      <TableCell>
                        <Badge variant={variantesBadgePorTipo[location.tipo] || 'default'}>
                          <Icon className="size-3 mr-1" aria-hidden="true" />
                          {LOCATION_TYPE_LABELS[location.tipo] || location.tipo}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {location.nombre || '-'}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground font-mono">
                        {location.nmt || location.id_punto || location._id.slice(-6)}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {nombreDistrito(location.distrito)}
                      </TableCell>
                      <TableCell className="hidden xl:table-cell text-sm text-muted-foreground font-mono">
                        {formatUbicacionCoords(location)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            <Pagination
              currentPage={paginaActual}
              totalPages={paginacion?.totalPages || 1}
              totalItems={paginacion?.totalDocuments || 0}
              itemsPerPage={elementosPorPagina}
              onPageChange={onCambioPagina}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default TablaUbicaciones;
