/**
 * CapaAforoBicicletasMapa - estaciones de aforo de bicicletas.
 *
 * Cada estacion es un punto con coordenadas WGS84 directas (no UTM).
 * El popup muestra el volumen agregado disponible en properties.
 */

import { memo, useCallback } from 'react';
import { useMapaAforo } from '../../../api/hooks';
import { formatNumber } from '../../../utils';
import { COLORES_CAPA } from '../configCapas';
import { CapaPuntos } from './CapaPuntos';

const CapaAforoBicicletasMapa = memo(function CapaAforoBicicletasMapa({ params }) {
  const { data: featureCollection } = useMapaAforo(params || {});

  const renderPopup = useCallback((props) => (
    <div className="text-sm">
      <div className="font-semibold mb-1">{props.nombre || `Estacion ${props.identificador || ''}`}</div>
      {props.identificador && <div>ID: {props.identificador}</div>}
      {props.distrito && <div>Distrito: {props.distrito}</div>}
      {props.volumenTotal != null && (
        <div>Volumen total: {formatNumber(props.volumenTotal)}</div>
      )}
    </div>
  ), []);

  return (
    <CapaPuntos
      featureCollection={featureCollection}
      color={COLORES_CAPA.aforo}
      radio={6}
      renderPopup={renderPopup}
    />
  );
});

export { CapaAforoBicicletasMapa };
