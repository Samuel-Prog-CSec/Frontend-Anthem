/**
 * Mapa de calor de concentracion geografica de accidentes.
 * Subcomponente de PaginaAccidentes.
 */

import { memo } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Skeleton } from '../../../components/common';
import { MapaCalor } from '../../../components/mapas';

// Mapeo de gravedad a intensidad para el heatmap (mortal = mas peso)
const GRAVEDAD_A_INTENSIDAD = { MORTAL: 10, GRAVE: 6, LEVE: 2, SIN_LESIONES: 1 };

function extraerIntensidad(props) {
  return GRAVEDAD_A_INTENSIDAD[props.gravedad] || 3;
}

const MapaCalorAccidentes = memo(function MapaCalorAccidentes({
  cargandoMapa,
  featureCollectionMapa,
  // Sincronizado con MAP_LIMITS.DEFAULT_MAX del backend.
  limite = 1000
}) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <AlertTriangle className="size-5" />
          Mapa de Calor de Accidentes
        </CardTitle>
        <CardDescription>
          Concentracion geografica de accidentes segun los filtros aplicados.
          Maximo {limite} registros.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {cargandoMapa ? (
          <Skeleton className="h-[400px] w-full rounded-xl" />
        ) : (
          <MapaCalor
            featureCollection={featureCollectionMapa}
            altura="480px"
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
