/**
 * Analisis de densidad y cobertura por distrito.
 * Subcomponente de PaginaContenedores.
 *
 * Muestra una tabla con el desglose de densidad (contenedores por punto)
 * y distribucion por tipo. Permite filtrar por distrito y tipo activos.
 */

import { memo, useMemo } from 'react';
import { BarChart3 } from 'lucide-react';
import {
  Card, CardHeader, CardTitle, CardDescription, CardContent,
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell, TableCaption,
  Badge, EmptyState, TableSkeleton
} from '../../../components/common';
import { formatNumber } from '../../../utils';
import { etiquetaTipoContenedor, varianteBadgePorTipo } from '../helpers';

const AnalisisDensidadContenedores = memo(function AnalisisDensidadContenedores({
  datos,
  isLoading,
  distritoFiltro,
  tipoFiltro
}) {
  const filas = useMemo(() => {
    if (!Array.isArray(datos)) {return [];}
    return [...datos]
      .sort((a, b) => (b.totalContenedores || 0) - (a.totalContenedores || 0))
      .slice(0, 25);
  }, [datos]);

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <BarChart3 className="size-5" aria-hidden="true" />
          Analisis de densidad
        </CardTitle>
        <CardDescription>
          Densidad de contenedores por distrito y barrio
          {distritoFiltro && ` · Distrito: ${distritoFiltro}`}
          {tipoFiltro && ` · Tipo: ${etiquetaTipoContenedor(tipoFiltro)}`}.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <TableSkeleton rows={6} columns={5} />
        ) : filas.length === 0 ? (
          <EmptyState
            title="Sin datos de densidad"
            description="No hay datos para los filtros seleccionados."
            icon={BarChart3}
          />
        ) : (
          <Table label="Analisis de densidad" rowCount={filas.length}>
            <TableCaption className="sr-only">
              Tabla con densidad de contenedores por zona
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Distrito</TableHead>
                <TableHead>Barrio</TableHead>
                <TableHead className="text-right">Contenedores</TableHead>
                <TableHead className="text-right">Ubicaciones</TableHead>
                <TableHead className="text-right">Densidad</TableHead>
                <TableHead>Tipos presentes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filas.map((fila, idx) => {
                const distribucion = fila.distribucionTipos || {};
                const tipos = Object.keys(distribucion);
                return (
                  <TableRow key={`${fila.distrito}-${fila.barrio || idx}`}>
                    <TableCell className="font-medium text-cyan-400">
                      {fila.distrito}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {fila.barrio && fila.barrio !== 'NO_ESPECIFICADO' ? fila.barrio : '-'}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatNumber(fila.totalContenedores)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatNumber(fila.totalPuntos)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-foreground">
                      {fila.densidad?.contenedoresPorPunto != null
                        ? formatNumber(fila.densidad.contenedoresPorPunto, 2)
                        : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {tipos.length === 0
                          ? <span className="text-xs text-muted-foreground">-</span>
                          : tipos.map(tipo => (
                            <Badge
                              key={tipo}
                              variant={varianteBadgePorTipo(tipo)}
                              title={`${formatNumber(distribucion[tipo].cantidad)} contenedores`}
                            >
                              {etiquetaTipoContenedor(tipo)}
                            </Badge>
                          ))}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
});

export { AnalisisDensidadContenedores };
