/**
 * MapaClusterizado - Mapa Leaflet con agrupacion de marcadores cercanos
 * usando react-leaflet-cluster. Utilizado para datasets grandes como
 * Ubicaciones (miles de puntos) y Patinetes.
 */

import { Marker, Popup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { MapaInteractivo } from './MapaInteractivo';
import { MapaEmptyOverlay } from './MapaEmptyOverlay';

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
  descripcionVacio
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
          return (
            <Marker key={feature.id ?? idx} position={[lat, lng]}>
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
