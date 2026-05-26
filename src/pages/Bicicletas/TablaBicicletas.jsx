/**
 * Sub-componente TablaBicicletas
 *
 * Tabla paginada con la disponibilidad diaria de bicicletas.
 */

import { Bike } from 'lucide-react';
import {
  Card, CardHeader, CardTitle, CardContent, CardDescription,
  Badge,
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell, TableCaption,
  ErrorState, EmptyState, Pagination, TableSkeleton
} from '../../components/common';
import { formatDate, formatNumber } from '../../utils';
import { obtenerBadgeOcupacion } from './helpers';

function TablaBicicletas({
  datos,
  paginacion,
  isLoading,
  error,
  onCambioPagina,
  onReintentar
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Disponibilidad de bicicletas</CardTitle>
        <CardDescription>
          Datos diarios de uso y disponibilidad del servicio de bicicletas.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <TableSkeleton rows={6} columns={9} />
        ) : error ? (
          <ErrorState message={error} onRetry={onReintentar} />
        ) : datos.length === 0 ? (
          <EmptyState
            title="Sin datos de disponibilidad"
            description="No se encontraron registros con los filtros seleccionados."
            icon={Bike}
          />
        ) : (
          <>
            <Table
              label="Disponibilidad diaria de bicicletas"
              rowCount={paginacion?.totalItems}
            >
              <TableCaption className="sr-only">
                Datos diarios de disponibilidad y uso de bicicletas
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Dia</TableHead>
                  <TableHead>Horas uso</TableHead>
                  <TableHead>Horas disponibilidad</TableHead>
                  <TableHead>Media bicis</TableHead>
                  <TableHead>Usos anual</TableHead>
                  <TableHead>Usos ocasional</TableHead>
                  <TableHead>Total usos</TableHead>
                  <TableHead>Tasa ocupacion</TableHead>
                  <TableHead>Usos/bici</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {datos.map(item => (
                  <TableRow key={item._id}>
                    <TableCell>{formatDate(item.dia)}</TableCell>
                    <TableCell className="font-mono">{formatNumber(item.horasTotalesUsosBicicletas, 1)}</TableCell>
                    <TableCell className="font-mono">{formatNumber(item.horasTotalesDisponibilidadBicicletasEnAnclajes, 1)}</TableCell>
                    <TableCell className="font-mono">{formatNumber(item.mediaBicicletasDisponibles, 1)}</TableCell>
                    <TableCell className="font-mono">{formatNumber(item.usosAbonadoAnual)}</TableCell>
                    <TableCell className="font-mono">{formatNumber(item.usosAbonadoOcasional)}</TableCell>
                    <TableCell className="font-mono font-medium">{formatNumber(item.totalUsos)}</TableCell>
                    <TableCell>
                      <Badge variant={obtenerBadgeOcupacion(item.tasaOcupacion)}>
                        {item.tasaOcupacion != null ? `${item.tasaOcupacion.toFixed(1)}%` : '-'}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono">{item.promedioUsosPorBicicleta?.toFixed(2) || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <Pagination
              currentPage={paginacion.currentPage}
              totalPages={paginacion.totalPages}
              totalItems={paginacion.totalItems}
              itemsPerPage={paginacion.itemsPerPage}
              onPageChange={onCambioPagina}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default TablaBicicletas;
