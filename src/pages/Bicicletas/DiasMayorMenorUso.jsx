/**
 * Sub-componente DiasMayorMenorUso
 *
 * Dos tablas paralelas con el top de dias de mayor y menor uso del
 * servicio de bicicletas.
 */

import { ArrowUp, ArrowDown } from 'lucide-react';
import {
  Card, CardHeader, CardTitle, CardContent,
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell
} from '../../components/common';
import { formatDate, formatNumber } from '../../utils';

function DiasMayorMenorUso({ datos }) {
  if (!datos) return null;

  const hayMayor = datos.diasMayorUso?.length > 0;
  const hayMenor = datos.diasMenorUso?.length > 0;
  if (!hayMayor && !hayMenor) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      {hayMayor && (
        <TopDiasCard
          titulo="Top dias de mayor uso"
          icono={ArrowUp}
          iconoColor="text-emerald-400"
          dias={datos.diasMayorUso}
          prefijoKey="mayor"
        />
      )}
      {hayMenor && (
        <TopDiasCard
          titulo="Top dias de menor uso"
          icono={ArrowDown}
          iconoColor="text-rose-400"
          dias={datos.diasMenorUso}
          prefijoKey="menor"
        />
      )}
    </div>
  );
}

function TopDiasCard({ titulo, icono, iconoColor, dias, prefijoKey }) {
  const Icono = icono;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Icono className={`size-5 ${iconoColor}`} aria-hidden="true" />
          {titulo}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Dia</TableHead>
              <TableHead className="text-right">Total usos</TableHead>
              <TableHead className="text-right">Usos anual</TableHead>
              <TableHead className="text-right">Usos ocasional</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dias.map((item, index) => (
              <TableRow key={`${prefijoKey}-${index}`}>
                <TableCell>{formatDate(item.dia)}</TableCell>
                <TableCell className="text-right font-mono font-medium">{formatNumber(item.totalUsos)}</TableCell>
                <TableCell className="text-right font-mono">
                  {formatNumber(item.usosAnual || item.usosAbonadoAnual)}
                </TableCell>
                <TableCell className="text-right font-mono">
                  {formatNumber(item.usosOcasional || item.usosAbonadoOcasional)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export default DiasMayorMenorUso;
