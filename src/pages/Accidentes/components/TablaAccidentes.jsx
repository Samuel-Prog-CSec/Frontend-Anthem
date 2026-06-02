/**
 * Tabla principal de registros de accidentes con paginacion.
 * Subcomponente de PaginaAccidentes.
 */

import { memo, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ExternalLink } from 'lucide-react';
import {
  Card, CardHeader, CardTitle, CardDescription, CardContent,
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell, TableCaption,
  Badge, Pagination, EmptyState, ErrorState, TableSkeleton
} from '../../../components/common';
import { useCensoResumenDistritos } from '../../../api/hooks';
import { formatDate, formatearNombreDistrito, formatearEtiquetaEnum } from '../../../utils';
import { ROUTES, DATE_CONFIG } from '../../../constants';
import { obtenerVarianteBadgeGravedad, obtenerBadgeAlcohol, etiquetaTipoAccidente } from '../helpers';

// Normaliza un nombre de distrito (uppercase + sin tildes) para hacer
// match con el catalogo del censo. Local porque es trivial y evita anadir
// una dependencia hacia el helper de backend.
function normalizarNombre(texto) {
  if (typeof texto !== 'string') return '';
  return texto.toUpperCase().trim().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

const TablaAccidentes = memo(function TablaAccidentes({
  isLoading,
  error,
  datos,
  paginacionActual,
  totalDocuments,
  onCambioPagina,
  onClickExpediente,
  onRetry
}) {
  // Map nombre normalizado → codigo del distrito. Lo cargamos UNA vez al
  // montar la tabla y lo reusamos para cada fila (evita un hook por fila).
  // useCensoResumenDistritos esta cacheado por React Query; si el usuario ya
  // visito Censo o Multas, este lookup es gratis.
  const { data: resumenDistritos } = useCensoResumenDistritos({
    año: DATE_CONFIG.DATASET_YEAR
  });
  const distritoPorNombre = useMemo(() => {
    const lista = resumenDistritos?.data?.data || resumenDistritos?.data || [];
    const map = new Map();
    for (const d of lista) {
      map.set(normalizarNombre(d.nombre), d);
    }
    return map;
  }, [resumenDistritos]);

  // Marcamos cada fila como "inicio de expediente" o "continuacion" para
  // que el usuario vea de un vistazo que las 3-4 filas con el mismo
  // expediente son personas distintas afectadas en el MISMO accidente,
  // no duplicados. La fila inicial mantiene fila completa; las
  // continuaciones difuminan los campos que se repiten (fecha, hora,
  // calle, distrito, tipo, gravedad) y solo destacan los que varian
  // entre personas (vehiculo, persona, alcohol).
  const filasConGrupo = useMemo(() => {
    return datos.map((record, indice) => {
      const expediente = record.numeroExpediente || record._id;
      const anterior = indice > 0
        ? (datos[indice - 1].numeroExpediente || datos[indice - 1]._id)
        : null;
      return { record, esInicio: expediente !== anterior };
    });
  }, [datos]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registro de Accidentes</CardTitle>
        <CardDescription>
          Cada fila representa una persona afectada. Un mismo expediente puede
          generar varias filas cuando hay varias personas implicadas.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <TableSkeleton rows={6} columns={7} />
        ) : error ? (
          <ErrorState
            message={error}
            onRetry={onRetry}
          />
        ) : datos.length === 0 ? (
          <EmptyState
            title="Sin accidentes"
            description="No se encontraron accidentes con los filtros seleccionados."
            icon={AlertTriangle}
          />
        ) : (
          <>
            <Table
              label="Listado de accidentes"
              rowCount={totalDocuments}
            >
              <TableCaption className="sr-only">Registro de personas afectadas en accidentes de trafico</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Expediente</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Hora</TableHead>
                  <TableHead>Calle</TableHead>
                  <TableHead>Distrito</TableHead>
                  <TableHead>Tipo Accidente</TableHead>
                  <TableHead>Gravedad</TableHead>
                  <TableHead>Vehiculo</TableHead>
                  <TableHead>Persona</TableHead>
                  <TableHead>Alcohol</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filasConGrupo.map(({ record, esInicio }) => {
                  const alcohol = obtenerBadgeAlcohol(record.personaAfectada?.positivaAlcohol);

                  return (
                    <TableRow
                      key={record._id}
                      className={esInicio ? 'border-t-2 border-t-border/80' : ''}
                    >
                      <TableCell className="font-medium font-mono text-xs">
                        {record.numeroExpediente ? (
                          <button
                            onClick={() => onClickExpediente(record.numeroExpediente)}
                            className="text-info hover:opacity-80 underline cursor-pointer transition-colors"
                            title="Ver detalle del expediente"
                          >
                            {record.numeroExpediente}
                          </button>
                        ) : '-'}
                      </TableCell>
                      <TableCell>
                        {formatDate(record.fecha)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {record.hora || '-'}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{record.ubicacion?.calle || '-'}</p>
                          {record.ubicacion?.numero && (
                            <p className="text-xs text-muted-foreground">N. {record.ubicacion.numero}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-foreground/80">
                        {(() => {
                          // Drill-down: si el nombre del distrito coincide con
                          // alguno del catalogo del censo, hacemos clickeable
                          // hacia el perfil cross-domain. Si no coincide
                          // (texto raro o vacio), mostramos texto plano.
                          const nombreDistrito = record.ubicacion?.nombreDistrito;
                          if (!nombreDistrito) return '-';
                          const nombreCanonico = formatearNombreDistrito(nombreDistrito);
                          const distritoCanon = distritoPorNombre.get(normalizarNombre(nombreDistrito));
                          if (!distritoCanon) return nombreCanonico;
                          return (
                            <Link
                              to={ROUTES.DISTRITO_PATH(distritoCanon.codigo)}
                              className="inline-flex items-center gap-1 text-info hover:opacity-80 underline transition-colors"
                              title={`Ver perfil de ${distritoCanon.nombre}`}
                            >
                              {nombreCanonico}
                              <ExternalLink className="size-3" aria-hidden="true" />
                            </Link>
                          );
                        })()}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {record.circunstancias?.tipoAccidente
                          ? etiquetaTipoAccidente(record.circunstancias.tipoAccidente)
                          : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={obtenerVarianteBadgeGravedad(record.circunstancias?.gravedad)}>
                          {record.circunstancias?.gravedad || '-'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatearEtiquetaEnum(record.vehiculo?.tipo)}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">{record.personaAfectada?.tipoPersona || '-'}</p>
                          <p className="text-xs text-muted-foreground">{record.personaAfectada?.sexo || ''} {record.personaAfectada?.rangoEdad || ''}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={alcohol.variant}>
                          {alcohol.label}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            <Pagination
              currentPage={paginacionActual.paginaActual}
              totalPages={paginacionActual.totalPaginas}
              totalItems={paginacionActual.totalElementos}
              itemsPerPage={paginacionActual.elementosPorPagina}
              onPageChange={onCambioPagina}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
});

export { TablaAccidentes };
