/**
 * Analisis de densidad y cobertura por distrito.
 * Subcomponente de PaginaContenedores.
 *
 * El dataset tiene 1 contenedor por documento (cantidad === 1 para los
 * 37.954 docs), por lo que la metrica "contenedores por punto" del backend
 * siempre da 1,00 y no aporta. La sustituimos por "% del distrito": del
 * total de contenedores del distrito, cuanto cae en ese barrio. Asi la
 * fila muestra concentracion real de contenedores dentro del distrito.
 */

import { memo, useMemo } from 'react';
import { BarChart3 } from 'lucide-react';
import {
  Card, CardHeader, CardTitle, CardDescription, CardContent,
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell, TableCaption,
  Badge, EmptyState, TableSkeleton
} from '../../../components/common';
import { formatNumber, formatearNombreDistrito } from '../../../utils';
import { etiquetaTipoContenedor, varianteBadgePorTipo } from '../helpers';

const AnalisisDensidadContenedores = memo(function AnalisisDensidadContenedores({
  datos,
  isLoading,
  distritoFiltro,
  tipoFiltro
}) {
  const filas = useMemo(() => {
    if (!Array.isArray(datos)) {return [];}
    // Total por distrito (sumando todos los barrios) para calcular el
    // % de cada fila respecto a su distrito.
    const totalPorDistrito = datos.reduce((acc, fila) => {
      if (!fila.distrito) return acc;
      acc[fila.distrito] = (acc[fila.distrito] || 0) + (fila.totalContenedores || 0);
      return acc;
    }, {});
    return [...datos]
      .map(fila => {
        const totalDistrito = totalPorDistrito[fila.distrito] || 0;
        const pct = totalDistrito > 0
          ? (fila.totalContenedores / totalDistrito) * 100
          : null;
        return { ...fila, porcentajeDistrito: pct };
      })
      .sort((a, b) => (b.totalContenedores || 0) - (a.totalContenedores || 0))
      .slice(0, 25);
  }, [datos]);

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <BarChart3 className="size-5" aria-hidden="true" />
          Análisis de densidad
        </CardTitle>
        <CardDescription>
          Densidad de contenedores por distrito y barrio
          {distritoFiltro && ` · Distrito: ${distritoFiltro}`}
          {tipoFiltro && ` · Tipo: ${etiquetaTipoContenedor(tipoFiltro)}`}.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <TableSkeleton rows={6} columns={5} aria-label="Cargando análisis" />
        ) : filas.length === 0 ? (
          <EmptyState
            title="Sin resultados para estos filtros"
            description="No hay datos de densidad para los filtros seleccionados."
            icon={BarChart3}
          />
        ) : (
          <Table label="Análisis de densidad" rowCount={filas.length}>
            <TableCaption className="sr-only">
              Tabla con densidad de contenedores por zona
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Distrito</TableHead>
                <TableHead>Barrio</TableHead>
                <TableHead className="text-right">Contenedores</TableHead>
                <TableHead className="text-right">% del distrito</TableHead>
                <TableHead>Tipos presentes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filas.map((fila, idx) => {
                const distribucion = fila.distribucionTipos || {};
                const tipos = Object.keys(distribucion);
                return (
                  <TableRow key={`${fila.distrito}-${fila.barrio || idx}`}>
                    <TableCell className="font-medium text-info">
                      {formatearNombreDistrito(fila.distrito)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {fila.barrio && fila.barrio !== 'NO_ESPECIFICADO' ? fila.barrio : '-'}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatNumber(fila.totalContenedores)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-foreground">
                      {fila.porcentajeDistrito != null
                        ? `${formatNumber(fila.porcentajeDistrito, 1)} %`
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
