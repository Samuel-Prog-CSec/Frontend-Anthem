/**
 * Pagina de Ubicaciones
 *
 * Listado y visualizacion de puntos de interes de la ciudad:
 * - Estaciones de monitoreo acustico
 * - Puntos de medicion de trafico
 * - Rutas de transporte publico
 * - Zonas de taxi
 */

import { useState, useMemo } from 'react';
import { MapPin, Filter, Search, RefreshCw, Train, Bus, AudioLines, Car, Route as RouteIcon, Gauge } from 'lucide-react';
import { PageLayout } from '../../components/layout';
import {
  Card, CardHeader, CardTitle, CardContent, CardDescription,
  Button, Input, Select, Badge,
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
  LoadingState, ErrorState, EmptyState, Pagination,
  TableSkeleton, Skeleton
} from '../../components/common';
import { StatCard } from '../../components/charts';
import { MapaUnificado } from '../../components/mapas';
import { useUbicaciones, useUbicacionesStats, useRutasTransporte, usePuntosMedicion } from '../../api/hooks';
import { LOCATION_TYPE_LABELS, PAGINATION } from '../../constants';
import { formatCoordinates, formatNumber, useDebouncedValue } from '../../utils';

// Opciones de tipos de ubicacion para el selector
const opcionesTipo = Object.entries(LOCATION_TYPE_LABELS).map(([value, label]) => ({
  value,
  label
}));

// Iconos por tipo de ubicacion
const iconosPorTipo = {
  estacion_acustica: AudioLines,
  punto_trafico: Car,
  ruta_cercanias: Train,
  ruta_autobus: Bus,
  ruta_interurbano: Bus,
  ruta_metro: Train,
  ruta_metro_ligero: Train,
  zona_taxi: Car
};

// Colores de badge por tipo
const variantesBadgePorTipo = {
  estacion_acustica: 'purple',
  punto_trafico: 'warning',
  ruta_cercanias: 'info',
  ruta_autobus: 'success',
  ruta_interurbano: 'secondary',
  ruta_metro: 'default',
  ruta_metro_ligero: 'info',
  zona_taxi: 'warning'
};

// Mapeo de tipo de ubicacion a tipo de transporte para la API
const tipoTransportePorTipo = {
  ruta_cercanias: 'cercanias',
  ruta_autobus: 'autobus',
  ruta_interurbano: 'interurbano',
  ruta_metro: 'metro',
  ruta_metro_ligero: 'metro_ligero'
};

// Mapeo de tipo de ubicacion a tipo de medicion para la API
const tipoMedicionPorTipo = {
  estacion_acustica: 'acustica',
  punto_trafico: 'trafico'
};

/**
 * Pagina de ubicaciones
 */
