/**
 * Tabla de zonas con mayor concentracion de patinetes.
 * Subcomponente de PaginaPatinetes.
 */

import { memo } from 'react';
import { Layers } from 'lucide-react';
import {
  Card, CardHeader, CardTitle, CardDescription, CardContent,
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell, Badge
} from '../../../components/common';
import { formatNumber } from '../../../utils';
import { obtenerVarianteBadgeDensidad } from '../helpers';

const ZonasConcentracionPatinetes = memo(function ZonasConcentracionPatinetes({ zonas }) {
  if (!zonas || zonas.length === 0) return null;

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Layers className="size-5" />
          Zonas de Mayor Concentracion
        </CardTitle>
        <CardDescription>
          Areas con la mayor densidad de patinetes asignados
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Distrito</TableHead>
              <TableHead>Barrio</TableHead>
              <TableHead className="text-right">Total Patinetes</TableHead>
              <TableHead className="text-center">Densidad</TableHead>
              <TableHead className="text-center">Proveedores</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {zonas.slice(0, 10).map((zona, index) => (
              <TableRow key={`zona-${index}`}>
                <TableCell className="font-medium">
                  {zona.distrito || zona._id?.distrito || '-'}
                </TableCell>
                <TableCell>
                  {zona.barrio || zona._id?.barrio || '-'}
                </TableCell>
                <TableCell className="text-right font-mono">
                  {formatNumber(zona.totalPatinetes)}
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant={obtenerVarianteBadgeDensidad(zona.densidad || zona.densidadPatinetes)}>
                    {zona.densidad || zona.densidadPatinetes || '-'}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  {zona.proveedoresActivos || zona.totalProveedores || '-'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
});

export { ZonasConcentracionPatinetes };
