/**
 * MapaCalor - Capa de heatmap sobre Leaflet usando leaflet.heat.
 * Util para densidad de accidentes, multas con GPS, etc.
 */

import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';
import { MapaInteractivo } from './MapaInteractivo';
import { MapaEmptyOverlay } from './MapaEmptyOverlay';

/**
 * @typedef {Object} CapaCalorProps
 * @property {Array<[number,number,number?]>} puntos - Array de [lat, lng, intensidad?]
 * @property {number} [radius]
 * @property {number} [blur]
 * @property {number} [maxZoom]
 */

function CapaCalor({ puntos, radius = 25, blur = 15, maxZoom = 17 }) {
  const map = useMap();
  useEffect(() => {
    // Si no hay puntos no creamos layer y devolvemos undefined: la layer
    // de la iteracion anterior (si existia) ya fue limpiada por React al
    // ejecutar su cleanup antes de re-correr el effect, asi que el mapa
    // queda en el estado correcto sin trabajo extra aqui.
    if (!puntos || puntos.length === 0) {return undefined;}
    const layer = L.heatLayer(puntos, { radius, blur, maxZoom });
    layer.addTo(map);
    return () => {
      map.removeLayer(layer);
    };
  }, [puntos, radius, blur, maxZoom, map]);
  return null;
}

/**
 * @typedef {Object} MapaCalorProps
 * @property {Object} featureCollection - FeatureCollection GeoJSON de Points
 * @property {(props:Object) => number} [extraerIntensidad] - Funcion para calcular intensidad por feature
 * @property {Array<number>} [centro]
 * @property {number} [zoom]
 * @property {Array<number>} [bbox]
 * @property {string} [altura]
 * @property {number} [radius]
 * @property {number} [blur]
 */

export function MapaCalor({
  featureCollection,
  extraerIntensidad,
  centro,
  zoom,
  bbox,
  altura,
  radius = 25,
  blur = 15,
  onLimpiarFiltros,
  tituloVacio = 'Sin densidad para los filtros aplicados',
  descripcionVacio
}) {
  const features = featureCollection?.features || [];
  const autoBbox = bbox || featureCollection?.bbox || null;

  const puntos = features
    .map((f) => {
      const geom = f.geometry;
      if (!geom || geom.type !== 'Point') {return null;}
      const [lng, lat] = geom.coordinates;
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {return null;}
      const intensidad = extraerIntensidad ? extraerIntensidad(f.properties || {}) : 1;
      return [lat, lng, intensidad];
    })
    .filter(Boolean);

  // featureCollection presente pero sin puntos validos: mostramos overlay.
  // Si featureCollection es undefined/null (todavia cargando), no overlay.
  const sinDatos = featureCollection && puntos.length === 0;
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
      <CapaCalor puntos={puntos} radius={radius} blur={blur} />
    </MapaInteractivo>
  );
}
