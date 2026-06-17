/**
 * CapaMultasMapa - multas georreferenciadas.
 *
 * Acepta `params.distrito` para limitarse a un distrito especifico (gracias
 * al filtro recien anadido en el endpoint /multas/mapa que deriva bbox del
 * centroide del distrito).
 */

import { memo, useCallback } from 'react';
import { useMapaMultas } from '../../../api/hooks';
import { formatNumber } from '../../../utils';
import { COLORES_CAPA } from '../configCapas';
import { CapaPuntos } from './CapaPuntos';

const PARAMS_DEFECTO = { limite: 1000 };

const CapaMultasMapa = memo(function CapaMultasMapa({ params }) {
  const { data: featureCollection } = useMapaMultas(params || PARAMS_DEFECTO);

  const renderPopup = useCallback((props) => (
    <div className="text-sm">
      <div className="font-semibold mb-1">{props.lugar || 'Multa'}</div>
      {props.calificacion && <div>Calificación: {props.calificacion}</div>}
      {props.importe != null && <div>Importe: {formatNumber(props.importe)} €</div>}
      {props.puntos != null && props.puntos > 0 && <div>Puntos: {props.puntos}</div>}
    </div>
  ), []);

  return (
    <CapaPuntos
      featureCollection={featureCollection}
      color={COLORES_CAPA.multas}
      radio={5}
      renderPopup={renderPopup}
    />
  );
});

export { CapaMultasMapa };
