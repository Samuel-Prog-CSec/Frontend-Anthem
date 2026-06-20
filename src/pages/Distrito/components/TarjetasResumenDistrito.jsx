/**
 * Tarjetas de resumen cross-domain del distrito.
 * 4 StatCards: Poblacion, Accidentes, Patinetes asignados, Multas en zona.
 *
 * Subcomponente de PaginaDistrito.
 */

import { memo } from 'react';
import { Users, AlertTriangle, Zap, Receipt } from 'lucide-react';
import { StatCard } from '../../../components/charts';
import { formatNumber } from '../../../utils';

const TarjetasResumenDistrito = memo(function TarjetasResumenDistrito({
  totalPoblacion,
  totalAccidentes,
  totalPatinetes,
  totalMultasEnZona,
  cargandoAccidentes,
  cargandoPatinetes,
  cargandoMultas
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <StatCard
        title="Población total"
        value={formatNumber(totalPoblacion || 0)}
        icon={Users}
      />
      <StatCard
        title="Accidentes registrados"
        value={cargandoAccidentes ? '…' : formatNumber(totalAccidentes || 0)}
        subtitle="datos completos"
        icon={AlertTriangle}
      />
      <StatCard
        title="Patinetes asignados"
        value={cargandoPatinetes ? '…' : formatNumber(totalPatinetes || 0)}
        subtitle="suma por barrio"
        icon={Zap}
      />
      <StatCard
        title="Multas geolocalizadas"
        value={cargandoMultas ? '…' : formatNumber(totalMultasEnZona || 0)}
        subtitle="solo con coordenadas (~2%)"
        icon={Receipt}
      />
    </div>
  );
});

export { TarjetasResumenDistrito };
