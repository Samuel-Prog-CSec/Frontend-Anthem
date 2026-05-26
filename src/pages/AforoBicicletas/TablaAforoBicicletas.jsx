/**
 * Sub-componente TablaAforoBicicletas
 *
 * Tabla paginada de aforos horarios. Click sobre fila abre el panel de
 * detalle de la estacion.
 */

import {
  Card, CardHeader, CardTitle, CardContent, CardDescription,
  Badge,
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell, TableCaption,
  ErrorState, EmptyState, Pagination, TableSkeleton
} from '../../components/common';
import { ETIQUETAS_FRANJAS_HORARIAS, DATE_CONFIG, PAGINATION } from '../../constants';
import { formatNumber, formatDate } from '../../utils';
import { obtenerVarianteBadgeFranja } from './helpers';

function TablaAforoBicicletas({
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
        <CardTitle className="text-base">Registros de aforo</CardTitle>
        <CardDescription>
          {paginacion
            ? `${formatNumber(paginacion.totalDocuments || paginacion.totalItems || 0)} registros encontrados`
            : 'Cargando...'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <TableSkeleton rows={6} columns={7} />
        ) : error ? (
          <ErrorState
            message="Error al cargar datos de aforo"
            onRetry={onReintentar}
          />
        ) : datos.length === 0 ? (
          <EmptyState message="No se encontraron registros con los filtros seleccionados" />
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table
                label="Aforo de bicicletas por hora"
                rowCount={paginacion?.totalDocuments}
              >
                <TableCaption>
                  Aforo de bicicletas - Anthem City {DATE_CONFIG.DATASET_YEAR}
                </TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Hora</TableHead>
                    <TableHead>Identificador</TableHead>
                    <TableHead className="text-right">Bicicletas</TableHead>
                    <TableHead>Distrito</TableHead>
                    <TableHead>Nombre vial</TableHead>
                    <TableHead>Franja</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {datos.map((registro, index) => (
                    <TableRow
                      key={registro._id || index}
                      className="cursor-pointer hover:bg-muted/60"
                      onClick={() => onClickEstacion(registro.identificador)}
                    >
                      <TableCell>{formatDate(registro.fecha)}</TableCell>
                      <TableCell className="font-mono">{registro.hora}:00</TableCell>
                      <TableCell className="font-medium">{registro.identificador}</TableCell>
                      <TableCell className="text-right font-mono">{registro.bicicletas}</TableCell>
                      <TableCell>{registro.ubicacion?.distrito || '-'}</TableCell>
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

export default TablaAforoBicicletas;
