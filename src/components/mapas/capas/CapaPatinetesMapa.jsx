/**
 * CapaPatinetesMapa - asignacion de patinetes agregada por distrito.
 *
 * Cada feature es un centroide de distrito con `totalPatinetes`. Como solo
 * son ~21 puntos, dibujamos circulos mas grandes proporcionales al volumen.
 *
 * Drill-down cross-domain: el popup incluye un link al perfil completo del
 * distrito (`/distritos/:codigo`) si el nombre del distrito en el feature
 * matchea con el catalogo del censo. Resolvemos nombre→codigo via
 * `useCensoResumenDistritos` (cacheado por React Query), construyendo un Map
 * una sola vez al montar la capa para no llamar al hook por cada feature.
 */

import { memo, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useMapaPatinetes, useCensoResumenDistritos } from '../../../api/hooks';
import { formatNumber } from '../../../utils';
import { ROUTES, DATE_CONFIG } from '../../../constants';
import { COLORES_CAPA } from '../configCapas';
import { CapaPuntos } from './CapaPuntos';

function normalizarNombre(texto) {
  if (typeof texto !== 'string') return '';
  return texto.toUpperCase().trim().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

const CapaPatinetesMapa = memo(function CapaPatinetesMapa({ params }) {
  const { data: featureCollection } = useMapaPatinetes(params || {});

  // Map nombre normalizado → distrito {codigo, nombre, ...} para drill-down.
  // Si el catalogo aun no llego, los popups simplemente no muestran el link.
  const { data: resumen } = useCensoResumenDistritos({
    año: DATE_CONFIG.DATASET_YEAR
  });
  const distritoPorNombre = useMemo(() => {
    const lista = resumen?.data?.data || resumen?.data || [];
    const map = new Map();
    for (const d of lista) {
      map.set(normalizarNombre(d.nombre), d);
    }
    return map;
  }, [resumen]);

  const renderPopup = useCallback((props) => {
    const distritoCanon = props.distrito
      ? distritoPorNombre.get(normalizarNombre(props.distrito))
      : null;

    return (
      <div className="text-sm">
        <div className="font-semibold mb-1">{props.distrito || 'Distrito'}</div>
        {props.totalPatinetes != null && (
          <div>Total patinetes: {formatNumber(props.totalPatinetes)}</div>
        )}
        {props.topProveedores?.length > 0 && (
          <div className="mt-1">
            <div className="text-xs text-muted-foreground">Top proveedores:</div>
            {props.topProveedores.slice(0, 3).map((p, i) => (
              <div key={i} className="text-xs">{p.nombre}: {formatNumber(p.cantidad)}</div>
            ))}
          </div>
        )}
        {distritoCanon && (
          <Link
            to={ROUTES.DISTRITO_PATH(distritoCanon.codigo)}
            className="inline-flex items-center gap-1 mt-2 text-primary hover:opacity-80 underline text-xs font-medium"
            title={`Ver perfil cross-domain de ${distritoCanon.nombre}`}
          >
            Ver perfil del distrito
            <ArrowRight className="size-3" aria-hidden="true" />
          </Link>
        )}
      </div>
    );
  }, [distritoPorNombre]);

  return (
    <CapaPuntos
      featureCollection={featureCollection}
      color={COLORES_CAPA.patinetes}
      radio={9}
      pesoLinea={2}
      renderPopup={renderPopup}
    />
  );
});

export { CapaPatinetesMapa };
