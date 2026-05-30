/**
 * Tarjetas de estadisticas resumen de mediciones de ruido.
 * Subcomponente de PaginaRuido.
 */

import { memo } from 'react';
import { Volume2, Sun, Sunset, Moon, AlertTriangle } from 'lucide-react';
import { StatCard } from '../../../components/charts';
import { formatDecibels } from '../../../utils';

const TarjetasEstadisticasRuido = memo(function TarjetasEstadisticasRuido({ estadisticas }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <StatCard
        title="Promedio LAeq24"
        value={formatDecibels(estadisticas.promedioLaeq)}
        icon={Volume2}
      />
      <StatCard
        title="Promedio Diurno"
        value={formatDecibels(estadisticas.promedioDiurno)}
        subtitle="07:00 - 19:00"
        icon={Sun}
      />
      <StatCard
        title="Promedio Vespertino"
        value={formatDecibels(estadisticas.promedioVespertino)}
        subtitle="19:00 - 23:00"
        icon={Sunset}
      />
      <StatCard
        title="Promedio Nocturno"
        value={formatDecibels(estadisticas.promedioNocturno)}
        subtitle="23:00 - 07:00"
        icon={Moon}
      />
      {/*
        El valor `cantidadExceden` que devuelve el backend cuenta
        ESTACIONES con al menos una excedencia anual, no mediciones
        individuales. Antes el subtitulo decia "mediciones" lo que daba
        a entender que 18 mediciones excedian (cuando son 174 sobre 359).
        Renombramos para reflejar la unidad real.
      */}
      <StatCard
        title="Estaciones con excedencia"
        value={estadisticas.cantidadExceden}
        subtitle="al menos una vez en 2051"
        icon={AlertTriangle}
      />
    </div>
  );
});

export { TarjetasEstadisticasRuido };
