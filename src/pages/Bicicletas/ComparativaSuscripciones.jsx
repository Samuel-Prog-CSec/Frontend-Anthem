/**
 * Sub-componente ComparativaSuscripciones
 *
 * Card con la comparativa entre suscripciones anuales y ocasionales:
 * dos StatCards + linea inferior con la distribucion porcentual.
 *
 * El backend devuelve `data.comparacion` con campos planos:
 *   { totalUsosAnual, totalUsosOcasional,
 *     promedioUsosAnual, promedioUsosOcasional,
 *     porcentajeAnual, porcentajeOcasional, periodo }
 * Antes el componente buscaba sub-objetos `anual.totalUsos` y
 * `ocasional.totalUsos` que no existen, por eso siempre mostraba 0.
 */

import { Users, UserCheck } from 'lucide-react';
import {
  Card, CardHeader, CardTitle, CardContent, CardDescription
} from '../../components/common';
import { StatCard } from '../../components/charts';
import { formatNumber } from '../../utils';

function ComparativaSuscripciones({ comparativa }) {
  // Tolerar shape historico anidado (`comparativa.anual.totalUsos`) y el
  // plano actual del backend (`comparacion.totalUsosAnual`).
  const comp = comparativa?.comparacion || comparativa?.comparativa || null;
  if (!comp) return null;

  const totalAnual = comp.totalUsosAnual ?? comp.anual?.totalUsos ?? 0;
  const totalOcasional = comp.totalUsosOcasional ?? comp.ocasional?.totalUsos ?? 0;
  const promedioAnual = comp.promedioUsosAnual ?? comp.anual?.promedioDiario ?? 0;
  const promedioOcasional = comp.promedioUsosOcasional ?? comp.ocasional?.promedioDiario ?? 0;
  const porcentajeAnual = comp.porcentajeAnual ?? comparativa?.distribucion?.porcentajeAnual ?? 0;
  const porcentajeOcasional = comp.porcentajeOcasional ?? comparativa?.distribucion?.porcentajeOcasional ?? 0;

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Users className="size-5" aria-hidden="true" />
          Comparativa de suscripciones
        </CardTitle>
        <CardDescription>Uso del servicio por tipo de suscripción.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/*
            Las metricas son SUMAS DE USOS, no cuentas de personas unicas.
            Llamar "Suscriptores" a 3.4 M para una flota de ~2.5K bicis es
            enganyoso: una sola persona contribuye N veces al "usosAbonadoAnual".
          */}
          <StatCard
            title="Usos de abonados (anual)"
            value={formatNumber(totalAnual)}
            subtitle={`Promedio diario: ${formatNumber(promedioAnual, 1)}`}
            icon={UserCheck}
            accent="dominio"
          />
          <StatCard
            title="Usos ocasionales"
            value={formatNumber(totalOcasional)}
            subtitle={`Promedio diario: ${formatNumber(promedioOcasional, 1)}`}
            icon={Users}
            accent="dominio"
          />
        </div>

        {(porcentajeAnual > 0 || porcentajeOcasional > 0) && (
          <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
            <span>
              Distribución: Anual {formatNumber(porcentajeAnual, 1)}%
            </span>
            <span aria-hidden="true">|</span>
            <span>
              Ocasional {formatNumber(porcentajeOcasional, 1)}%
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default ComparativaSuscripciones;
