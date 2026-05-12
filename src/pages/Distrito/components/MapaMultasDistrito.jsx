/**
 * Mini-mapa con multas dentro del bbox aproximado del distrito.
 *
 * Aprovecha el filtro `?distrito=` recien anadido al endpoint `/multas/mapa`
 * que internamente convierte el codigo a un bbox cuadrado de 4 km. Las
 * limitaciones del bbox aproximado se documentan en `bboxDeDistrito` (backend):
 *   - Distritos vecinos pueden contribuir falsos positivos
 *   - Distritos muy grandes (Fuencarral-El Pardo) pueden quedar truncados
 *
 * Subcomponente de PaginaDistrito.
 */

import { memo, useCallback } from 'react';
import { Receipt, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Skeleton } from '../../../components/common';
import { MapaClusterizado } from '../../../components/mapas';
import { useMapaMultas } from '../../../api/hooks';
import { formatNumber } from '../../../utils';

const LIMITE_MULTAS_DISTRITO = 500;

const MapaMultasDistrito = memo(function MapaMultasDistrito({
  codigo,
  nombreDistrito,
  centroide
}) {
  // Pasar el codigo como string ya que el endpoint acepta tanto codigo numerico
  // como nombre de distrito.
  const { data: featureCollection, isLoading, error } = useMapaMultas({
    distrito: String(codigo),
    limite: LIMITE_MULTAS_DISTRITO
  });

  const renderPopup = useCallback((props) => (
    <div className="text-sm">
      <div className="font-semibold mb-1">{props.lugar || 'Multa'}</div>
      <div>Calificacion: {props.calificacion || '-'}</div>
      {props.importe != null && (
        <div>Importe: {formatNumber(props.importe)} €</div>
      )}
      {props.puntos != null && props.puntos > 0 && (
        <div>Puntos: {props.puntos}</div>
      )}
    </div>
  ), []);

  const totalMultas = featureCollection?.features?.length || 0;
  // El centroide del backend viene como [lng, lat]; Leaflet espera [lat, lng]
  const centroLeaflet = centroide ? [centroide[1], centroide[0]] : undefined;

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Receipt className="size-5" />
          Multas en {nombreDistrito}
        </CardTitle>
        <CardDescription>
          Aproximacion por bbox cuadrado de 4 km alrededor del centroide del
          distrito. Multas no tiene campo distrito normalizado en el dataset, asi
          que la aproximacion puede incluir falsos positivos en zonas limitrofes
          o quedar incompleta en distritos muy extensos.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-[420px] w-full rounded-xl" />
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-8 gap-2 text-muted-foreground">
            <AlertCircle className="size-8" />
            <p className="text-sm">No se pudieron cargar las multas del mapa.</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-3" aria-live="polite">
              Mostrando <strong className="text-foreground">{formatNumber(totalMultas)}</strong> multas
              {totalMultas === LIMITE_MULTAS_DISTRITO && ' (limite alcanzado, hay mas multas en la zona)'}.
            </p>
            <MapaClusterizado
              featureCollection={featureCollection}
              centro={centroLeaflet}
              zoom={13}
              altura="420px"
              renderPopup={renderPopup}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
});

export { MapaMultasDistrito };
