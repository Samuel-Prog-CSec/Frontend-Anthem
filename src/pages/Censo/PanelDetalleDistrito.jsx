/**
 * Sub-componente PanelDetalleDistrito
 *
 * Panel desplegable con detalles del distrito seleccionado en la tabla:
 * cuatro indicadores principales + tabla de barrios + link cross-domain a
 * la vista completa que agrega censo + accidentes + patinetes + multas.
 */

import { Link } from 'react-router-dom';
import { ArrowRight, X } from 'lucide-react';
import {
  Card, CardHeader, CardTitle, CardContent, CardDescription,
  Button,
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell
} from '../../components/common';
import { ROUTES } from '../../constants';
import { formatNumber } from '../../utils';
import { formatearPorcentaje } from './helpers';

function PanelDetalleDistrito({ detalle, onCerrar }) {
  if (!detalle) return null;

  const nombre = detalle.distrito || `Distrito ${detalle.codigoDistrito}`;

  return (
    <Card className="mb-6 border-[var(--border-emphasis)]">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-base">Detalle: {nombre}</CardTitle>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <Link to={ROUTES.DISTRITO_PATH(detalle.codigoDistrito)}>
                Ver vista completa
                <ArrowRight className="size-4 ml-2" aria-hidden="true" />
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onCerrar}
              aria-label="Cerrar detalle del distrito"
            >
              <X className="size-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
        <CardDescription>
          Indicadores demográficos del distrito. La vista completa agrega
          accidentes, patinetes y multas del mismo distrito.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Celda etiqueta="Población" valor={formatNumber(detalle.poblacionTotal)} />
          <Celda etiqueta="% Extranjeros" valor={formatearPorcentaje(detalle.porcentajeExtranjeros)} />
          <Celda etiqueta="% Productiva" valor={formatearPorcentaje(detalle.porcentajeProductiva)} />
          <Celda etiqueta="% Tercera edad" valor={formatearPorcentaje(detalle.porcentajeTerceraEdad)} />
        </div>

        {detalle.barrios && detalle.barrios.length > 0 && (
          <div className="mt-6">
            <h4 className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground mb-3">
              Desglose por barrios
            </h4>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Barrio</TableHead>
                    <TableHead className="text-right">Población</TableHead>
                    <TableHead className="text-right">% Extranjeros</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {detalle.barrios.map((barrio, idx) => (
                    <TableRow key={idx}>
                      <TableCell>
                        {barrio.nombre || barrio.descripcion || `Barrio ${barrio.codigo}`}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatNumber(barrio.poblacionTotal || barrio.total)}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatearPorcentaje(barrio.porcentajeExtranjeros)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Celda({ etiqueta, valor }) {
  return (
    <div className="p-3 rounded-lg bg-muted/50 text-center">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-1.5">
        {etiqueta}
      </p>
      <p className="font-display text-base font-bold text-foreground">{valor}</p>
    </div>
  );
}

export default PanelDetalleDistrito;
