/**
 * Tabla de top 10 zonas con mayor concentracion de accidentes.
 * Subcomponente de PaginaAccidentes.
 */

import { memo } from 'react';
import { MapPin } from 'lucide-react';
import {
  Card, CardHeader, CardTitle, CardDescription, CardContent,
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell, Badge
} from '../../../components/common';
import { formatNumber } from '../../../utils';

function obtenerVarianteSegunTotal(total) {
  if (total >= 10) return 'destructive';
  if (total >= 5) return 'warning';
  return 'secondary';
}

const TablaZonasAccidentalidad = memo(function TablaZonasAccidentalidad({ zonas }) {
  if (!zonas || zonas.length === 0) return null;

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <MapPin className="size-5" />
          Calles con más accidentes
        </CardTitle>
        <CardDescription>
          Top 10 calles por número de accidentes registrados (expedientes únicos)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Calle / Distrito</TableHead>
              <TableHead className="text-center">Accidentes</TableHead>
              <TableHead className="text-center">Graves</TableHead>
              <TableHead className="text-center">Gravedad media</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {zonas.map((zona, idx) => (
              <TableRow key={zona._id?.calle ? `${zona._id.calle}-${zona._id?.distrito || ''}` : `zona-${idx}`}>
                <TableCell>
                  <p className="font-medium text-sm">{zona._id?.calle || '-'}</p>
                  <p className="text-xs text-muted-foreground">{zona._id?.distrito || ''}</p>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant={obtenerVarianteSegunTotal(zona.totalAccidentes)}>
                    {formatNumber(zona.totalAccidentes)}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">{formatNumber(zona.accidentesGraves || 0)}</TableCell>
                <TableCell className="text-center font-mono text-sm">{zona.puntuacionGravedadPromedio ? formatNumber(zona.puntuacionGravedadPromedio, 1) : '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
});

export { TablaZonasAccidentalidad };
