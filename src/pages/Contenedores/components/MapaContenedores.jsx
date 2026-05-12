/**
 * Mapa de contenedores con clusterizacion.
 * Subcomponente de PaginaContenedores.
 *
 * Consume el endpoint /contenedores/mapa (FeatureCollection) via
 * useMapaContenedores. Aplica filtros activos para evitar transferir
 * 49k puntos cuando el usuario solo quiere ver una zona.
 */

import { memo, useCallback } from 'react';
import { MapPin } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Skeleton } from '../../../components/common';
import { MapaClusterizado } from '../../../components/mapas';
import { formatNumber } from '../../../utils';
import { etiquetaTipoContenedor } from '../helpers';

const MapaContenedores = memo(function MapaContenedores({
  cargandoMapa,
  featureCollection,
  filtrosActivos
}) {
  const renderPopup = useCallback((props) => (
    <div className="text-sm">
      <div className="font-semibold mb-1">
        {etiquetaTipoContenedor(props.tipoContenedor)}
      </div>
      {props.direccion && (
        <div className="text-xs text-slate-300 mb-1">{props.direccion}</div>
      )}
      <div className="text-xs">
        <span className="text-slate-400">Distrito:</span> {props.distrito}
      </div>
      {props.barrio && props.barrio !== 'NO_ESPECIFICADO' && (
        <div className="text-xs">
          <span className="text-slate-400">Barrio:</span> {props.barrio}
        </div>
      )}
      <div className="text-xs">
        <span className="text-slate-400">Cantidad:</span> {formatNumber(props.cantidad)}
      </div>
      <div className="text-xs">
        <span className="text-slate-400">Lote:</span> {props.lote}
      </div>
    </div>
  ), []);

  const totalPuntos = featureCollection?.features?.length || 0;
  const hayFiltros = Boolean(
    filtrosActivos?.tipoContenedor || filtrosActivos?.distrito ||
    filtrosActivos?.barrio || filtrosActivos?.lote
  );

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <MapPin className="size-5" aria-hidden="true" />
          Mapa de contenedores
        </CardTitle>
        <CardDescription>
          {hayFiltros
            ? `Mostrando ${formatNumber(totalPuntos)} contenedores con los filtros activos.`
            : `${formatNumber(totalPuntos)} contenedores georreferenciados. Usa los filtros para acotar.`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {cargandoMapa ? (
          <Skeleton className="h-[480px] w-full rounded-xl" />
        ) : (
          <MapaClusterizado
            featureCollection={featureCollection}
            altura="480px"
            renderPopup={renderPopup}
          />
        )}
      </CardContent>
    </Card>
  );
});

export { MapaContenedores };
