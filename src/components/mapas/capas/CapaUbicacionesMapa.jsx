/**
 * CapaUbicacionesMapa - capa para el mapa unificado.
 *
 * Renderiza estaciones acusticas, puntos de trafico y waypoints de rutas de
 * transporte. Como Ubicaciones tiene ~20.000 puntos, se CLUSTERIZAN todos
 * (sin tope) en lugar de pintar solo los primeros 1000 con CapaPuntos: asi no
 * se pierden puntos por el camino y el rendimiento se mantiene gracias a
 * react-leaflet-cluster (chunkedLoading). El popup y el icono tematizado se
 * reutilizan del patron de MapaClusterizado.
 *
 * Solo se monta cuando el usuario activa la capa en el panel lateral, asi que
 * el hook se ejecuta lazy.
 */

import { memo, useCallback } from 'react';
import { Marker, Popup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { useMapaUbicaciones } from '../../../api/hooks';
import { LOCATION_TYPE_LABELS } from '../../../constants';
import { crearIconoCluster, iconoDominioDefault } from '../MapaClusterizado';

const CapaUbicacionesMapa = memo(function CapaUbicacionesMapa({ params }) {
  const { data: featureCollection } = useMapaUbicaciones(params || {});
  const features = featureCollection?.features || [];

  const renderPopup = useCallback((props) => (
    <div className="text-sm">
      <div className="font-semibold mb-1">{props.nombre || props.nmt || 'Ubicación'}</div>
      <div>Tipo: {LOCATION_TYPE_LABELS[props.tipo] || props.tipo || '-'}</div>
      {props.nmt && <div>NMT: {props.nmt}</div>}
      {props.distrito && <div>Distrito: {props.distrito}</div>}
    </div>
  ), []);

  if (!features.length) return null;

  return (
    <MarkerClusterGroup
      chunkedLoading
      iconCreateFunction={crearIconoCluster}
      showCoverageOnHover={false}
      maxClusterRadius={50}
    >
      {features.map((feature, idx) => {
        const geom = feature.geometry;
        if (!geom || geom.type !== 'Point') return null;
        const [lng, lat] = geom.coordinates || [];
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
        return (
          <Marker key={feature.id ?? `ubi-${idx}`} position={[lat, lng]} icon={iconoDominioDefault}>
            <Popup>{renderPopup(feature.properties || {}, feature)}</Popup>
          </Marker>
        );
      })}
    </MarkerClusterGroup>
  );
});

export { CapaUbicacionesMapa };
