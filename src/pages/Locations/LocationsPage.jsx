/**
 * Pagina de Ubicaciones
 * 
 * Listado y visualizacion de puntos de interes de la ciudad:
 * - Estaciones de monitoreo acustico
 * - Puntos de medicion de trafico
 * - Rutas de transporte publico
 * - Zonas de taxi
 */

import { useState, useEffect, useCallback } from 'react';
import { MapPin, Filter, Search, RefreshCw, Train, Bus, AudioLines, Car } from 'lucide-react';
import { PageLayout } from '../../components/layout';
import { 
  Card, CardHeader, CardTitle, CardContent,
  Button, Input, Select, Badge,
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
  LoadingState, ErrorState, EmptyState, Pagination
} from '../../components/common';
import { StatCard } from '../../components/charts';
import { getLocations } from '../../api/locationService';
import { LOCATION_TYPES, LOCATION_TYPE_LABELS, PAGINATION } from '../../constants';
import { cn, formatCoordinates } from '../../utils';

// Opciones de tipos de ubicacion para el selector
const typeOptions = Object.entries(LOCATION_TYPE_LABELS).map(([value, label]) => ({
  value,
  label
}));

// Iconos por tipo de ubicacion
const typeIcons = {
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
const typeBadgeVariants = {
  estacion_acustica: 'purple',
  punto_trafico: 'warning',
  ruta_cercanias: 'info',
  ruta_autobus: 'success',
  ruta_interurbano: 'secondary',
  ruta_metro: 'default',
  ruta_metro_ligero: 'info',
  zona_taxi: 'warning'
};

/**
 * Pagina de ubicaciones
 */
function LocationsPage() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    tipo: '',
    search: ''
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: PAGINATION.LOCATIONS_DEFAULT_LIMIT
  });

  const [stats, setStats] = useState({
    total: 0,
    estacion_acustica: 0,
    punto_trafico: 0,
    rutas_transporte: 0
  });

  // Cargar ubicaciones
  const fetchLocations = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = {
        page: pagination.currentPage,
        limit: pagination.itemsPerPage
      };
      
      if (filters.tipo) {
        params.tipo = filters.tipo;
      }
      
      const response = await getLocations(params);
      
      if (response.success) {
        setLocations(response.data || []);
        setPagination(prev => ({
          ...prev,
          totalPages: response.pagination?.totalPages || 1,
          totalItems: response.pagination?.totalDocuments || 0
        }));
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError(err.message || 'Error al cargar ubicaciones');
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, pagination.itemsPerPage, filters.tipo]);

  // Cargar estadisticas reales
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Ejecutar peticiones en paralelo para obtener conteos totales
        const [totalRes, acusticaRes, traficoRes, metroRes, busRes, cercaniasRes] = await Promise.all([
          getLocations({ limit: 1 }),
          getLocations({ limit: 1, tipo: 'estacion_acustica' }),
          getLocations({ limit: 1, tipo: 'punto_trafico' }),
          getLocations({ limit: 1, tipo: 'ruta_metro' }),
          getLocations({ limit: 1, tipo: 'ruta_autobus' }),
          getLocations({ limit: 1, tipo: 'ruta_cercanias' })
        ]);

        setStats({
          total: totalRes.pagination?.totalDocuments || 0,
          estacion_acustica: acusticaRes.pagination?.totalDocuments || 0,
          punto_trafico: traficoRes.pagination?.totalDocuments || 0,
          rutas_transporte: (metroRes.pagination?.totalDocuments || 0) + 
                           (busRes.pagination?.totalDocuments || 0) + 
                           (cercaniasRes.pagination?.totalDocuments || 0)
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, []);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  // Cambiar pagina
  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  // Cambiar filtro de tipo
  const handleTypeChange = (e) => {
    setFilters(prev => ({ ...prev, tipo: e.target.value }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  // Limpiar filtros
  const handleClearFilters = () => {
    setFilters({ tipo: '', search: '' });
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  return (
    <PageLayout
      title="Ubicaciones"
      description="Puntos de interes y estaciones de monitoreo de la ciudad"
      actions={
        <Button variant="outline" onClick={fetchLocations}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualizar
        </Button>
      }
    >
      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total"
          value={stats.total}
          icon={MapPin}
        />
        <StatCard
          title="Est. Acusticas"
          value={stats.estacion_acustica}
          icon={AudioLines}
        />
        <StatCard
          title="Puntos Trafico"
          value={stats.punto_trafico}
          icon={Car}
        />
        <StatCard
          title="Rutas Transporte"
          value={stats.rutas_transporte}
          icon={Train}
        />
      </div>

      {/* Filtros */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm text-slate-400 mb-1 block">Tipo de Ubicacion</label>
              <Select
                value={filters.tipo}
                onChange={handleTypeChange}
                options={typeOptions}
                placeholder="Todos los tipos"
              />
            </div>
            <div className="flex items-end">
              <Button variant="ghost" onClick={handleClearFilters}>
                Limpiar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de ubicaciones */}
      <Card>
        <CardHeader>
          <CardTitle>Listado de Ubicaciones</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <LoadingState message="Cargando ubicaciones..." />
          ) : error ? (
            <ErrorState 
              message={error} 
              onRetry={fetchLocations}
            />
          ) : locations.length === 0 ? (
            <EmptyState
              title="Sin ubicaciones"
              description="No se encontraron ubicaciones con los filtros seleccionados."
              icon={MapPin}
            />
          ) : (
            <>
              <Table>
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
                    const Icon = typeIcons[location.tipo] || MapPin;
                    
                    return (
                      <TableRow key={location._id}>
                        <TableCell>
                          <Badge variant={typeBadgeVariants[location.tipo] || 'default'}>
                            <Icon className="h-3 w-3 mr-1" />
                            {LOCATION_TYPE_LABELS[location.tipo] || location.tipo}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {location.nombre || '-'}
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-slate-400">
                          {location.nmt || location.id_punto || location._id.slice(-6)}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {location.distrito || '-'}
                        </TableCell>
                        <TableCell className="hidden xl:table-cell text-sm text-slate-400">
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
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                totalItems={pagination.totalItems}
                itemsPerPage={pagination.itemsPerPage}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </CardContent>
      </Card>
    </PageLayout>
  );
}

export default LocationsPage;
