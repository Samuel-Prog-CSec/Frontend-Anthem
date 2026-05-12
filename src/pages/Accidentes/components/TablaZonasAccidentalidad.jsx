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
          Zonas de Mayor Accidentalidad
        </CardTitle>
        <CardDescription>
          Top 10 zonas con mayor concentracion de accidentes (agrupadas por coordenadas)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Zona (coordenadas)</TableHead>
              <TableHead>Total Accidentes</TableHead>
              <TableHead>Graves</TableHead>
              <TableHead>Gravedad Media</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {zonas.map((zona, idx) => (
              <TableRow key={idx}>
                <TableCell className="font-mono text-sm">
                  ({formatNumber(zona.coordenadas?.x, 0)}, {formatNumber(zona.coordenadas?.y, 0)})
                </TableCell>
                <TableCell>
                  <Badge variant={obtenerVarianteSegunTotal(zona.totalAccidentes)}>
                    {zona.totalAccidentes}
                  </Badge>
                </TableCell>
                <TableCell>{zona.accidentesGraves || 0}</TableCell>
                <TableCell>{zona.puntuacionGravedadPromedio ? zona.puntuacionGravedadPromedio.toFixed(1) : '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
});

export { TablaZonasAccidentalidad };
