/**
 * Tabla paginada de registros de Aforo de Peatones.
 */

import { memo } from 'react';
import {
  Card, CardHeader, CardTitle, CardContent, CardDescription,
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell, TableCaption,
  Badge, TableSkeleton, ErrorState, EmptyState, Pagination
} from '../../components/common';
import { PAGINATION, FRANJAS_HORARIAS, ETIQUETAS_FRANJAS_HORARIAS, DATE_CONFIG } from '../../constants';
import { formatNumber, formatDate, formatHour, formatearNombreDistrito, descomponerIdentificadorAforo } from '../../utils';

function obtenerVarianteBadgeFranja(franja) {
  switch (franja) {
    case FRANJAS_HORARIAS.MADRUGADA: return 'secondary';
    case FRANJAS_HORARIAS.MAÑANA: return 'info';
    case FRANJAS_HORARIAS.MEDIODIA: return 'success';
    case FRANJAS_HORARIAS.TARDE: return 'warning';
    case FRANJAS_HORARIAS.NOCHE: return 'secondary';
    default: return 'secondary';
  }
}

function TablaAforoPeatones({
  datos,
  paginacion,
  paginaActual,
  isLoading,
  error,
  onCambioPagina,
  onClickEstacion,
  onReintentar
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Registros de Aforo Peatonal</CardTitle>
        <CardDescription>
          {paginacion
            ? `${formatNumber(paginacion.totalDocuments || paginacion.totalItems || 0)} registros encontrados`
            : 'Cargando...'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <TableSkeleton rows={6} columns={6} />
        ) : error ? (
          <ErrorState
            message="Error al cargar datos de aforo peatonal"
            onRetry={onReintentar}
          />
        ) : datos.length === 0 ? (
          <EmptyState message="No se encontraron registros con los filtros seleccionados" />
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table label="Aforo de peatones por hora" rowCount={paginacion?.totalDocuments}>
                <TableCaption>Aforo de peatones - Anthem City {DATE_CONFIG.DATASET_YEAR}</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Hora</TableHead>
                    <TableHead>Identificador</TableHead>
                    <TableHead className="text-right">Peatones</TableHead>
                    <TableHead>Distrito</TableHead>
                    <TableHead>Nombre vial</TableHead>
                    <TableHead>Franja</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {datos.map((registro, index) => (
                    <TableRow
                      key={registro._id || `aforo-peatones-${index}`}
                      className="cursor-pointer hover:bg-muted/60"
                      onClick={() => onClickEstacion(registro.identificador)}
                    >
                      <TableCell>{formatDate(registro.fecha)}</TableCell>
                      <TableCell>{formatHour(registro.hora)}</TableCell>
                      <TableCell className="font-medium font-mono text-xs"
                        title={descomponerIdentificadorAforo(registro.identificador).legible || registro.identificador}
                      >
                        {registro.identificador}
                      </TableCell>
                      <TableCell className="text-right font-semibold">{formatNumber(registro.peatones)}</TableCell>
                      <TableCell>{formatearNombreDistrito(registro.ubicacion?.distrito)}</TableCell>
                      <TableCell>{registro.ubicacion?.nombreVial || '-'}</TableCell>
                      <TableCell>
                        {registro.franjaHoraria && (
                          <Badge variant={obtenerVarianteBadgeFranja(registro.franjaHoraria)}>
                            {ETIQUETAS_FRANJAS_HORARIAS[registro.franjaHoraria] || registro.franjaHoraria}
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {paginacion && (
              <div className="mt-4">
                <Pagination
                  currentPage={paginaActual}
                  totalPages={paginacion.totalPages || 1}
                  totalItems={paginacion.totalDocuments || paginacion.totalItems || 0}
                  itemsPerPage={PAGINATION.DEFAULT_LIMIT}
                  onPageChange={onCambioPagina}
                />
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default memo(TablaAforoPeatones);
