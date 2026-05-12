/**
 * Tarjetas KPI superiores del modulo Contenedores.
 * Subcomponente de PaginaContenedores.
 */

import { memo } from 'react';
import { Recycle, MapPin, Layers, Building2 } from 'lucide-react';
import { StatCard } from '../../../components/charts';
import { formatNumber } from '../../../utils';

const TarjetasEstadisticasContenedores = memo(function TarjetasEstadisticasContenedores({
  totalContenedores,
  totalUbicaciones,
  totalTipos,
  totalDistritos,
  isLoading
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <StatCard
        title="Total Contenedores"
        value={formatNumber(totalContenedores)}
        icon={Recycle}
        isLoading={isLoading}
      />
      <StatCard
        title="Puntos de aportacion"
        value={formatNumber(totalUbicaciones)}
        subtitle="ubicaciones registradas"
        icon={MapPin}
        isLoading={isLoading}
      />
      <StatCard
        title="Tipos de residuo"
        value={formatNumber(totalTipos)}
        subtitle="categorias activas"
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
