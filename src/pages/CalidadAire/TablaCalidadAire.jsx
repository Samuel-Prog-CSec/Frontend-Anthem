/**
 * Sub-componente TablaCalidadAire
 *
 * Tabla paginada de mediciones. Maneja sus tres estados (loading,
 * error, empty) y delega el cambio de pagina al padre via callback.
 */

import { Wind } from 'lucide-react';
import {
  Card, CardHeader, CardTitle, CardContent, CardDescription,
  Badge, Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
  ErrorState, EmptyState, Pagination, TableSkeleton
} from '../../components/common';
import { AIR_QUALITY_MAGNITUDES } from '../../constants';
import { formatDate, formatNumber } from '../../utils';
import { calcularPromedioDiario, obtenerNivelCalidadAire } from './helpers';

function TablaCalidadAire({
  data,
  paginacion,
  paginaActual,
  elementosPorPagina,
  magnitudFiltro,
  isLoading,
  error,
  onCambioPagina,
  onReintentar
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Mediciones de calidad del aire</CardTitle>
        <CardDescription>
          {AIR_QUALITY_MAGNITUDES[magnitudFiltro] || 'Todos los contaminantes'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <TableSkeleton rows={6} columns={5} />
        ) : error ? (
          <ErrorState
            message={error.message || 'Error al cargar datos de calidad del aire'}
            onRetry={onReintentar}
          />
        ) : data.length === 0 ? (
          <EmptyState
            title="Sin mediciones"
            description="No se encontraron mediciones con los filtros seleccionados."
            icon={Wind}
          />
        ) : (
          <>
            <Table
              label="Mediciones de calidad del aire"
              rowCount={paginacion?.totalDocuments}
              colCount={5}
            >
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Estacion</TableHead>
                  <TableHead>Contaminante</TableHead>
                  <TableHead className="text-right">Promedio</TableHead>
                  <TableHead>Calidad</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((record) => {
                  const avg = calcularPromedioDiario(record.medicionesHorarias);
                  // Pasamos `magnitud` para que el helper use la tabla EEA
                  // correcta de cada contaminante. Sin ella la antigua escala
                  // generica 0-50/51-100/... daba falsos "Buena" para valores
                  // de PM2.5 que ya excedian el limite OMS.
                  const level = obtenerNivelCalidadAire(avg, record.magnitud);

                  return (
                    <TableRow key={record._id}>
                      <TableCell className="font-medium">
                        {formatDate(record.fecha)}
                      </TableCell>
                      <TableCell>
                        {record.estacion || record.puntoMuestreo}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {AIR_QUALITY_MAGNITUDES[record.magnitud] || `Magnitud ${record.magnitud}`}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {avg != null ? `${formatNumber(avg, 2)} μg/m³` : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={level.variant}>
                          {level.label}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            <Pagination
              currentPage={paginaActual}
              totalPages={paginacion?.totalPages || 1}
              totalItems={paginacion?.totalDocuments || 0}
              itemsPerPage={elementosPorPagina}
              onPageChange={onCambioPagina}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default TablaCalidadAire;
