/**
 * Mapa de calor de concentracion geografica de accidentes.
 * Subcomponente de PaginaAccidentes.
 */

import { memo } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Skeleton } from '../../../components/common';
import { MapaCalor } from '../../../components/mapas';

// La rejilla de /mapa-calor ya trae el peso agregado por celda (weight = nº de
// afectados en esa celda). El heatmap pondera por ese conteo, que es la
// concentracion real de accidentes.
function extraerIntensidad(props) {
  return props.weight || 1;
}

const MapaCalorAccidentes = memo(function MapaCalorAccidentes({
  cargandoMapa,
  featureCollectionMapa
}) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <AlertTriangle className="size-5" />
          Mapa de calor de accidentes
        </CardTitle>
        <CardDescription>
          Concentración geográfica sobre toda la serie filtrada (rejilla agregada
          ~110 m). El color pondera por número de afectados por celda.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {cargandoMapa ? (
          <Skeleton className="h-[520px] w-full rounded-xl" />
        ) : (
          <MapaCalor
            featureCollection={featureCollectionMapa}
            altura="520px"
            radius={20}
            blur={18}
            extraerIntensidad={extraerIntensidad}
          />
        )}
      </CardContent>
    </Card>
  );
});

export { MapaCalorAccidentes };
