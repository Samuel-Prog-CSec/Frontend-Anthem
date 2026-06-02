/**
 * Mapa de contenedores con clusterizacion.
 * Subcomponente de PaginaContenedores.
 *
 * Consume el endpoint /contenedores/mapa (FeatureCollection) via
 * useMapaContenedores. Aplica filtros activos para evitar transferir
 * 49k puntos cuando el usuario solo quiere ver una zona.
 */

import { memo, useCallback, useMemo } from 'react';
import { MapPin } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Skeleton } from '../../../components/common';
import { MapaClusterizado } from '../../../components/mapas';
import { formatNumber } from '../../../utils';
import { etiquetaTipoContenedor, colorTipoContenedor } from '../helpers';

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
        <div className="text-xs text-foreground/80 mb-1">{props.direccion}</div>
      )}
      <div className="text-xs">
        <span className="text-muted-foreground">Distrito:</span> {props.distrito}
      </div>
      {props.barrio && props.barrio !== 'NO_ESPECIFICADO' && (
        <div className="text-xs">
          <span className="text-muted-foreground">Barrio:</span> {props.barrio}
        </div>
      )}
      <div className="text-xs">
        <span className="text-muted-foreground">Cantidad:</span> {formatNumber(props.cantidad)}
      </div>
      <div className="text-xs">
        <span className="text-muted-foreground">Lote:</span> {props.lote}
      </div>
    </div>
  ), []);

  const totalPuntos = featureCollection?.features?.length || 0;
  const hayFiltros = Boolean(
    filtrosActivos?.tipoContenedor || filtrosActivos?.distrito ||
    filtrosActivos?.barrio || filtrosActivos?.lote
  );

  // Colorear cada marcador por tipo de residuo (estandar municipal) y construir
  // la leyenda con los tipos realmente presentes en el mapa.
  const colorearPorTipo = useCallback(
    (props) => colorTipoContenedor(props.tipoContenedor),
    []
  );
  const tiposPresentes = useMemo(() => {
    const tipos = new Set(
      (featureCollection?.features || [])
        .map(f => f.properties?.tipoContenedor)
        .filter(Boolean)
    );
    return [...tipos];
  }, [featureCollection]);

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
          <>
            <MapaClusterizado
              featureCollection={featureCollection}
              altura="480px"
              renderPopup={renderPopup}
              colorPorFeature={colorearPorTipo}
            />
            {tiposPresentes.length > 0 && (
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3">
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Tipo de residuo:</span>
                {tiposPresentes.map((tipo) => (
                  <span key={tipo} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span
                      className="inline-block size-2.5 rounded-full"
                      style={{ backgroundColor: colorTipoContenedor(tipo) }}
                      aria-hidden="true"
                    />
                    {etiquetaTipoContenedor(tipo)}
                  </span>
                ))}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
});

export { MapaContenedores };
