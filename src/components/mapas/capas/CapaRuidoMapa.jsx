/**
 * CapaRuidoMapa - estaciones de monitoreo de ruido.
 *
 * Cada estacion es un punto con NMT y niveles D/E/N + cumplimiento.
 */

import { memo, useCallback } from 'react';
import { useMapaRuido } from '../../../api/hooks';
import { formatNumber } from '../../../utils';
import { COLORES_CAPA } from '../configCapas';
import { CapaPuntos } from './CapaPuntos';

const CapaRuidoMapa = memo(function CapaRuidoMapa({ params }) {
  const { data: featureCollection } = useMapaRuido(params || {});

  const renderPopup = useCallback((props) => (
    <div className="text-sm">
      <div className="font-semibold mb-1">{props.nombre || `Estacion NMT ${props.nmt || ''}`}</div>
      {props.nmt && <div>NMT: {props.nmt}</div>}
      {props.nivelDiurno != null && (
        <div>Diurno: {formatNumber(props.nivelDiurno, 1)} dB</div>
      )}
      {props.nivelNocturno != null && (
        <div>Nocturno: {formatNumber(props.nivelNocturno, 1)} dB</div>
      )}
      {props.cumple != null && (
        <div>Cumplimiento: {props.cumple ? 'Si' : 'No'}</div>
      )}
    </div>
  ), []);

  return (
    <CapaPuntos
      featureCollection={featureCollection}
      color={COLORES_CAPA.ruido}
      radio={6}
      renderPopup={renderPopup}
    />
  );
});

export { CapaRuidoMapa };
