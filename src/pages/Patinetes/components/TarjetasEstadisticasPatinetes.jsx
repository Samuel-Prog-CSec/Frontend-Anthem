/**
 * Tarjetas de estadisticas resumen de asignacion de patinetes.
 * Subcomponente de PaginaPatinetes.
 */

import { memo } from 'react';
import { Zap, MapPin, BarChart3, Users } from 'lucide-react';
import { StatCard } from '../../../components/charts';
import { formatNumber } from '../../../utils';

const TarjetasEstadisticasPatinetes = memo(function TarjetasEstadisticasPatinetes({ estadisticas }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <StatCard
        title="Total Patinetes"
        value={formatNumber(estadisticas.totalPatinetes)}
        icon={Zap}
      />
      <StatCard
        title="Areas Registradas"
        value={estadisticas.totalAreas}
        icon={MapPin}
      />
      <StatCard
        title="Promedio por Barrio"
        value={formatNumber(Math.round(estadisticas.promedioPorBarrio))}
        icon={BarChart3}
      />
      {/*
        Antes el titulo era "Proveedores Activos" pero el valor que viene
        del backend es el PROMEDIO de proveedores por area (no el total de
        proveedores activos en la flota, que son 14). Renombramos para
        que el label coincida con el numero mostrado y no confunda.
      */}
      <StatCard
        title="Proveedores promedio/area"
        value={Math.round(estadisticas.proveedoresActivos)}
        subtitle="sobre 14 operadores"
        icon={Users}
      />
    </div>
  );
});

export { TarjetasEstadisticasPatinetes };
