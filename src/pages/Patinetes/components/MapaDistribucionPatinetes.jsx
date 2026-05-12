/**
 * Mapa clusterizado con distribucion de patinetes por distrito.
 * Subcomponente de PaginaPatinetes.
 */

import { memo, useCallback } from 'react';
import { MapPin } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Skeleton } from '../../../components/common';
import { MapaClusterizado } from '../../../components/mapas';
import { formatNumber } from '../../../utils';

const MapaDistribucionPatinetes = memo(function MapaDistribucionPatinetes({
  cargandoMapa,
  featureCollectionMapa
}) {
  const renderPopup = useCallback((props) => (
    <div className="text-sm">
      <div className="font-semibold mb-1">{props.distrito}</div>
      <div>Total patinetes: {formatNumber(props.totalPatinetes)}</div>
      {props.topProveedores?.length > 0 && (
        <div className="mt-1">
          <div className="text-xs text-slate-500">Top proveedores:</div>
          {props.topProveedores.slice(0, 3).map((p, i) => (
            <div key={i} className="text-xs">
              {p.nombre}: {formatNumber(p.cantidad)}
            </div>
          ))}
        </div>
      )}
    </div>
  ), []);

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <MapPin className="size-5" />
          Distribucion por Distrito
        </CardTitle>
        <CardDescription>
          Total de patinetes agregado por distrito; cada punto se posiciona
          en el centroide del distrito correspondiente.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {cargandoMapa ? (
          <Skeleton className="h-[400px] w-full rounded-xl" />
        ) : (
          <MapaClusterizado
            featureCollection={featureCollectionMapa}
            altura="420px"
            renderPopup={renderPopup}
          />
        )}
      </CardContent>
    </Card>
  );
});

export { MapaDistribucionPatinetes };
