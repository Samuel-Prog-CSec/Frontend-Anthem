/**
 * Tabla principal de asignaciones de patinetes con paginacion.
 * Subcomponente de PaginaPatinetes.
 */

import { memo } from 'react';
import { Zap } from 'lucide-react';
import {
  Card, CardHeader, CardTitle, CardDescription, CardContent,
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell, TableCaption,
  Badge, Pagination, EmptyState, ErrorState, TableSkeleton
} from '../../../components/common';
import { formatNumber } from '../../../utils';
import { obtenerVarianteBadgeDensidad, obtenerVarianteBadgeDemanda } from '../helpers';

/**
 * Convierte un enum tipo 'MUY_ALTA' / 'ZONA_RESIDENCIAL' en una etiqueta
 * legible 'Muy alta' / 'Zona residencial' (sentence case).
 */
function formatearEtiqueta(valor) {
  if (!valor) { return '-'; }
  const texto = valor.replace(/_/g, ' ').toLowerCase();
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

const TablaPatinetes = memo(function TablaPatinetes({
  isLoading,
  error,
  datos,
  paginacionActual,
  totalDocuments,
  onCambioPagina,
  onClickArea,
  onRetry
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Asignaciones de patinetes</CardTitle>
        <CardDescription>
          Distribución de patinetes por distrito y barrio
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <TableSkeleton rows={6} columns={6} />
        ) : error ? (
          <ErrorState
            message={error}
            onRetry={onRetry}
          />
        ) : datos.length === 0 ? (
          <EmptyState
            title="Sin resultados para estos filtros"
            description="No se encontraron asignaciones con los filtros seleccionados."
            icon={Zap}
          />
        ) : (
          <>
            <Table label="Asignaciones de patinetes" rowCount={totalDocuments}>
              <TableCaption className="sr-only">Tabla de asignacion de patinetes por distrito y barrio</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Distrito</TableHead>
                  <TableHead>Barrio</TableHead>
                  <TableHead className="text-right">Total patinetes</TableHead>
                  <TableHead className="text-center">Proveedores</TableHead>
                  <TableHead className="text-center">Densidad</TableHead>
                  <TableHead>Tipo de zona</TableHead>
                  <TableHead className="text-center">Demanda</TableHead>
                  <TableHead>Proveedor dominante</TableHead>
                  <TableHead className="text-right">HHI</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {datos.map(item => (
                  <TableRow
                    key={item._id}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => onClickArea(item.distrito?.nombre, item.barrio?.nombre)}
                  >
                    <TableCell className="font-medium text-info">
                      {item.distrito?.nombre}
                    </TableCell>
                    <TableCell>
                      {item.barrio?.nombre}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatNumber(item.estadisticas?.totalPatinetes)}
                    </TableCell>
                    <TableCell className="text-center">
                      {item.estadisticas?.proveedoresActivos}/{item.estadisticas?.totalProveedores}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={obtenerVarianteBadgeDensidad(item.estadisticas?.densidadPatinetes)}>
                        {formatearEtiqueta(item.estadisticas?.densidadPatinetes)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {formatearEtiqueta(item.clasificacionArea?.tipoZona)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={obtenerVarianteBadgeDemanda(item.clasificacionArea?.demandaEstimada)}>
                        {formatearEtiqueta(item.clasificacionArea?.demandaEstimada)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {item.analisisDistribucion?.proveedorDominante?.nombre || '-'}
                    </TableCell>
                    <TableCell className="text-right font-mono text-foreground/80">
                      {formatNumber(item.analisisDistribucion?.indiceHerfindahl)}
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

export { TablaPatinetes };
