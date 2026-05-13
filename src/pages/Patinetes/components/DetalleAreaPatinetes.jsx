/**
 * Detalle expandible de un area (distrito + barrio) seleccionada.
 * Subcomponente de PaginaPatinetes.
 */

import { memo } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, X, ArrowRight } from 'lucide-react';
import {
  Card, CardHeader, CardTitle, CardDescription, CardContent,
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
  Badge, Button, CardSkeleton
} from '../../../components/common';
import { useDistritoPorNombre } from '../../../api/hooks';
import { ROUTES } from '../../../constants';
import { formatNumber } from '../../../utils';
import { obtenerVarianteBadgeDensidad, obtenerVarianteBadgeDemanda } from '../helpers';

const DetalleAreaPatinetes = memo(function DetalleAreaPatinetes({
  area,
  cargando,
  onCerrar
}) {
  // Drill-down al perfil cross-domain del distrito. Resolvemos
  // nombre→codigo via hook helper (cacheado por React Query). Si el nombre
  // no matchea con el catalogo del censo, no mostramos el boton.
  const { distrito: distritoCanon } = useDistritoPorNombre(area?.distrito?.nombre);

  if (cargando) {
    return (
      <Card className="mt-6">
        <CardContent className="py-6">
          <CardSkeleton lines={5} />
        </CardContent>
      </Card>
    );
  }

  if (!area) return null;

  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MapPin className="size-5" />
            {area.distrito?.nombre || '-'} - {area.barrio?.nombre || '-'}
          </CardTitle>
          <div className="flex items-center gap-2">
            {distritoCanon && (
              <Button asChild variant="outline" size="sm">
                <Link to={ROUTES.DISTRITO_PATH(distritoCanon.codigo)}>
                  Ver perfil del distrito
                  <ArrowRight className="size-4 ml-2" />
                </Link>
              </Button>
            )}
            <Button variant="ghost" onClick={onCerrar}>
              <X className="size-4" />
            </Button>
          </div>
        </div>
        <CardDescription>
          Detalle de asignacion de patinetes en el area seleccionada.
          {distritoCanon && ' Pulsa "Ver perfil del distrito" para acceder a la vista cross-domain (censo + accidentes + multas).'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Estadisticas del area */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div>
            <p className="text-sm text-muted-foreground">Total Patinetes</p>
            <p className="text-xl font-bold">{formatNumber(area.estadisticas?.totalPatinetes)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Proveedores Activos</p>
            <p className="text-xl font-bold">
              {area.estadisticas?.proveedoresActivos || 0}/{area.estadisticas?.totalProveedores || 0}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Densidad</p>
            <Badge variant={obtenerVarianteBadgeDensidad(area.estadisticas?.densidadPatinetes)}>
              {area.estadisticas?.densidadPatinetes || '-'}
            </Badge>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Tipo de Zona</p>
            <p className="font-medium">
              {area.clasificacionArea?.tipoZona?.replace(/_/g, ' ') || '-'}
            </p>
          </div>
        </div>

        {/* Clasificacion del area */}
        {area.clasificacionArea && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            <div>
              <p className="text-sm text-muted-foreground">Demanda Estimada</p>
              <Badge variant={obtenerVarianteBadgeDemanda(area.clasificacionArea.demandaEstimada)}>
                {area.clasificacionArea.demandaEstimada || '-'}
              </Badge>
            </div>
            {area.analisisDistribucion?.proveedorDominante && (
              <div>
                <p className="text-sm text-muted-foreground">Proveedor Dominante</p>
                <p className="font-medium">{area.analisisDistribucion.proveedorDominante.nombre || '-'}</p>
              </div>
            )}
            {area.analisisDistribucion?.indiceHerfindahl != null && (
              <div>
                <p className="text-sm text-muted-foreground">Indice Herfindahl (HHI)</p>
                <p className="font-mono font-medium">{formatNumber(area.analisisDistribucion.indiceHerfindahl)}</p>
              </div>
            )}
          </div>
        )}

        {/* Proveedores en el area */}
        {area.proveedores?.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-foreground/80 mb-3">
              Proveedores en el Area ({area.proveedores.length})
            </h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Proveedor</TableHead>
                  <TableHead className="text-right">Patinetes</TableHead>
                  <TableHead className="text-right">Cuota</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {area.proveedores.map((prov, idx) => (
                  <TableRow key={`prov-${idx}`}>
                    <TableCell className="font-medium">{prov.nombre || prov.proveedor || '-'}</TableCell>
                    <TableCell className="text-right font-mono">{formatNumber(prov.totalPatinetes || prov.cantidad)}</TableCell>
                    <TableCell className="text-right">
                      {prov.cuota != null ? `${formatNumber(prov.cuota, 1)}%` : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

export { DetalleAreaPatinetes };
