/**
 * Tarjetas KPI superiores del modulo Contenedores.
 * Subcomponente de PaginaContenedores.
 */

import { memo } from 'react';
import { Recycle, Gauge, Layers, Building2 } from 'lucide-react';
import { StatCard } from '../../../components/charts';
import { formatNumber } from '../../../utils';

const TarjetasEstadisticasContenedores = memo(function TarjetasEstadisticasContenedores({
  totalContenedores,
  totalUbicaciones, // eslint-disable-line no-unused-vars -- ya no se muestra (coincidia con totalContenedores)
  totalTipos,
  totalDistritos,
  isLoading
}) {
  // En el dataset cada contenedor es su propio punto de aportacion, asi que
  // "Total contenedores" y "Puntos de aportacion" mostraban la MISMA cifra (KPI
  // duplicado). Sustituimos por la densidad media por distrito, que si aporta.
  const mediaPorDistrito = totalDistritos > 0
    ? Math.round(totalContenedores / totalDistritos)
    : 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <StatCard
        title="Total contenedores"
        value={formatNumber(totalContenedores)}
        icon={Recycle}
        isLoading={isLoading}
      />
      <StatCard
        title="Media por distrito"
        value={formatNumber(mediaPorDistrito)}
        subtitle="contenedores por distrito"
        icon={Gauge}
        isLoading={isLoading}
      />
      <StatCard
        title="Tipos de residuo"
        value={formatNumber(totalTipos)}
        subtitle="categorías activas"
        icon={Layers}
        isLoading={isLoading}
      />
      <StatCard
        title="Distritos cubiertos"
        value={formatNumber(totalDistritos)}
        subtitle="con al menos un contenedor"
        icon={Building2}
        isLoading={isLoading}
      />
    </div>
  );
});

export { TarjetasEstadisticasContenedores };
