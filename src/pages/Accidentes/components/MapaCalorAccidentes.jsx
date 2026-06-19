/**
 * Mapa de calor de concentracion geografica de accidentes.
 * Subcomponente de PaginaAccidentes.
 */

import { memo, useMemo } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Skeleton } from '../../../components/common';
import { MapaCalor } from '../../../components/mapas';

// La rejilla de /mapa-calor ya trae el peso agregado por celda (weight = nº de
// afectados en esa celda). El heatmap pondera por ese conteo, que es la
// concentracion real de accidentes.
function extraerIntensidad(props) {
  return props.weight || 1;
}

/**
 * Calcula el techo de intensidad (`max`) del heatmap a partir de los pesos por
 * celda. Usamos el percentil 95 en vez del maximo absoluto para que un par de
 * celdas extremas no aplasten todo el gradiente; asi la densidad real se
 * distingue. Si no hay datos devolvemos undefined para que MapaCalor omita
 * la opcion (leaflet.heat usaria max=1 por defecto).
 */
function calcularMax(featureCollection) {
  const features = featureCollection?.features || [];
  const pesos = features
    .map((f) => f.properties?.weight)
    .filter((w) => Number.isFinite(w) && w > 0)
    .sort((a, b) => a - b);
  if (pesos.length === 0) {return undefined;}
  const indice = Math.floor(pesos.length * 0.95);
  return pesos[Math.min(indice, pesos.length - 1)];
}

const MapaCalorAccidentes = memo(function MapaCalorAccidentes({
  cargandoMapa,
  featureCollectionMapa
}) {
  const maxIntensidad = useMemo(
    () => calcularMax(featureCollectionMapa),
    [featureCollectionMapa]
  );

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
            max={maxIntensidad}
            extraerIntensidad={extraerIntensidad}
          />
        )}
      </CardContent>
    </Card>
  );
});

export { MapaCalorAccidentes };
