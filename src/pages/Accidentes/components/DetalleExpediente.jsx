/**
 * Detalle expandible de un expediente de accidente seleccionado.
 * Subcomponente de PaginaAccidentes.
 */

import { memo } from 'react';
import { FileText, MapPin, X } from 'lucide-react';
import {
  Card, CardHeader, CardTitle, CardDescription, CardContent,
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
  Badge, Button, CardSkeleton
} from '../../../components/common';
import { formatDate, formatearEtiquetaEnum } from '../../../utils';
import { obtenerVarianteBadgeGravedad, obtenerBadgeAlcohol, etiquetaTipoLesion, obtenerVarianteBadgeLesion, etiquetaTipoAccidente, etiquetaGravedad } from '../helpers';

const DetalleExpediente = memo(function DetalleExpediente({
  expediente,
  cargando,
  onCerrar
}) {
  if (cargando) {
    return (
      <Card className="mt-6">
        <CardContent className="py-6">
          <CardSkeleton lines={5} />
        </CardContent>
      </Card>
    );
  }

  if (!expediente) return null;

  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="size-5" />
            Expediente: {expediente.numeroExpediente}
          </CardTitle>
          <Button variant="ghost" onClick={onCerrar}>
            <X className="size-4" />
          </Button>
        </div>
        <CardDescription>
          Detalle completo del accidente y personas afectadas
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Datos generales del accidente */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div>
            <p className="text-sm text-muted-foreground">Fecha</p>
            <p className="font-medium">{formatDate(expediente.fecha)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Hora</p>
            <p className="font-medium">{expediente.hora || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Ubicación</p>
            <p className="font-medium flex items-center gap-1">
              <MapPin className="size-3" />
              {expediente.ubicacion?.calle || '-'}
              {expediente.ubicacion?.numero ? `, N. ${expediente.ubicacion.numero}` : ''}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Distrito</p>
            <p className="font-medium">{expediente.ubicacion?.nombreDistrito || '-'}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <div>
            <p className="text-sm text-muted-foreground">Tipo de accidente</p>
            <p className="font-medium">{expediente.circunstancias?.tipoAccidente ? etiquetaTipoAccidente(expediente.circunstancias.tipoAccidente) : '-'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Gravedad</p>
            <Badge variant={obtenerVarianteBadgeGravedad(expediente.circunstancias?.gravedad)}>
              {etiquetaGravedad(expediente.circunstancias?.gravedad)}
            </Badge>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Vehículo</p>
            <p className="font-medium">{expediente.vehiculo?.tipo ? formatearEtiquetaEnum(expediente.vehiculo.tipo) : '-'}</p>
          </div>
        </div>

        {/* Persona afectada */}
        {expediente.personaAfectada && (
          <div>
            <h4 className="text-sm font-semibold text-foreground/80 mb-3">Persona afectada</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-muted/50 rounded-lg p-4">
              <div>
                <p className="text-sm text-muted-foreground">Tipo</p>
                <p className="font-medium">{expediente.personaAfectada.tipoPersona || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sexo</p>
                <p className="font-medium">{expediente.personaAfectada.sexo || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Rango de edad</p>
                <p className="font-medium">{expediente.personaAfectada.rangoEdad || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Alcohol</p>
                <Badge variant={obtenerBadgeAlcohol(expediente.personaAfectada.positivaAlcohol).variant}>
                  {obtenerBadgeAlcohol(expediente.personaAfectada.positivaAlcohol).label}
                </Badge>
              </div>
            </div>
          </div>
        )}

        {/* Personas afectadas (lista si viene como array) */}
        {expediente.personasAfectadas?.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-foreground/80 mb-3">
              Personas afectadas ({expediente.personasAfectadas.length})
            </h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo persona</TableHead>
                  <TableHead>Sexo</TableHead>
                  <TableHead>Rango edad</TableHead>
                  <TableHead>Lesividad</TableHead>
                  <TableHead>Alcohol</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expediente.personasAfectadas.map((persona, idx) => {
                  const alcoholPersona = obtenerBadgeAlcohol(persona.positivaAlcohol);
                  return (
                    <TableRow key={persona._id || `persona-${idx}`}>
                      <TableCell>{persona.tipoPersona || '-'}</TableCell>
                      <TableCell>{persona.sexo || '-'}</TableCell>
                      <TableCell>{persona.rangoEdad || '-'}</TableCell>
                      <TableCell>
                        <Badge variant={obtenerVarianteBadgeLesion(persona.tipoLesion)}>
                          {etiquetaTipoLesion(persona.tipoLesion)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={alcoholPersona.variant}>
                          {alcoholPersona.label}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

export { DetalleExpediente };
