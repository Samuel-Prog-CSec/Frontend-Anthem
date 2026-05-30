/**
 * Sub-componente TablaCenso
 *
 * Tabla paginada de registros censales. Click sobre una fila dispara
 * la apertura del PanelDetalleDistrito en el padre.
 */

import {
  Card, CardHeader, CardTitle, CardContent, CardDescription,
  Badge,
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell, TableCaption,
  ErrorState, EmptyState, Pagination, TableSkeleton
} from '../../components/common';
import { ETIQUETAS_GRUPOS_EDAD, DATE_CONFIG, PAGINATION } from '../../constants';
import { formatNumber, formatearNombreDistrito } from '../../utils';
import { obtenerVarianteBadgeEdad, formatearPorcentaje } from './helpers';

function TablaCenso({
  datos,
  paginacion,
  paginaActual,
  isLoading,
  error,
  onCambioPagina,
  onClickFila,
  onReintentar
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Registros censales</CardTitle>
        <CardDescription>
          {paginacion
            ? `${formatNumber(paginacion.totalDocuments || paginacion.totalItems || 0)} registros encontrados`
            : 'Cargando...'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <TableSkeleton rows={6} columns={8} />
        ) : error ? (
          <ErrorState
            message="Error al cargar datos del censo"
            onRetry={onReintentar}
          />
        ) : datos.length === 0 ? (
          <EmptyState message="No se encontraron registros con los filtros seleccionados" />
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table
                label="Datos del censo demografico"
                rowCount={paginacion?.totalDocuments}
              >
                <TableCaption>
                  Datos del censo demografico - Anthem City {DATE_CONFIG.DATASET_YEAR}
                </TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Distrito</TableHead>
                    <TableHead>Barrio</TableHead>
                    <TableHead className="text-right">Pob. total</TableHead>
                    <TableHead className="text-right">Españoles</TableHead>
                    <TableHead className="text-right">Extranjeros</TableHead>
                    <TableHead className="text-right">% Extr.</TableHead>
                    <TableHead>Grupo edad</TableHead>
                    <TableHead className="text-right">Edad</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {datos.map((registro, index) => {
                    const stats = registro.estadisticas || {};
                    const grupoEdad = registro.clasificacionEdad?.grupoEdad;
                    const codigoDistrito = registro.distrito?.codigo;

                    return (
                      <TableRow
                        key={registro._id || index}
                        className="cursor-pointer hover:bg-muted/60"
                        onClick={() => onClickFila(codigoDistrito)}
                      >
                        <TableCell className="font-medium">
                          {formatearNombreDistrito(registro.distrito?.descripcion)}
                        </TableCell>
                        <TableCell>{registro.barrio?.descripcion || '-'}</TableCell>
                        <TableCell className="text-right font-mono">{formatNumber(stats.totalPoblacion)}</TableCell>
                        <TableCell className="text-right font-mono">{formatNumber(stats.totalEspañoles)}</TableCell>
                        <TableCell className="text-right font-mono">{formatNumber(stats.totalExtranjeros)}</TableCell>
                        <TableCell className="text-right font-mono">
                          {formatearPorcentaje(stats.porcentajeExtranjeros)}
                        </TableCell>
                        <TableCell>
                          {grupoEdad && (
                            <Badge variant={obtenerVarianteBadgeEdad(grupoEdad)}>
                              {ETIQUETAS_GRUPOS_EDAD[grupoEdad] || grupoEdad}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-mono">{registro.edad}</TableCell>
                      </TableRow>
                    );
                  })}
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

export default TablaCenso;
