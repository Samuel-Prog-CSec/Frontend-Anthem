/**
 * Sub-componente DetallePuntosMedicion
 *
 * Card condicional que se muestra solo cuando el usuario filtra por un
 * tipo de medicion (estacion_acustica o punto_trafico).
 */

import { Gauge } from 'lucide-react';
import {
  Card, CardHeader, CardTitle, CardContent, CardDescription,
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
  EmptyState, TableSkeleton
} from '../../components/common';
import { LOCATION_TYPE_LABELS } from '../../constants';
import { formatearNombreDistrito } from '../../utils';

function DetallePuntosMedicion({ tipo, datos, isLoading }) {
  if (!tipo) return null;

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gauge className="size-5" aria-hidden="true" />
          Puntos de medicion - {LOCATION_TYPE_LABELS[tipo] || 'medicion'}
        </CardTitle>
        <CardDescription>Detalle de los puntos de medicion registrados.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <TableSkeleton rows={4} columns={3} />
        ) : datos.length === 0 ? (
          <EmptyState
            title="Sin datos de puntos de medicion"
            description="No se encontraron detalles para este tipo de medicion."
            icon={Gauge}
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>ID</TableHead>
                <TableHead>Distrito</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {datos.map((punto, index) => (
                <TableRow key={`punto-${index}`}>
                  <TableCell className="font-medium">{punto.nombre}</TableCell>
                  <TableCell className="text-muted-foreground font-mono">{punto.id}</TableCell>
                  <TableCell>{formatearNombreDistrito(punto.distrito)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

export default DetallePuntosMedicion;
