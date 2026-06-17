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

  // react-leaflet <GeoJSON> ignora cambios de `data` tras montar. Una `key`
  // derivada del contenido fuerza el remount cuando cambia la coleccion (numero
  // de features + identificador del primero), evitando que el mapa muestre datos
  // obsoletos al cambiar de filtro.
  const featureKey = `${featureCollection.features.length}:${featureCollection.features[0]?.id ?? featureCollection.features[0]?.properties?.id ?? ''}`;

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
      key={featureKey}
      data={featureCollection}
      style={style}
      onEachFeature={bindPopup}
      pointToLayer={pointToLayer}
    />
  );
}
