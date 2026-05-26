/**
 * MapaInteractivo - Wrapper base de Leaflet para el dashboard.
 *
 * Encapsula la configuracion comun (tiles, centro, zoom, altura) y
 * deja como children el contenido dinamico (marcadores, heatmap,
 * cluster, capa GeoJSON, etc.).
 *
 * Usa react-leaflet v5 con OpenStreetMap (sin token). Tiles carbon
 * neutral: https://www.openstreetmap.org/copyright
 */

import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import { cn } from '../../utils';

/**
 * Etiquetas accesibles para los controles nativos de Leaflet.
 * Los botones zoom-in/zoom-out se renderizan via Leaflet (no React) y NO
 * llevan `aria-label`. Lighthouse penaliza con `button-name` y JAWS/NVDA
 * los anuncian como "boton sin nombre". Reemplazamos por etiquetas en
 * espanol que reflejan la accion. La attribution y popups si los maneja
 * Leaflet correctamente, no requieren intervencion.
 */
function aplicarA11yLeaflet(mapRoot) {
  if (!mapRoot) return;
  // Zoom controls
  const zoomIn = mapRoot.querySelector('.leaflet-control-zoom-in');
  const zoomOut = mapRoot.querySelector('.leaflet-control-zoom-out');
  if (zoomIn) {
    zoomIn.setAttribute('aria-label', 'Acercar el mapa');
    zoomIn.setAttribute('title', 'Acercar el mapa');
  }
  if (zoomOut) {
    zoomOut.setAttribute('aria-label', 'Alejar el mapa');
    zoomOut.setAttribute('title', 'Alejar el mapa');
  }
  // Clusters generados por leaflet.markercluster: el div .marker-cluster
  // recibe role="button" pero sin aria-label. Le ponemos uno generico.
  mapRoot.querySelectorAll('.marker-cluster').forEach((cluster) => {
    if (!cluster.hasAttribute('aria-label')) {
      const count = cluster.querySelector('div span')?.textContent?.trim() || '';
      cluster.setAttribute('aria-label', count
        ? `Grupo de ${count} elementos. Pulsa para ampliar.`
        : 'Grupo de elementos del mapa. Pulsa para ampliar.');
    }
  });
}

// Fix del icono por defecto de Leaflet en bundlers (Vite/Webpack)
// Los iconos se rompen si no se resetea el path interno.
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl
});

// Centro aproximado de Madrid (Puerta del Sol)
const CENTRO_MADRID = [40.4168, -3.7038];

/**
 * Componente auxiliar que ajusta el bbox del mapa cuando cambia.
 * Uso interno: se renderiza como hijo de MapContainer.
 */
function AjustarBbox({ bbox }) {
  const map = useMap();
  useEffect(() => {
    if (bbox && bbox.length === 4) {
      const [minLng, minLat, maxLng, maxLat] = bbox;
      map.fitBounds([[minLat, minLng], [maxLat, maxLng]], { padding: [30, 30] });
    }
  }, [bbox, map]);
  return null;
}

/**
 * @typedef {Object} MapaInteractivoProps
 * @property {Array<number>} [centro] - [lat, lng] centro inicial
 * @property {number} [zoom] - Zoom inicial
 * @property {Array<number>} [bbox] - [minLng, minLat, maxLng, maxLat] para autofit
 * @property {string} [className] - Clases adicionales para el contenedor
 * @property {string} [altura] - Altura CSS (default: 500px)
 * @property {boolean} [scrollWheelZoom] - Habilitar zoom con rueda
 * @property {React.ReactNode} [overlay] - Contenido absoluto sobre el mapa (ej. MapaEmptyOverlay)
 * @property {React.ReactNode} children - Capas del mapa (marcadores, GeoJSON, etc.)
 */

/**
 * Wrapper base de mapa para el dashboard Smart City.
 *
 * Alineado con la direccion "Civic Operations Console": borde hairline,
 * radius pequeno, sin sombra. El overlay opcional se monta como hermano
 * del MapContainer para no interferir con las capas de Leaflet.
 *
 * @param {MapaInteractivoProps} props
 */
export function MapaInteractivo({
  centro = CENTRO_MADRID,
  zoom = 11,
  bbox = null,
  className,
  altura = '500px',
  scrollWheelZoom = true,
  overlay,
  children
}) {
  const contenedorRef = useRef(null);

  // Aplicar etiquetas a11y a los controles de Leaflet cuando se monta el
  // mapa y cada vez que cambian los hijos (los clusters pueden recrearse
  // al filtrar). MutationObserver es la forma fiable porque Leaflet
  // recrea los DOM nodes fuera del control de React.
  useEffect(() => {
    const root = contenedorRef.current;
    if (!root) return undefined;
    aplicarA11yLeaflet(root);
    const observer = new MutationObserver(() => aplicarA11yLeaflet(root));
    observer.observe(root, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={contenedorRef}
      className={cn(
        'relative w-full overflow-hidden rounded-sm border border-[var(--border-hairline)]',
        className
      )}
      style={{ height: altura }}
      role="region"
      aria-label="Mapa interactivo"
    >
      <MapContainer
        center={centro}
        zoom={zoom}
        scrollWheelZoom={scrollWheelZoom}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {bbox && <AjustarBbox bbox={bbox} />}
        {children}
      </MapContainer>
      {overlay}
    </div>
  );
}
