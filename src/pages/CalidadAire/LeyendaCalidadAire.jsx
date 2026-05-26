/**
 * Sub-componente LeyendaCalidadAire
 *
 * Card al pie de pagina con la leyenda visual de los 6 niveles del
 * Indice de Calidad del Aire (AQI). Los colores provienen de los
 * tokens shadcn/Tailwind via AIR_QUALITY_LEVELS.
 */

import { Card, CardHeader, CardTitle, CardContent } from '../../components/common';
import { AIR_QUALITY_LEVELS } from '../../constants';

function LeyendaCalidadAire() {
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-lg">Niveles de calidad del aire</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-x-5 gap-y-3">
          {Object.entries(AIR_QUALITY_LEVELS).map(([key, level]) => (
            <div key={key} className="flex items-center gap-2">
              <span
                className="size-3 rounded-full ring-1 ring-border"
                style={{ backgroundColor: level.color }}
                aria-hidden="true"
              />
              <span className="text-sm text-foreground/85">{level.label}</span>
              <span className="font-mono text-xs text-muted-foreground">({level.range})</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default LeyendaCalidadAire;
