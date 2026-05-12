/**
 * CapaAccidentesMapa - accidentes georreferenciados.
 *
 * Limite de 1000 features (cap MAP_LIMITS.DEFAULT_MAX del backend).
 */

import { memo, useCallback } from 'react';
import { useMapaAccidentes } from '../../../api/hooks';
import { formatDate } from '../../../utils';
import { COLORES_CAPA } from '../configCapas';
import { CapaPuntos } from './CapaPuntos';

const PARAMS_DEFECTO = { limite: 1000 };

const CapaAccidentesMapa = memo(function CapaAccidentesMapa({ params }) {
  const { data: featureCollection } = useMapaAccidentes(params || PARAMS_DEFECTO);

  const renderPopup = useCallback((props) => (
    <div className="text-sm">
      <div className="font-semibold mb-1">Accidente {props.numeroExpediente || ''}</div>
      {props.fecha && <div>Fecha: {formatDate(props.fecha)}</div>}
      {props.gravedad && <div>Gravedad: {props.gravedad}</div>}
      {props.tipoAccidente && <div>Tipo: {props.tipoAccidente}</div>}
      {props.distrito && <div>Distrito: {props.distrito}</div>}
    </div>
  ), []);

  return (
    <CapaPuntos
      featureCollection={featureCollection}
      color={COLORES_CAPA.accidentes}
      radio={5}
      renderPopup={renderPopup}
    />
  );
});

export { CapaAccidentesMapa };
