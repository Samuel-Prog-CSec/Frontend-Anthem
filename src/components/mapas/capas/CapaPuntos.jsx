/**
 * CapaPuntos - Renderiza una FeatureCollection de Points como CircleMarkers
 * coloreados sobre un mapa Leaflet.
 *
 * Cada capa especifica del MapaUnificado (CapaAccidentes, CapaMultas, etc.)
 * delega aqui la logica de renderizado. La capa especifica solo se preocupa
 * de:
 *   - llamar a su hook useMapaX()
 *   - mapear los properties al popup
 *   - pasar el color y el limite de marcadores
 *
 * Renderiza solo Features con `geometry.type === 'Point'` y coordenadas
 * finitas. Se cap a `limiteMarcadores` para defenderse de respuestas que
 * excedan los caps del backend (defense in depth).
 */

import { memo } from 'react';
import { CircleMarker, Popup } from 'react-leaflet';

const CapaPuntos = memo(function CapaPuntos({
  featureCollection,
  color,
  radio = 6,
  pesoLinea = 1,
  opacidadRelleno = 0.75,
  renderPopup,
  limiteMarcadores = 1000
}) {
  const features = featureCollection?.features || [];
  if (!features.length) return null;

  const visibles = features.length > limiteMarcadores
    ? features.slice(0, limiteMarcadores)
    : features;

  return (
    <>
      {visibles.map((feature, idx) => {
        const geom = feature.geometry;
        if (!geom || geom.type !== 'Point') return null;
        const [lng, lat] = geom.coordinates || [];
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

        const props = feature.properties || {};
        return (
          <CircleMarker
            key={feature.id ?? `pt-${idx}`}
            center={[lat, lng]}
            radius={radio}
            pathOptions={{
              color: '#0f172a',
              weight: pesoLinea,
              fillColor: color,
              fillOpacity: opacidadRelleno
            }}
          >
            {renderPopup && (
              <Popup>
                {renderPopup(props, feature)}
              </Popup>
            )}
          </CircleMarker>
        );
      })}
    </>
  );
});

export { CapaPuntos };
