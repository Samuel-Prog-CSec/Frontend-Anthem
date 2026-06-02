/**
 * Tabla principal de mediciones de ruido con paginacion.
 * Subcomponente de PaginaRuido.
 */

import { memo } from 'react';
import { Volume2, Sun, Sunset, Moon } from 'lucide-react';
import {
  Card, CardHeader, CardTitle, CardDescription, CardContent,
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
  Badge, Pagination, EmptyState, ErrorState, TableSkeleton
} from '../../../components/common';
import { formatDate, formatNumber } from '../../../utils';
import { obtenerVarianteBadgeRuido } from '../helpers';

const TablaRuido = memo(function TablaRuido({
  isLoading,
  error,
  data,
  pagination,
  paginaActual,
  elementosPorPagina,
  onPageChange,
  onRetry
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Mediciones de Ruido</CardTitle>
        <CardDescription>
          Niveles de presion acustica por periodo del dia
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <TableSkeleton rows={6} columns={6} />
        ) : error ? (
          <ErrorState
            message={error.message || 'Error al cargar datos de ruido'}
            onRetry={onRetry}
          />
        ) : data.length === 0 ? (
          <EmptyState
            title="Sin mediciones"
            description="No se encontraron mediciones con los filtros seleccionados."
            icon={Volume2}
          />
        ) : (
          <>
            <Table label="Mediciones de contaminacion acustica" rowCount={pagination?.totalDocuments}>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Estacion</TableHead>
                  <TableHead className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Sun className="size-4 text-muted-foreground" />
                      Diurno
                    </div>
                  </TableHead>
                  <TableHead className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Sunset className="size-4 text-muted-foreground" />
                      Vespertino
                    </div>
                  </TableHead>
                  <TableHead className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Moon className="size-4 text-muted-foreground" />
                      Nocturno
                    </div>
                  </TableHead>
                  <TableHead className="text-center">LAeq24</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((record) => (
                  <TableRow key={record._id}>
                    <TableCell className="font-medium">
                      {formatDate(record.fecha)}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{record.nombre || '-'}</p>
                        <p className="text-xs text-muted-foreground">NMT {record.nmt}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {/* Badge tiene `uppercase` por defecto, asi que `dB` se
                          transforma en `DB`. Envolvemos las unidades en
                          `normal-case` para preservar la mayuscula correcta
                          del decibelio. Mismo patron en IndicadorCumplimiento. */}
                      <Badge
                        variant={obtenerVarianteBadgeRuido(record.nivelDiurno)}
                        className="font-mono"
                      >
                        {record.nivelDiurno != null
                          ? <>{formatNumber(record.nivelDiurno, 1)}<span className="normal-case"> dB</span></>
                          : '-'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={obtenerVarianteBadgeRuido(record.nivelVespertino)}
                        className="font-mono"
                      >
                        {record.nivelVespertino != null
                          ? <>{formatNumber(record.nivelVespertino, 1)}<span className="normal-case"> dB</span></>
                          : '-'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={obtenerVarianteBadgeRuido(record.nivelNocturno)}
                        className="font-mono"
                      >
                        {record.nivelNocturno != null
                          ? <>{formatNumber(record.nivelNocturno, 1)}<span className="normal-case"> dB</span></>
                          : '-'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center font-mono text-foreground/80">
                      {record.laeq24 != null ? `${formatNumber(record.laeq24, 1)} dB` : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <Pagination
              currentPage={paginaActual}
              totalPages={pagination.totalPages || 1}
              totalItems={pagination.totalDocuments || 0}
              itemsPerPage={elementosPorPagina}
              onPageChange={onPageChange}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
});

export { TablaRuido };
