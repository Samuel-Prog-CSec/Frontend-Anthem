/**
 * Mapa de trafico con CircleMarkers coloreados por nivel de congestion.
 * Subcomponente de PaginaTrafico.
 *
 * No usa MapaClusterizado porque necesitamos color por feature (no agrupar).
 * En lugar de eso, usa MapaInteractivo + CircleMarker directos.
 */

import { memo, useMemo } from 'react';
import { CircleMarker, Popup } from 'react-leaflet';
import { MapPin } from 'lucide-react';
import { MapaInteractivo } from '../../../components/mapas';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Skeleton, EmptyState } from '../../../components/common';
import { formatNumber } from '../../../utils';
import { CONGESTION_LEVEL_COLORS } from '../../../constants';
import { colorPorPorcentajeCongestion, etiquetaTipoElemento, nivelDesdePorcentaje, etiquetaCongestion } from '../helpers';

const MapaTrafico = memo(function MapaTrafico({
  cargando,
  featureCollection,
  rangoFechas
}) {
  const features = useMemo(
    () => featureCollection?.features || [],
    [featureCollection?.features]
  );

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <MapPin className="size-5" aria-hidden="true" />
          Mapa de congestión por punto
        </CardTitle>
        <CardDescription>
          {features.length > 0
            ? `${formatNumber(features.length)} puntos de medida activos del ${rangoFechas?.startDate} al ${rangoFechas?.endDate}. Color por % de mediciones congestionadas.`
            : 'Selecciona un rango y aplica filtros para ver los puntos de medida.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {cargando ? (
          <Skeleton className="h-[500px] w-full rounded-xl" />
        ) : features.length === 0 ? (
          <EmptyState
            title="Sin resultados para estos filtros"
            description="No se encontraron puntos de medida con los filtros aplicados. Prueba a ampliar el rango o cambiar el tipo de vía."
            icon={MapPin}
          />
        ) : (
          <MapaInteractivo
            altura="500px"
            bbox={featureCollection?.bbox}
          >
            {features.map((feature, idx) => {
              const geom = feature.geometry;
              if (!geom || geom.type !== 'Point') {return null;}
              const [lng, lat] = geom.coordinates || [];
              if (!Number.isFinite(lat) || !Number.isFinite(lng)) {return null;}

              const props = feature.properties || {};
              const color = colorPorPorcentajeCongestion(props.porcentajeCongestion);
              const nivel = nivelDesdePorcentaje(props.porcentajeCongestion);

              return (
                <CircleMarker
                  key={feature.id ?? `pt-${idx}`}
                  center={[lat, lng]}
                  radius={6}
                  pathOptions={{
                    color: '#0f172a',
                    weight: 1,
                    fillColor: color,
                    fillOpacity: 0.85
                  }}
                >
                  <Popup>
                    <div className="text-sm">
                      <div className="font-semibold mb-1">
                        Punto {props.puntoMedidaId}
                      </div>
                      {props.nombre && (
                        <div className="text-xs text-foreground/80 mb-1">{props.nombre}</div>
                      )}
                      <div className="text-xs">
                        <span className="text-muted-foreground">Tipo:</span> {etiquetaTipoElemento(props.tipoElemento)}
                      </div>
                      {props.distrito && (
                        <div className="text-xs">
                          <span className="text-muted-foreground">Distrito:</span> {props.distrito}
                        </div>
                      )}
                      <div className="text-xs">
                        <span className="text-muted-foreground">Intensidad media:</span> {formatNumber(props.intensidadMedia, 0)} v/h
                      </div>
                      {props.velocidadMedia != null && (
                        <div className="text-xs">
                          <span className="text-muted-foreground">Velocidad media:</span> {formatNumber(props.velocidadMedia, 1)} km/h
                        </div>
                      )}
                      <div className="text-xs">
                        <span className="text-muted-foreground">Ocupación media:</span> {formatNumber(props.ocupacionMedia, 1)}%
                      </div>
                      <div className="text-xs">
                        <span className="text-muted-foreground">Congestión:</span> {formatNumber(props.porcentajeCongestion, 1)}% ({etiquetaCongestion(nivel)})
                      </div>
                      <div className="text-xs">
                        <span className="text-muted-foreground">Mediciones:</span> {formatNumber(props.totalMediciones)}
                      </div>
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}
          </MapaInteractivo>
        )}

        {features.length > 0 && (
          <LeyendaCongestion />
        )}
      </CardContent>
    </Card>
  );
});

function LeyendaCongestion() {
  const items = [
    { nivel: 'Fluido (<20%)', color: CONGESTION_LEVEL_COLORS.FLUIDO },
    { nivel: 'Denso (20-50%)', color: CONGESTION_LEVEL_COLORS.DENSO },
    { nivel: 'Congestionado (50-80%)', color: CONGESTION_LEVEL_COLORS.CONGESTIONADO },
    { nivel: 'Colapsado (>=80%)', color: CONGESTION_LEVEL_COLORS.COLAPSADO }
  ];
  return (
    <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
      <span className="font-medium">Leyenda:</span>
      {items.map(item => (
        <span key={item.nivel} className="flex items-center gap-1.5">
          <span
            className="size-3 rounded-full border border-border"
            style={{ backgroundColor: item.color }}
            aria-hidden="true"
          />
          {item.nivel}
        </span>
      ))}
    </div>
  );
}

export { MapaTrafico };
