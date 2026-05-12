/**
 * CapaUbicacionesMapa - capa para el mapa unificado.
 *
 * Renderiza estaciones acusticas, puntos de trafico y rutas de transporte
 * como puntos coloreados. Solo se monta cuando el usuario activa la capa
 * en el panel lateral, asi que el hook se ejecuta lazy.
 */

import { memo, useCallback } from 'react';
import { useMapaUbicaciones } from '../../../api/hooks';
import { LOCATION_TYPE_LABELS } from '../../../constants';
import { COLORES_CAPA } from '../configCapas';
import { CapaPuntos } from './CapaPuntos';

const CapaUbicacionesMapa = memo(function CapaUbicacionesMapa({ params }) {
  const { data: featureCollection } = useMapaUbicaciones(params || {});

  const renderPopup = useCallback((props) => (
    <div className="text-sm">
      <div className="font-semibold mb-1">{props.nombre || props.nmt || 'Ubicacion'}</div>
      <div>Tipo: {LOCATION_TYPE_LABELS[props.tipo] || props.tipo || '-'}</div>
      {props.nmt && <div>NMT: {props.nmt}</div>}
      {props.distrito && <div>Distrito: {props.distrito}</div>}
    </div>
  ), []);

  return (
    <CapaPuntos
      featureCollection={featureCollection}
      color={COLORES_CAPA.ubicaciones}
      radio={5}
      renderPopup={renderPopup}
    />
  );
});

export { CapaUbicacionesMapa };
