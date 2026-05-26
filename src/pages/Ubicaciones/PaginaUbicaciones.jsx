/**
 * Pagina de Ubicaciones
 *
 * Listado y visualizacion cross-domain de puntos de interes (estaciones
 * acusticas, puntos de trafico, rutas de transporte, zonas de taxi).
 * Refactorizada en sub-componentes.
 */

import { useState, useMemo, useCallback } from 'react';
import { MapPin, RefreshCw } from 'lucide-react';
import { PageLayout } from '../../components/layout';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, Button } from '../../components/common';
import { MapaUnificado } from '../../components/mapas';
import { useUbicaciones, useUbicacionesStats, useRutasTransporte, usePuntosMedicion } from '../../api/hooks';
import { LOCATION_TYPE_LABELS, PAGINATION, nombreDistrito } from '../../constants';
import { useDebouncedValue } from '../../utils';

import EstadisticasUbicaciones from './EstadisticasUbicaciones';
import FiltrosUbicaciones from './FiltrosUbicaciones';
import DetalleRutasTransporte from './DetalleRutasTransporte';
import DetallePuntosMedicion from './DetallePuntosMedicion';
import TablaUbicaciones from './TablaUbicaciones';
import { tipoTransportePorTipo, tipoMedicionPorTipo } from './constantes';

function PaginaUbicaciones() {
  const [filtros, setFiltros] = useState({ tipo: '', busqueda: '' });
  const [paginaActual, setPaginaActual] = useState(1);
  const elementosPorPagina = PAGINATION.LOCATIONS_DEFAULT_LIMIT;

  // Debounce real del valor de busqueda: evita disparar requests por cada tecla.
  const busquedaDiferida = useDebouncedValue(filtros.busqueda, 300);

  const parametrosConsulta = useMemo(() => {
    const params = {
      page: paginaActual,
      limit: elementosPorPagina
    };
    if (filtros.tipo) params.type = filtros.tipo;
    if (busquedaDiferida) params.nombre = busquedaDiferida;
    return params;
  }, [paginaActual, elementosPorPagina, filtros.tipo, busquedaDiferida]);

  const tipoTransporte = tipoTransportePorTipo[filtros.tipo] || null;
  const tipoMedicion = tipoMedicionPorTipo[filtros.tipo] || null;

  const { data: locationsData, isLoading, error, refetch } = useUbicaciones(parametrosConsulta);
  const { data: stats } = useUbicacionesStats();
  const { data: rutasApi, isLoading: cargandoRutas } = useRutasTransporte(tipoTransporte);
  const { data: puntosApi, isLoading: cargandoPuntos } = usePuntosMedicion(tipoMedicion);

  const paramsPorCapa = useMemo(() => ({
    ubicaciones: filtros.tipo ? { type: filtros.tipo } : {}
  }), [filtros.tipo]);

  const locations = locationsData?.data || [];
  const paginacion = locationsData?.pagination || null;

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

  const datosPuntos = useMemo(() => {
    const puntosData = puntosApi?.data?.data || puntosApi?.data || [];
    if (!Array.isArray(puntosData)) return [];
    return puntosData.slice(0, 20).map(p => ({
      nombre: p.nombre || p.name || '-',
      id: p.nmt || p.id_punto || p._id || '-',
      distrito: nombreDistrito(p.distrito),
      tipo: p.tipo || filtros.tipo
    }));
  }, [puntosApi, filtros.tipo]);

  const manejarCambioTipo = useCallback((e) => {
    setFiltros(prev => ({ ...prev, tipo: e.target.value }));
    setPaginaActual(1);
  }, []);

  const manejarCambioBusqueda = useCallback((e) => {
    setFiltros(prev => ({ ...prev, busqueda: e.target.value }));
    setPaginaActual(1);
  }, []);

  const limpiarFiltros = useCallback(() => {
    setFiltros({ tipo: '', busqueda: '' });
    setPaginaActual(1);
  }, []);

  const refrescar = useCallback(() => {
    refetch();
  }, [refetch]);

  return (
    <PageLayout
      eyebrow="Infraestructura / Ubicaciones"
      title="Anatomia de la malla sensorizada"
      description="82.362 estaciones acusticas, puntos de medicion de trafico y rutas de transporte georreferenciados sobre Madrid."
      actions={
        <Button variant="outline" onClick={refrescar}>
          <RefreshCw className="size-4 mr-2" aria-hidden="true" />
          Actualizar
        </Button>
      }
    >
      <EstadisticasUbicaciones stats={stats} />

      <FiltrosUbicaciones
        filtros={filtros}
        onCambioTipo={manejarCambioTipo}
        onCambioBusqueda={manejarCambioBusqueda}
        onLimpiar={limpiarFiltros}
      />

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <MapPin className="size-5" aria-hidden="true" />
            Mapa interactivo
          </CardTitle>
          <CardDescription>
            Visualizacion cross-domain. Activa o desactiva capas en el panel
            lateral para superponer estaciones, accidentes, multas, patinetes,
            aforo de bicicletas y monitoreo acustico.
            {filtros.tipo
              ? ` Capa "Estaciones y rutas" filtrada por: ${LOCATION_TYPE_LABELS[filtros.tipo] || filtros.tipo}.`
              : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MapaUnificado altura="600px" paramsPorCapa={paramsPorCapa} />
        </CardContent>
      </Card>

      <DetalleRutasTransporte
        tipo={tipoTransporte}
        datos={datosRutas}
        isLoading={cargandoRutas}
      />

      <DetallePuntosMedicion
        tipo={tipoMedicion}
        datos={datosPuntos}
        isLoading={cargandoPuntos}
      />

      <TablaUbicaciones
        locations={locations}
        paginacion={paginacion}
        paginaActual={paginaActual}
        elementosPorPagina={elementosPorPagina}
        isLoading={isLoading}
        error={error}
        onCambioPagina={setPaginaActual}
        onReintentar={refrescar}
      />
    </PageLayout>
  );
}

export default PaginaUbicaciones;
