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

import { useEffect } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import { cn } from '../../utils';

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
 * @property {React.ReactNode} children - Capas del mapa (marcadores, GeoJSON, etc.)
 */

/**
 * Wrapper base de mapa para el dashboard Smart City.
 * @param {MapaInteractivoProps} props
 */
export function MapaInteractivo({
  centro = CENTRO_MADRID,
  zoom = 11,
  bbox = null,
  className,
  altura = '500px',
  scrollWheelZoom = true,
  children
}) {
  return (
    <div
      className={cn(
        'relative w-full overflow-hidden rounded-lg border border-border/50 shadow-lg',
        className
      )}
      style={{ height: altura }}
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
    </div>
  );
}
