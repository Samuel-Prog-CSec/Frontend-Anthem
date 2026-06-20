/**
 * MapaClusterizado - Mapa Leaflet con agrupacion de marcadores cercanos
 * usando react-leaflet-cluster. Utilizado para datasets grandes como
 * Ubicaciones (miles de puntos) y Patinetes.
 */

import L from 'leaflet';
import { Marker, Popup, useMapEvents } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { MapaInteractivo } from './MapaInteractivo';
import { MapaEmptyOverlay } from './MapaEmptyOverlay';

/**
 * Reporta el bbox del viewport (al terminar pan/zoom) para carga por area.
 * Se renderiza dentro del MapContainer (tiene contexto de mapa). Solo se monta
 * cuando el consumidor pasa onBoundsChange, asi el comportamiento por defecto
 * (cargar todo) no cambia para el resto de mapas.
 * @param {{ onCambio: (bbox:number[]) => void }} props
 */
function ReporteroViewport({ onCambio }) {
  const map = useMapEvents({
    moveend: () => {
      const b = map.getBounds();
      // Formato bbox del backend: [minLng, minLat, maxLng, maxLat]
      onCambio([b.getWest(), b.getSouth(), b.getEast(), b.getNorth()]);
    }
  });
  return null;
}

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
 * Icono de cluster tematizado "Atlas Civico". Sin este iconCreateFunction los
 * recuentos de cluster aparecian como numeros sueltos (react-leaflet-cluster no
 * trae su CSS por defecto). El circulo hereda el color de la pagina via
 * `--dominio` (cascada CSS), asi que los clusters de cada dominio toman su
 * acento (movilidad oro, ambiente teal, seguridad rojo...). El tamano escala
 * con el numero de puntos agrupados para dar sensacion de densidad.
 * @param {import('leaflet').MarkerCluster} cluster
 */
// Marcador por defecto (cuando no se colorea por categoria): punto del color
// del dominio de la pagina, para que los marcadores sueltos sean coherentes con
// los clusters (antes era el pin azul generico de Leaflet, que desentonaba con
// los clusters tematizados). Es un unico divIcon; el color sale de --dominio via
// CSS (.punto-dominio), asi que cada pagina lo tine sin recrear el icono.
export const iconoDominioDefault = L.divIcon({
  className: 'punto-dominio',
  html: '<span></span>',
  iconSize: [16, 16],
  iconAnchor: [8, 8]
});

export function crearIconoCluster(cluster) {
  const total = cluster.getChildCount();
  const escala = total < 10 ? 'sm' : total < 100 ? 'md' : total < 1000 ? 'lg' : 'xl';
  const lado = { sm: 32, md: 38, lg: 44, xl: 52 }[escala];
  const etiqueta = total >= 1000 ? `${(total / 1000).toFixed(total < 10000 ? 1 : 0)}k` : `${total}`;
  return L.divIcon({
    html: `<span>${etiqueta}</span>`,
    className: `cluster-atlas cluster-atlas--${escala}`,
    iconSize: L.point(lado, lado),
    iconAnchor: [lado / 2, lado / 2]
  });
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
  colorPorFeature,
  onBoundsChange
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
      {onBoundsChange && <ReporteroViewport onCambio={onBoundsChange} />}
      <MarkerClusterGroup chunkedLoading iconCreateFunction={crearIconoCluster} showCoverageOnHover={false} maxClusterRadius={50}>
        {features.map((feature, idx) => {
          const geom = feature.geometry;
          if (!geom || geom.type !== 'Point') {return null;}
          const [lng, lat] = geom.coordinates;
          if (!Number.isFinite(lat) || !Number.isFinite(lng)) {return null;}
          const props = feature.properties || {};
          const icono = colorPorFeature ? iconoPorColor(colorPorFeature(props)) : null;
          // Solo pasamos `icon` cuando hay uno coloreado. Pasar icon={undefined}
          // a react-leaflet v5 deja el Marker sin icono y Leaflet revienta al
          // llamar a icon.createIcon() (crash de Patinetes). Sin la prop, usa el
          // icono por defecto configurado en MapaInteractivo.
          const propsIcono = { icon: icono || iconoDominioDefault };
          return (
            <Marker key={feature.id ?? `feature-${idx}`} position={[lat, lng]} {...propsIcono}>
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
