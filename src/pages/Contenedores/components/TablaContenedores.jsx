/**
 * Tabla paginada de contenedores con detalle de direccion y cantidad.
 * Subcomponente de PaginaContenedores.
 */

import { memo } from 'react';
import { Recycle } from 'lucide-react';
import {
  Card, CardHeader, CardTitle, CardDescription, CardContent,
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell, TableCaption,
  Badge, Pagination, EmptyState, ErrorState, TableSkeleton
} from '../../../components/common';
import { formatNumber, formatearNombreDistrito } from '../../../utils';
import { etiquetaTipoContenedor, varianteBadgePorTipo } from '../helpers';

const TablaContenedores = memo(function TablaContenedores({
  isLoading,
  error,
  datos,
  paginacionActual,
  totalDocuments,
  onCambioPagina,
  onRetry
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Listado de contenedores</CardTitle>
        <CardDescription>
          Distribucion individual por punto de aportacion. Click en una fila
          para ver mas detalle (proximamente).
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <TableSkeleton rows={8} columns={6} />
        ) : error ? (
          <ErrorState
            message={typeof error === 'string' ? error : (error?.message || 'Error al cargar contenedores')}
            onRetry={onRetry}
          />
        ) : datos.length === 0 ? (
          <EmptyState
            title="Sin contenedores"
            description="No se encontraron contenedores con los filtros seleccionados."
            icon={Recycle}
          />
        ) : (
          <>
            <Table label="Listado de contenedores" rowCount={totalDocuments}>
              <TableCaption className="sr-only">
                Tabla con contenedores filtrados
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Direccion</TableHead>
                  <TableHead>Distrito</TableHead>
                  <TableHead>Barrio</TableHead>
                  <TableHead className="text-center">Lote</TableHead>
                  <TableHead className="text-right">Cantidad</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {datos.map(c => (
                  <TableRow key={c._id}>
                    <TableCell>
                      <Badge variant={varianteBadgePorTipo(c.tipoContenedor)}>
                        {etiquetaTipoContenedor(c.tipoContenedor)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-foreground max-w-xs">
                      <span className="truncate block" title={c.direccion?.completa}>
                        {c.direccion?.completa || c.direccion?.nombre || '-'}
                      </span>
                    </TableCell>
                    <TableCell className="text-info font-medium">
                      {formatearNombreDistrito(c.distrito)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {c.barrio && c.barrio !== 'NO_ESPECIFICADO' ? c.barrio : '-'}
                    </TableCell>
                    <TableCell className="text-center text-muted-foreground font-mono">
                      {c.lote}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatNumber(c.cantidad)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <Pagination
              currentPage={paginacionActual.currentPage}
              totalPages={paginacionActual.totalPages}
              totalItems={paginacionActual.totalItems}
              itemsPerPage={paginacionActual.itemsPerPage}
              onPageChange={onCambioPagina}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
});

export { TablaContenedores };
