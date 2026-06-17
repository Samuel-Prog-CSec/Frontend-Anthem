/**
 * Sub-componente TablaMultas
 *
 * Tabla paginada del registro de multas. Click sobre una fila abre
 * (via callback al padre) el PanelDetalleMulta.
 */

import {
  Card, CardHeader, CardTitle, CardContent, CardDescription,
  Badge,
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell, TableCaption,
  ErrorState, EmptyState, Pagination, TableSkeleton
} from '../../components/common';
import { ETIQUETAS_CALIFICACION_MULTA, DATE_CONFIG, PAGINATION } from '../../constants';
import { formatNumber, formatDate, aTituloCase } from '../../utils';
import { obtenerVarianteBadgeCalificacion, formatearImporte, formatearLugar } from './helpers';

function TablaMultas({
  datos,
  paginacion,
  paginaActual,
  isLoading,
  error,
  onCambioPagina,
  onClickMulta,
  onReintentar
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Registro de multas</CardTitle>
        <CardDescription>
          {paginacion
            ? `${formatNumber(paginacion.totalDocuments || paginacion.totalItems || 0)} multas encontradas`
            : 'Cargando...'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <TableSkeleton rows={6} columns={8} />
        ) : error ? (
          <ErrorState message="Error al cargar multas" onRetry={onReintentar} />
        ) : datos.length === 0 ? (
          <EmptyState message="No se encontraron multas con los filtros seleccionados" />
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table
                label="Listado de multas de tráfico"
                rowCount={paginacion?.totalDocuments}
              >
                <TableCaption>
                  Multas de tráfico - Anthem City {DATE_CONFIG.DATASET_YEAR}
                </TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Hora</TableHead>
                    <TableHead>Lugar</TableHead>
                    <TableHead>Calificación</TableHead>
                    <TableHead className="text-right">Importe</TableHead>
                    <TableHead>Descuento</TableHead>
                    <TableHead className="text-right">Puntos</TableHead>
                    <TableHead>Denunciante</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {datos.map((multa, index) => (
                    <TableRow
                      key={multa._id || index}
                      className="cursor-pointer hover:bg-muted/60"
                      onClick={() => onClickMulta(multa._id)}
                    >
                      <TableCell>{formatDate(multa.fecha)}</TableCell>
                      {/* El CSV guarda la hora como "HH.MM" con punto.
                          Para presentacion convertimos a "HH:MM" para que
                          coincida con la convencion europea estandar. */}
                      <TableCell>{multa.hora ? multa.hora.replace('.', ':') : '-'}</TableCell>
                      <TableCell className="max-w-[200px] truncate" title={multa.lugar}>
                        {formatearLugar(multa.lugar)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={obtenerVarianteBadgeCalificacion(multa.calificacion)}>
                          {ETIQUETAS_CALIFICACION_MULTA[multa.calificacion] || multa.calificacion}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatearImporte(multa.importeFinal || multa.importeBoletín)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={multa.tieneDescuento ? 'success' : 'secondary'}>
                          {multa.tieneDescuento ? 'Sí' : 'No'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {multa.puntosDetraídos || 0}
                      </TableCell>
                      <TableCell className="text-sm">{multa.denunciante ? aTituloCase(multa.denunciante) : '-'}</TableCell>
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

export default TablaMultas;