function PaginaUbicaciones() {
  const [filtros, setFiltros] = useState({
    tipo: '',
    busqueda: ''
  });
  const [paginaActual, setPaginaActual] = useState(1);
  const elementosPorPagina = PAGINATION.LOCATIONS_DEFAULT_LIMIT;

  // Debounce real del valor de busqueda: useDeferredValue solo retrasa el render,
  // la query seguia disparandose por cada tecla. useDebouncedValue retrasa el valor
  // que entra al queryKey, eliminando requests intermedias mientras el usuario escribe
  const busquedaDiferida = useDebouncedValue(filtros.busqueda, 300);

  // Parametros de consulta derivados del estado
  const parametrosConsulta = useMemo(() => {
    const params = {
      page: paginaActual,
      limit: elementosPorPagina
    };
    if (filtros.tipo) params.type = filtros.tipo;
    if (busquedaDiferida) params.nombre = busquedaDiferida;
    return params;
  }, [paginaActual, elementosPorPagina, filtros.tipo, busquedaDiferida]);

  // Determinar si el tipo seleccionado es una ruta de transporte o punto de medicion
  const tipoTransporte = tipoTransportePorTipo[filtros.tipo] || null;
  const tipoMedicion = tipoMedicionPorTipo[filtros.tipo] || null;

  // React Query: datos de ubicaciones
  const {
    data: locationsData,
    isLoading,
    error,
    refetch
  } = useUbicaciones(parametrosConsulta);

  // React Query: estadisticas (independiente de filtros)
  const { data: stats } = useUbicacionesStats();

  // React Query: rutas de transporte (solo si el tipo seleccionado es transporte)
  const { data: rutasApi, isLoading: cargandoRutas } = useRutasTransporte(tipoTransporte);

  // React Query: puntos de medicion (solo si el tipo seleccionado es medicion)
  const { data: puntosApi, isLoading: cargandoPuntos } = usePuntosMedicion(tipoMedicion);

  // Parametros para la capa Ubicaciones del mapa unificado.
  // El filtro de tipo solo aplica a esa capa (las demas capas tienen sus
  // propios datasets independientes y se gestionan en sus componentes).
  const paramsPorCapa = useMemo(() => ({
    ubicaciones: filtros.tipo ? { type: filtros.tipo } : {}
  }), [filtros.tipo]);

  const locations = locationsData?.data || [];
  const pagination = locationsData?.pagination || {};

  // Cambiar filtro de tipo
  const manejarCambioTipo = (e) => {
    setFiltros(prev => ({ ...prev, tipo: e.target.value }));
    setPaginaActual(1);
  };

  // Cambiar busqueda con debounce
  const manejarCambioBusqueda = (e) => {
    setFiltros(prev => ({ ...prev, busqueda: e.target.value }));
    setPaginaActual(1);
  };

  // Limpiar filtros
  const limpiarFiltros = () => {
    setFiltros({ tipo: '', busqueda: '' });
    setPaginaActual(1);
  };

  // Extraer datos de rutas de transporte de la API
  const datosRutas = useMemo(() => {
    const rutasData = rutasApi?.data?.data || rutasApi?.data || [];
    if (!Array.isArray(rutasData)) return [];
    return rutasData.slice(0, 20).map(r => ({
      nombre: r.nombre || r.name || '-',
      tipo: r.tipo || filtros.tipo,
      paradas: r.paradas?.length || r.stops?.length || r.totalParadas || r.numStops || 0,
      waypoints: r.waypoints?.length || r.geometry?.coordinates?.length || 0
    }));
  }, [rutasApi, filtros.tipo]);

  // Extraer datos de puntos de medicion de la API
  const datosPuntos = useMemo(() => {
    const puntosData = puntosApi?.data?.data || puntosApi?.data || [];
    if (!Array.isArray(puntosData)) return [];
    return puntosData.slice(0, 20).map(p => ({
      nombre: p.nombre || p.name || '-',
      id: p.nmt || p.id_punto || p._id || '-',
      distrito: p.distrito || '-',
      tipo: p.tipo || filtros.tipo
    }));
  }, [puntosApi, filtros.tipo]);

  // Indicador de si hay datos detallados para mostrar
  const hayDetalleRutas = tipoTransporte && datosRutas.length > 0;
  const hayDetallePuntos = tipoMedicion && datosPuntos.length > 0;

  return (
    <PageLayout
      title="Ubicaciones"
      description="Puntos de interes y estaciones de monitoreo de la ciudad"
      actions={
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCw className="size-4 mr-2" />
          Actualizar
        </Button>
      }
    >
      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total"
          value={stats?.total ?? '-'}
          icon={MapPin}
        />
        <StatCard
          title="Est. Acusticas"
          value={stats?.estacion_acustica ?? '-'}
          icon={AudioLines}
        />
        <StatCard
          title="Puntos Trafico"
          value={stats?.punto_trafico ?? '-'}
          icon={Car}
        />
        <StatCard
          title="Rutas Transporte"
          value={stats?.rutas_transporte ?? '-'}
          icon={Train}
        />
      </div>

      {/* Filtros */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="size-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm text-muted-foreground mb-1 block">Tipo de Ubicacion</label>
              <Select
                value={filtros.tipo}
                onChange={manejarCambioTipo}
                options={opcionesTipo}
                placeholder="Todos los tipos"
              />
            </div>
            <div className="flex-1">
              <label className="text-sm text-muted-foreground mb-1 block">Buscar por nombre</label>
              <Input
                value={filtros.busqueda}
                onChange={manejarCambioBusqueda}
                placeholder="Buscar ubicacion..."
                startIcon={Search}
              />
            </div>
            <div className="flex items-end">
              <Button variant="ghost" onClick={limpiarFiltros}>
                Limpiar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mapa unificado: visualizacion cross-domain con toggles de capas
          conmutables. Cada capa tiene su propio color y se carga solo cuando
          el usuario la activa (lazy fetch: el componente solo se monta si la
          capa esta activa, asi su hook React Query no se dispara). El filtro
          de tipo de la card de arriba afecta unicamente a la capa
          "Estaciones y rutas". */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <MapPin className="size-5" />
            Mapa Interactivo
          </CardTitle>
          <CardDescription>
            Visualizacion cross-domain. Activa o desactiva capas en el panel
            lateral para superponer estaciones, accidentes, multas, patinetes,
            aforo de bicicletas y monitoreo acustico en el mismo mapa.
            {filtros.tipo ? ` Capa "Estaciones y rutas" filtrada por: ${LOCATION_TYPE_LABELS[filtros.tipo] || filtros.tipo}.` : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MapaUnificado
            altura="600px"
            paramsPorCapa={paramsPorCapa}
          />
        </CardContent>
      </Card>

      {/* Detalle de rutas de transporte (visible al seleccionar un tipo de transporte) */}
      {tipoTransporte && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RouteIcon className="size-5" />
              Rutas de {LOCATION_TYPE_LABELS[filtros.tipo] || 'Transporte'}
            </CardTitle>
            <CardDescription>
              Informacion detallada de las rutas disponibles
            </CardDescription>
          </CardHeader>
          <CardContent>
            {cargandoRutas ? (
              <TableSkeleton rows={4} columns={3} />
            ) : hayDetalleRutas ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre de la Ruta</TableHead>
                    <TableHead className="text-center">Paradas</TableHead>
                    <TableHead className="text-center">Puntos de Ruta</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {datosRutas.map((ruta, index) => (
                    <TableRow key={`ruta-${index}`}>
                      <TableCell className="font-medium">{ruta.nombre}</TableCell>
                      <TableCell className="text-center font-mono">
                        {ruta.paradas > 0 ? formatNumber(ruta.paradas) : '-'}
                      </TableCell>
                      <TableCell className="text-center font-mono text-muted-foreground">
                        {ruta.waypoints > 0 ? formatNumber(ruta.waypoints) : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <EmptyState
                title="Sin datos de rutas"
                description="No se encontraron detalles para este tipo de transporte."
                icon={RouteIcon}
              />
            )}
          </CardContent>
        </Card>
      )}

      {/* Detalle de puntos de medicion (visible al seleccionar un tipo de medicion) */}
      {tipoMedicion && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gauge className="size-5" />
              Puntos de Medicion - {LOCATION_TYPE_LABELS[filtros.tipo] || 'Medicion'}
            </CardTitle>
            <CardDescription>
              Detalle de los puntos de medicion registrados
            </CardDescription>
          </CardHeader>
          <CardContent>
            {cargandoPuntos ? (
              <TableSkeleton rows={4} columns={3} />
            ) : hayDetallePuntos ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>ID</TableHead>
                    <TableHead>Distrito</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {datosPuntos.map((punto, index) => (
                    <TableRow key={`punto-${index}`}>
                      <TableCell className="font-medium">{punto.nombre}</TableCell>
                      <TableCell className="text-muted-foreground font-mono">{punto.id}</TableCell>
                      <TableCell>{punto.distrito}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <EmptyState
                title="Sin datos de puntos de medicion"
                description="No se encontraron detalles para este tipo de medicion."
                icon={Gauge}
              />
            )}
          </CardContent>
        </Card>
      )}

      {/* Tabla de ubicaciones */}
      <Card>
        <CardHeader>
          <CardTitle>Listado de Ubicaciones</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <TableSkeleton rows={6} columns={6} />
          ) : error ? (
            <ErrorState
              message={error.message || 'Error al cargar ubicaciones'}
              onRetry={() => refetch()}
            />
          ) : locations.length === 0 ? (
            <EmptyState
              title="Sin ubicaciones"
              description="No se encontraron ubicaciones con los filtros seleccionados."
              icon={MapPin}
            />
          ) : (
            <>
              <Table
                label="Listado de ubicaciones"
                rowCount={pagination?.totalDocuments}
                colCount={5}
              >
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead className="hidden md:table-cell">ID</TableHead>
                    <TableHead className="hidden lg:table-cell">Distrito</TableHead>
                    <TableHead className="hidden xl:table-cell">Coordenadas</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {locations.map((location) => {
                    const Icon = iconosPorTipo[location.tipo] || MapPin;

                    return (
                      <TableRow key={location._id}>
                        <TableCell>
                          <Badge variant={variantesBadgePorTipo[location.tipo] || 'default'}>
                            <Icon className="size-3 mr-1" />
                            {LOCATION_TYPE_LABELS[location.tipo] || location.tipo}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {location.nombre || '-'}
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground">
                          {location.nmt || location.id_punto || location._id.slice(-6)}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {location.distrito || '-'}
                        </TableCell>
                        <TableCell className="hidden xl:table-cell text-sm text-muted-foreground">
                          {location.geometry?.coordinates
                            ? formatCoordinates(location.geometry.coordinates[1], location.geometry.coordinates[0])
                            : '-'
                          }
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {/* Paginacion */}
              <Pagination
                currentPage={paginaActual}
                totalPages={pagination.totalPages || 1}
                totalItems={pagination.totalDocuments || 0}
                itemsPerPage={elementosPorPagina}
                onPageChange={setPaginaActual}
              />
            </>
          )}
        </CardContent>
      </Card>
    </PageLayout>
  );
}

export default PaginaUbicaciones;
