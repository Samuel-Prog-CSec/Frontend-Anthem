/**
 * Tabla con los 10 accidentes mas recientes en el distrito.
 *
 * Subcomponente de PaginaDistrito.
 */

import { memo } from 'react';
import { AlertTriangle } from 'lucide-react';
import {
  Card, CardHeader, CardTitle, CardDescription, CardContent,
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
  Badge, EmptyState, ErrorState, TableSkeleton
} from '../../../components/common';
import { formatDate } from '../../../utils';
import { obtenerVarianteBadgeGravedad, etiquetaTipoAccidente } from '../../Accidentes/helpers';

const TablaAccidentesRecientes = memo(function TablaAccidentesRecientes({
  accidentes,
  isLoading,
  error,
  onRetry,
  nombreDistrito
}) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <AlertTriangle className="size-5" />
          Accidentes recientes en {nombreDistrito}
        </CardTitle>
        <CardDescription>
          Los 10 accidentes mas recientes registrados en el distrito.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <TableSkeleton rows={5} columns={5} />
        ) : error ? (
          <ErrorState message={error.message} onRetry={onRetry} />
        ) : accidentes.length === 0 ? (
          <EmptyState
            title="Sin accidentes"
            description="No se encontraron accidentes registrados en este distrito."
            icon={AlertTriangle}
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Expediente</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Hora</TableHead>
                <TableHead>Calle</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Gravedad</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accidentes.map((record) => (
                <TableRow key={record._id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {record.numeroExpediente || '-'}
                  </TableCell>
                  <TableCell>{formatDate(record.fecha)}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {record.hora || '-'}
                  </TableCell>
                  <TableCell>{record.ubicacion?.calle || '-'}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {record.circunstancias?.tipoAccidente
                      ? etiquetaTipoAccidente(record.circunstancias.tipoAccidente)
                      : '-'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={obtenerVarianteBadgeGravedad(record.circunstancias?.gravedad)}>
                      {record.circunstancias?.gravedad || '-'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
});

export { TablaAccidentesRecientes };
