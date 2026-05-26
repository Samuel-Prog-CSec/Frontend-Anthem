/**
 * Sub-componente ComparativaSuscripciones
 *
 * Card con la comparativa entre suscripciones anuales y ocasionales:
 * dos StatCards + linea inferior con la distribucion porcentual.
 */

import { Users, UserCheck } from 'lucide-react';
import {
  Card, CardHeader, CardTitle, CardContent, CardDescription
} from '../../components/common';
import { StatCard } from '../../components/charts';
import { formatNumber } from '../../utils';

function ComparativaSuscripciones({ comparativa }) {
  if (!comparativa?.comparativa) return null;

  const anual = comparativa.comparativa.anual || {};
  const ocasional = comparativa.comparativa.ocasional || {};
  const distribucion = comparativa.distribucion;

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Users className="size-5" aria-hidden="true" />
          Comparativa de suscripciones
        </CardTitle>
        <CardDescription>Uso del servicio por tipo de suscripcion.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <StatCard
            title="Suscriptores anuales"
            value={formatNumber(anual.totalUsos || 0)}
            subtitle={`Promedio diario: ${formatNumber(anual.promedioDiario || 0, 1)}`}
            icon={UserCheck}
            accent="cyan"
          />
          <StatCard
            title="Usuarios ocasionales"
            value={formatNumber(ocasional.totalUsos || 0)}
            subtitle={`Promedio diario: ${formatNumber(ocasional.promedioDiario || 0, 1)}`}
            icon={Users}
            accent="emerald"
          />
        </div>

        {distribucion && (
          <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
            <span>
              Distribucion: Anual {formatNumber(distribucion.porcentajeAnual || 0, 1)}%
            </span>
            <span aria-hidden="true">|</span>
            <span>
              Ocasional {formatNumber(distribucion.porcentajeOcasional || 0, 1)}%
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default ComparativaSuscripciones;
