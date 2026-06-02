/**
 * MapaClusterizado - Mapa Leaflet con agrupacion de marcadores cercanos
 * usando react-leaflet-cluster. Utilizado para datasets grandes como
 * Ubicaciones (miles de puntos) y Patinetes.
 */

import L from 'leaflet';
import { Marker, Popup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { MapaInteractivo } from './MapaInteractivo';
import { MapaEmptyOverlay } from './MapaEmptyOverlay';

// Cache de iconos coloreados (divIcon) por color, para no recrearlos en cada
// render. Permite codificar una categoria por color (p.ej. tipo de contenedor)
// manteniendo el clustering de marcadores.
const cacheIconosColor = {};
function iconoPorColor(color) {
  if (!cacheIconosColor[color]) {
    cacheIconosColor[color] = L.divIcon({
      className: 'marcador-coloreado',
      html: `<span style="display:block;width:14px;height:14px;border-radius:50%;background:${color};border:2px solid rgba(11,13,16,0.9);box-shadow:0 0 0 1px ${color}"></span>`,
      iconSize: [14, 14],
      iconAnchor: [7, 7]
    });
  }
  return cacheIconosColor[color];
}

/**
 * @typedef {Object} MapaClusterizadoProps
 * @property {Object} featureCollection - FeatureCollection GeoJSON (solo Point)
 * @property {(props:Object) => React.ReactNode} renderPopup - Contenido del popup
 * @property {Array<number>} [centro]
 * @property {number} [zoom]
 * @property {Array<number>} [bbox]
 * @property {string} [altura]
 * @property {() => void} [onLimpiarFiltros] - Callback opcional para el overlay vacio
 * @property {string} [tituloVacio] - Mensaje cuando no hay features
 * @property {string} [descripcionVacio] - Texto auxiliar del overlay
 * @property {(props:Object) => string} [colorPorFeature] - Si se aporta, colorea
 *   cada marcador segun una categoria (devuelve un color CSS). Si no, usa el
 *   marcador por defecto de Leaflet (comportamiento previo, sin cambios).
 */

export function MapaClusterizado({
  featureCollection,
  renderPopup,
  centro,
  zoom,
  bbox,
  altura,
  onLimpiarFiltros,
  tituloVacio,
  descripcionVacio,
  colorPorFeature
}) {
  const features = featureCollection?.features || [];
  const autoBbox = bbox || featureCollection?.bbox || null;
  const sinDatos = featureCollection && features.length === 0;

  const overlay = sinDatos ? (
    <MapaEmptyOverlay
      titulo={tituloVacio}
      descripcion={descripcionVacio}
      onLimpiar={onLimpiarFiltros}
    />
  ) : null;

  return (
    <MapaInteractivo
      centro={centro}
      zoom={zoom}
      bbox={autoBbox}
      altura={altura}
      overlay={overlay}
    >
      <MarkerClusterGroup chunkedLoading>
        {features.map((feature, idx) => {
          const geom = feature.geometry;
          if (!geom || geom.type !== 'Point') {return null;}
          const [lng, lat] = geom.coordinates;
          if (!Number.isFinite(lat) || !Number.isFinite(lng)) {return null;}
          const props = feature.properties || {};
          const icono = colorPorFeature ? iconoPorColor(colorPorFeature(props)) : undefined;
          return (
            <Marker key={feature.id ?? idx} position={[lat, lng]} icon={icono}>
              {renderPopup && (
                <Popup>
                  {renderPopup(props, feature)}
                </Popup>
              )}
            </Marker>
          );
        })}
      </MarkerClusterGroup>
    </MapaInteractivo>
  );
}
