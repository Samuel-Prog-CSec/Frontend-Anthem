/**
 * MapaCalor - Capa de heatmap sobre Leaflet usando leaflet.heat.
 * Util para densidad de accidentes, multas con GPS, etc.
 */

import { useEffect, useMemo, useRef } from 'react';
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
 * @property {number} [max] - Intensidad maxima para normalizar el gradiente
 */

function CapaCalor({ puntos, radius = 25, blur = 15, maxZoom = 17, max }) {
  const map = useMap();
  const layerRef = useRef(null);

  // Opciones del heatmap. Solo incluimos `max` cuando viene definido: sin el,
  // leaflet.heat asume max=1 y satura el gradiente con cualquier intensidad >1.
  const opciones = useMemo(() => {
    const opts = { radius, blur, maxZoom };
    if (Number.isFinite(max)) {opts.max = max;}
    return opts;
  }, [radius, blur, maxZoom, max]);

  useEffect(() => {
    // Si no hay puntos no creamos layer: si existia una previa la limpiamos
    // para no dejar densidad fantasma en el mapa.
    if (!puntos || puntos.length === 0) {
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
      return undefined;
    }

    // Reutilizamos la capa existente actualizando datos y opciones en vez de
    // recrearla en cada cambio (evita parpadeo y recomputo completo del grid).
    const aplicarCapa = () => {
      // leaflet.heat lanza "IndexSizeError: getImageData source width 0" si
      // intenta dibujar cuando el contenedor del mapa aun tiene tamaño 0 (carrera
      // de layout del primer render: el panel se monta antes de tener ancho).
      // Solo dibujamos cuando el mapa ya tiene dimensiones reales.
      const { x, y } = map.getSize();
      if (x === 0 || y === 0) { return false; }
      if (layerRef.current) {
        layerRef.current.setOptions(opciones);
        layerRef.current.setLatLngs(puntos);
      } else {
        layerRef.current = L.heatLayer(puntos, opciones).addTo(map);
      }
      return true;
    };

    if (aplicarCapa()) { return undefined; }

    // Aun sin tamaño: reintentar cuando el mapa se redimensione o termine de
    // cargar, y forzar el recalculo de tamaño tras el layout.
    const reintentar = () => { if (aplicarCapa()) { map.off('resize load', reintentar); } };
    map.on('resize load', reintentar);
    map.invalidateSize(false);
    return () => { map.off('resize load', reintentar); };
  }, [puntos, opciones, map]);

  // Cleanup al desmontar: retiramos la capa del mapa.
  useEffect(() => {
    return () => {
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
    };
  }, [map]);

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
 * @property {number} [max] - Intensidad maxima para normalizar el gradiente del heatmap
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
  max,
  onLimpiarFiltros,
  tituloVacio = 'Sin densidad para los filtros aplicados',
  descripcionVacio
}) {
  const features = featureCollection?.features || [];
  const autoBbox = bbox || featureCollection?.bbox || null;

  // El array de puntos se recalcula solo cuando cambian las features o la
  // funcion de intensidad. Sin memoizar, cada render generaba una nueva
  // referencia que forzaba a CapaCalor a recrear la capa de heatmap.
  const puntos = useMemo(() => {
    return features
      .map((f) => {
        const geom = f.geometry;
        if (!geom || geom.type !== 'Point') {return null;}
        const [lng, lat] = geom.coordinates;
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) {return null;}
        const intensidad = extraerIntensidad ? extraerIntensidad(f.properties || {}) : 1;
        return [lat, lng, intensidad];
      })
      .filter(Boolean);
  }, [features, extraerIntensidad]);

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
      <CapaCalor puntos={puntos} radius={radius} blur={blur} max={max} />
    </MapaInteractivo>
  );
}
