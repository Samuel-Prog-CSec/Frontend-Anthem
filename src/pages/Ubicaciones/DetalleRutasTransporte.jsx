/**
 * Sub-componente DetalleRutasTransporte
 *
 * Card condicional que se muestra solo cuando el usuario filtra por un
 * tipo de transporte (cercanias, autobus, metro, etc.). Carga las rutas
 * via /ubicaciones/transporte/:tipo.
 */

import { Route as RouteIcon } from 'lucide-react';
import {
  Card, CardHeader, CardTitle, CardContent, CardDescription,
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
  EmptyState, TableSkeleton
} from '../../components/common';
import { LOCATION_TYPE_LABELS } from '../../constants';
import { formatNumber } from '../../utils';

function DetalleRutasTransporte({ tipo, datos, isLoading }) {
  if (!tipo) return null;

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RouteIcon className="size-5" aria-hidden="true" />
          Rutas de {LOCATION_TYPE_LABELS[tipo] || 'transporte'}
        </CardTitle>
        <CardDescription>Información detallada de las rutas disponibles.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <TableSkeleton rows={4} columns={3} />
        ) : datos.length === 0 ? (
          <EmptyState
            title="Sin resultados para estos filtros"
            description="No se encontraron detalles para este tipo de transporte."
            icon={RouteIcon}
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre de la ruta</TableHead>
                <TableHead className="text-center">Paradas</TableHead>
                <TableHead className="text-center">Puntos de ruta</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {datos.slice(0, 20).map((ruta, index) => (
                <TableRow key={ruta.nombre || `ruta-${index}`}>
                  <TableCell className="font-medium">{ruta.nombre}</TableCell>
                  <TableCell className="text-center font-mono">
                    {ruta.paradas > 0 ? formatNumber(ruta.paradas) : '-'}
                  </TableCell>
                  <TableCell className="text-center font-mono text-muted-foreground">
                    {ruta.waypoints > 0 ? formatNumber(ruta.waypoints) : '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        {datos.length > 20 && (
          <p className="text-xs text-muted-foreground mt-3">
            Mostrando las primeras 20 de {formatNumber(datos.length)} rutas.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default DetalleRutasTransporte;
