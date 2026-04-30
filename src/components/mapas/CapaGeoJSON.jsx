/**
 * CapaGeoJSON - Renderiza una FeatureCollection GeoJSON sobre un mapa
 * Leaflet. Soporta Point y LineString con popups configurables a partir
 * de las `properties` de cada Feature.
 */

import { GeoJSON } from 'react-leaflet';

/**
 * @typedef {Object} CapaGeoJSONProps
 * @property {Object} featureCollection - FeatureCollection GeoJSON RFC 7946
 * @property {(props:Object, feature:Object) => React.ReactNode} [renderPopup] - Contenido del popup
 * @property {Object} [style] - Estilo por defecto (o funcion (feature) => style)
 * @property {(feature:Object, layer:L.Layer) => void} [onEachFeature]
 * @property {(feature:Object, latlng:L.LatLng) => L.Layer} [pointToLayer]
 */

export function CapaGeoJSON({
  featureCollection,
  renderPopup,
  style,
  onEachFeature,
  pointToLayer
}) {
  if (!featureCollection || !featureCollection.features?.length) {
    return null;
  }

  const bindPopup = (feature, layer) => {
    if (onEachFeature) {onEachFeature(feature, layer);}
    if (renderPopup) {
      // Usamos HTML escapado basico; los componentes mas complejos
      // deberian usar <Popup> dentro de <Marker> directamente.
      const contenido = renderPopup(feature.properties || {}, feature);
      if (typeof contenido === 'string') {
        layer.bindPopup(contenido);
      } else if (contenido?.html) {
        layer.bindPopup(contenido.html);
      }
    }
  };

  return (
    <GeoJSON
      data={featureCollection}
      style={style}
      onEachFeature={bindPopup}
      pointToLayer={pointToLayer}
    />
  );
}
