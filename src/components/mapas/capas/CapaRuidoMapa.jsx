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

  const renderPopup = useCallback((props) => {
    // El endpoint /ruido/mapa emite promedioDiurno/promedioNocturno/promedioLaeq24
    // y banderas excede* (no nivelDiurno/cumple). Cumple = no excede ninguno.
    const tieneExcedencia = props.excedeDiurno != null || props.excedeVespertino != null || props.excedeNocturno != null;
    const cumple = !props.excedeDiurno && !props.excedeVespertino && !props.excedeNocturno;
    return (
      <div className="text-sm">
        <div className="font-semibold mb-1">{props.nombre || `Estación NMT ${props.nmt || ''}`}</div>
        {props.nmt && <div>NMT: {props.nmt}</div>}
        {props.promedioDiurno != null && (
          <div>Diurno: {formatNumber(props.promedioDiurno, 1)} dB</div>
        )}
        {props.promedioNocturno != null && (
          <div>Nocturno: {formatNumber(props.promedioNocturno, 1)} dB</div>
        )}
        {props.promedioLaeq24 != null && (
          <div>LAeq24: {formatNumber(props.promedioLaeq24, 1)} dB</div>
        )}
        {tieneExcedencia && (
          <div>Cumplimiento: {cumple ? 'Sí' : 'No'}</div>
        )}
      </div>
    );
  }, []);

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
