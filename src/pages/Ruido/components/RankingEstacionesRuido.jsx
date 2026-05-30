/**
 * Ranking de estaciones por nivel de ruido.
 * Subcomponente de PaginaRuido.
 */

import { memo } from 'react';
import { Award } from 'lucide-react';
import {
  Card, CardHeader, CardTitle, CardDescription, CardContent,
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
  Badge, EmptyState, ChartSkeleton
} from '../../../components/common';
import { formatNumber } from '../../../utils';
import { obtenerVarianteBadgeRuido } from '../helpers';

const RankingEstacionesRuido = memo(function RankingEstacionesRuido({ datos, cargando }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="size-5" />
          Ranking de Estaciones
        </CardTitle>
        <CardDescription>
          Estaciones ordenadas por nivel de ruido
        </CardDescription>
      </CardHeader>
      <CardContent>
        {cargando ? (
          <ChartSkeleton height={320} />
        ) : datos.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Estacion</TableHead>
                <TableHead className="text-center">LAeq24</TableHead>
                <TableHead className="text-center">Diurno</TableHead>
                <TableHead className="text-center">Nocturno</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {datos.map((estacion, index) => (
                <TableRow key={`ranking-${estacion.nmt}-${index}`}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-sm">{estacion.nombre}</p>
                      <p className="text-xs text-foreground0">NMT {estacion.nmt}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {/* Badge tiene uppercase: envolvemos las unidades en
                        normal-case para que "dB" no se transforme en "DB". */}
                    <Badge variant={obtenerVarianteBadgeRuido(estacion.laeq24)} className="font-mono">
                      {formatNumber(estacion.laeq24, 1)}<span className="normal-case"> dB</span>
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center font-mono text-sm text-foreground/80">
                    {formatNumber(estacion.diurno, 1)} dB
                  </TableCell>
                  <TableCell className="text-center font-mono text-sm text-foreground/80">
                    {formatNumber(estacion.nocturno, 1)} dB
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <EmptyState
            title="Sin datos de ranking"
            description="No se pudo obtener el ranking de estaciones."
            icon={Award}
          />
        )}
      </CardContent>
    </Card>
  );
});

export { RankingEstacionesRuido };
