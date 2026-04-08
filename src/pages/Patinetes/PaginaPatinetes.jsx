/**
 * Pagina de Asignacion de Patinetes
 *
 * Visualizacion de datos de asignacion de patinetes por distrito/barrio:
 * - Estadisticas por area (total patinetes, proveedores, densidad)
 * - Distribucion por distrito (grafico de barras)
 * - Cuota de mercado por proveedor (grafico de pastel)
 * - Tabla detallada con filtros
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Zap, Filter, RefreshCw, MapPin, BarChart3, Users, TrendingUp, Layers, X } from 'lucide-react';
import { PageLayout } from '../../components/layout';
import {
  Card, CardHeader, CardTitle, CardContent, CardDescription,
  Button, Select, Badge,
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
  LoadingState, ErrorState, EmptyState, Pagination
} from '../../components/common';
import { StatCard, BarChartCard, PieChartCard } from '../../components/charts';
import {
  obtenerAsignaciones, obtenerEstadisticasDistritos, obtenerAnalisisMercado,
  obtenerZonasConcentracion, obtenerDetallesArea
} from '../../api/servicioPatinetes';
import { PAGINATION, DATE_CONFIG } from '../../constants';
import { formatNumber } from '../../utils';

// Opciones de filtro para densidad de patinetes
const densityOptions = [
  { value: 'BAJA', label: 'Baja' },
  { value: 'MEDIA', label: 'Media' },
  { value: 'ALTA', label: 'Alta' },
  { value: 'MUY_ALTA', label: 'Muy Alta' }
];

// Opciones de filtro para tipo de zona
const zoneTypeOptions = [
  { value: 'CENTRO_URBANO', label: 'Centro Urbano' },
  { value: 'ZONA_COMERCIAL', label: 'Zona Comercial' },
  { value: 'ZONA_UNIVERSITARIA', label: 'Zona Universitaria' },
  { value: 'ZONA_TRANSPORTE', label: 'Zona Transporte' },
  { value: 'ZONA_RESIDENCIAL', label: 'Zona Residencial' }
];

/**
 * Obtiene la variante del badge segun el nivel de densidad
 * @param {string} density - Nivel de densidad
 * @returns {string} Variante del badge
 */
function getDensityBadgeVariant(density) {
  switch (density) {
    case 'MUY_ALTA': return 'destructive';
    case 'ALTA': return 'warning';
    case 'MEDIA': return 'info';
    case 'BAJA': return 'secondary';
    default: return 'secondary';
  }
}

/**
 * Obtiene la variante del badge segun el nivel de demanda
 * @param {string} demand - Nivel de demanda
 * @returns {string} Variante del badge
 */
function getDemandBadgeVariant(demand) {
  switch (demand) {
    case 'MUY_ALTA': return 'destructive';
    case 'ALTA': return 'warning';
    case 'MEDIA': return 'info';
    case 'BAJA': return 'secondary';
    default: return 'secondary';
  }
}

/**
 * Pagina de asignacion de patinetes
 */
function PaginaPatinetes() {
  const [datos, setDatos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [estadisticasDistritos, setEstadisticasDistritos] = useState([]);
  const [datosMercado, setDatosMercado] = useState([]);
  const [zonasConcentracion, setZonasConcentracion] = useState([]);
  const [areaSeleccionada, setAreaSeleccionada] = useState(null);
  const [cargandoArea, setCargandoArea] = useState(false);
  const [filtros, setFiltros] = useState({
    distrito: '',
    densidad: '',
    tipoZona: ''
  });
  const [paginacion, setPaginacion] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: PAGINATION.DEFAULT_LIMIT
  });

  // Cargar datos
  const cargarDatos = useCallback(async () => {
    setCargando(true);
    setError(null);

    try {
      const params = {
        page: paginacion.currentPage,
        limit: paginacion.itemsPerPage
      };

      if (filtros.distrito) {
        params.distrito = filtros.distrito;
      }

      if (filtros.densidad) {
        params.densidad = filtros.densidad;
      }

      if (filtros.tipoZona) {
        params.tipoZona = filtros.tipoZona;
      }

      // Llamadas paralelas para datos principales, estadisticas, mercado y zonas
      const [assignmentsResponse, districtResponse, marketResponse, zonasResponse] = await Promise.all([
        obtenerAsignaciones(params),
        obtenerEstadisticasDistritos(),
        obtenerAnalisisMercado(),
        obtenerZonasConcentracion()
      ]);

      // Procesar asignaciones
      if (assignmentsResponse.success) {
        setDatos(assignmentsResponse.data || []);
        setPaginacion(prev => ({
          ...prev,
          totalPages: assignmentsResponse.pagination?.totalPages || 1,
          totalItems: assignmentsResponse.pagination?.totalDocuments || assignmentsResponse.pagination?.totalItems || 0
        }));
      } else {
        setError(assignmentsResponse.message);
      }

      // Procesar estadisticas por distrito
      if (districtResponse.success) {
        setEstadisticasDistritos(districtResponse.data || []);
      }

      // Procesar analisis de mercado
      if (marketResponse.success) {
        setDatosMercado(marketResponse.data || []);
      }

      // Procesar zonas de concentracion
      if (zonasResponse.success) {
        setZonasConcentracion(zonasResponse.data || []);
      }
    } catch (err) {
      setError(err.message || 'Error al cargar datos de patinetes');
    } finally {
      setCargando(false);
    }
  }, [paginacion.currentPage, paginacion.itemsPerPage, filtros.distrito, filtros.densidad, filtros.tipoZona]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  // Cambiar pagina
  const manejarCambioPagina = (page) => {
    setPaginacion(prev => ({ ...prev, currentPage: page }));
  };

  // Cambiar filtros
  const manejarCambioFiltro = (name, value) => {
    setFiltros(prev => ({ ...prev, [name]: value }));
    setPaginacion(prev => ({ ...prev, currentPage: 1 }));
  };

  // Limpiar filtros
  const limpiarFiltros = () => {
    setFiltros({ distrito: '', densidad: '', tipoZona: '' });
    setPaginacion(prev => ({ ...prev, currentPage: 1 }));
  };

  // Cargar detalle de area
  const manejarClickArea = useCallback(async (distrito, barrio) => {
    if (!distrito || !barrio) return;

    // Si ya esta seleccionada la misma area, cerrar
    if (areaSeleccionada?.distrito?.nombre === distrito && areaSeleccionada?.barrio?.nombre === barrio) {
      setAreaSeleccionada(null);
      return;
    }

    setCargandoArea(true);
    try {
      const response = await obtenerDetallesArea(distrito, barrio);
      if (response.success) {
        setAreaSeleccionada(response.data || null);
      }
    } catch (err) {
      setAreaSeleccionada(null);
    } finally {
      setCargandoArea(false);
    }
  }, [areaSeleccionada]);

  // Calcular estadisticas del resumen
  const estadisticas = useMemo(() => {
    if (datos.length === 0) {
      return {
        totalPatinetes: 0,
        proveedoresActivos: 0,
        promedioPorBarrio: 0,
        totalAreas: 0
      };
    }

    const totalPatinetes = datos
      .filter(d => d.estadisticas?.totalPatinetes != null)
      .reduce((sum, d) => sum + d.estadisticas.totalPatinetes, 0);

    const proveedoresValues = datos
      .filter(d => d.estadisticas?.proveedoresActivos != null)
      .map(d => d.estadisticas.proveedoresActivos);

    const proveedoresActivos = proveedoresValues.length > 0
      ? proveedoresValues.reduce((a, b) => a + b, 0) / proveedoresValues.length
      : 0;

    const promedioPorBarrio = datos.length > 0
      ? totalPatinetes / datos.length
      : 0;

    return {
      totalPatinetes,
      proveedoresActivos,
      promedioPorBarrio,
      totalAreas: paginacion.totalItems
    };
  }, [datos, paginacion.totalItems]);

  // Preparar opciones de distrito desde estadisticasDistritos
  const districtOptions = useMemo(() => {
    return estadisticasDistritos.map(d => ({
      value: d._id,
      label: d._id
    }));
  }, [estadisticasDistritos]);

  // Preparar datos para grafico de barras (patinetes por distrito)
  const datosGrafico = useMemo(() => {
    return estadisticasDistritos.map(d => ({
      name: d._id,
      totalPatinetes: d.totalPatinetes || 0
    }));
  }, [estadisticasDistritos]);

  // Preparar datos para grafico de pastel (cuota de mercado por proveedor, top 8)
  const pieChartData = useMemo(() => {
    return datosMercado
      .slice(0, 8)
      .map(d => ({
        name: d._id,
        value: d.totalPatinetes || 0
      }));
  }, [datosMercado]);

  return (
    <PageLayout
      title="Asignacion de Patinetes"
      description={`Distribucion y asignacion de patinetes por distrito - ${DATE_CONFIG.DATASET_YEAR}`}
      actions={
        <Button variant="outline" onClick={cargarDatos}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualizar
        </Button>
      }
    >
      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total Patinetes"
          value={formatNumber(estadisticas.totalPatinetes)}
          icon={Zap}
        />
        <StatCard
          title="Areas Registradas"
          value={estadisticas.totalAreas}
          icon={MapPin}
        />
        <StatCard
          title="Promedio por Barrio"
          value={formatNumber(Math.round(estadisticas.promedioPorBarrio))}
          icon={BarChart3}
        />
        <StatCard
          title="Proveedores Activos"
          value={Math.round(estadisticas.proveedoresActivos)}
          subtitle="promedio por area"
          icon={Users}
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
              <label className="text-sm text-slate-400 mb-1 block">Distrito</label>
              <Select
                value={filtros.distrito}
                onChange={(e) => manejarCambioFiltro('distrito', e.target.value)}
                options={districtOptions}
                placeholder="Todos los distritos"
              />
            </div>
            <div className="flex-1">
              <label className="text-sm text-slate-400 mb-1 block">Densidad</label>
              <Select
                value={filtros.densidad}
                onChange={(e) => manejarCambioFiltro('densidad', e.target.value)}
                options={densityOptions}
                placeholder="Todas las densidades"
              />
            </div>
            <div className="flex-1">
              <label className="text-sm text-slate-400 mb-1 block">Tipo de Zona</label>
              <Select
                value={filtros.tipoZona}
                onChange={(e) => manejarCambioFiltro('tipoZona', e.target.value)}
                options={zoneTypeOptions}
                placeholder="Todos los tipos"
              />
            </div>
            <div className="flex items-end">
              <Button variant="ghost" onClick={limpiarFiltros}>
                Limpiar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Graficos */}
      {!cargando && (estadisticasDistritos.length > 0 || datosMercado.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {estadisticasDistritos.length > 0 && (
            <BarChartCard
              title="Patinetes por Distrito"
              data={datosGrafico}
              xKey="name"
              bars={[
                { key: 'totalPatinetes', name: 'Total Patinetes', color: '#06b6d4' }
              ]}
              height={280}
            />
          )}
          {datosMercado.length > 0 && (
            <PieChartCard
              title="Cuota de Mercado por Proveedor"
              data={pieChartData}
              height={280}
              donut
            />
          )}
        </div>
      )}

      {/* Zonas de concentracion */}
      {!cargando && zonasConcentracion.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Layers className="h-5 w-5" />
              Zonas de Mayor Concentracion
            </CardTitle>
            <CardDescription>
              Areas con la mayor densidad de patinetes asignados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Distrito</TableHead>
                  <TableHead>Barrio</TableHead>
                  <TableHead className="text-right">Total Patinetes</TableHead>
                  <TableHead className="text-center">Densidad</TableHead>
                  <TableHead className="text-center">Proveedores</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {zonasConcentracion.slice(0, 10).map((zona, index) => (
                  <TableRow key={`zona-${index}`}>
                    <TableCell className="font-medium">
                      {zona.distrito || zona._id?.distrito || '-'}
                    </TableCell>
                    <TableCell>
                      {zona.barrio || zona._id?.barrio || '-'}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatNumber(zona.totalPatinetes)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={getDensityBadgeVariant(zona.densidad || zona.densidadPatinetes)}>
                        {zona.densidad || zona.densidadPatinetes || '-'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {zona.proveedoresActivos || zona.totalProveedores || '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Tabla de datos */}
      <Card>
        <CardHeader>
          <CardTitle>Asignaciones de Patinetes</CardTitle>
          <CardDescription>
            Distribucion de patinetes por distrito y barrio
          </CardDescription>
        </CardHeader>
        <CardContent>
          {cargando ? (
            <LoadingState message="Cargando asignaciones..." />
          ) : error ? (
            <ErrorState
              message={error}
              onRetry={cargarDatos}
            />
          ) : datos.length === 0 ? (
            <EmptyState
              title="Sin asignaciones"
              description="No se encontraron asignaciones con los filtros seleccionados."
              icon={Zap}
            />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Distrito</TableHead>
                    <TableHead>Barrio</TableHead>
                    <TableHead className="text-right">Total Patinetes</TableHead>
                    <TableHead className="text-center">Proveedores</TableHead>
                    <TableHead className="text-center">Densidad</TableHead>
                    <TableHead>Tipo Zona</TableHead>
                    <TableHead className="text-center">Demanda</TableHead>
                    <TableHead>Proveedor Dominante</TableHead>
                    <TableHead className="text-right">HHI</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {datos.map(item => (
                    <TableRow
                      key={item._id}
                      className="cursor-pointer hover:bg-slate-800/50 transition-colors"
                      onClick={() => manejarClickArea(item.distrito?.nombre, item.barrio?.nombre)}
                    >
                      <TableCell className="font-medium text-cyan-400">
                        {item.distrito?.nombre}
                      </TableCell>
                      <TableCell>
                        {item.barrio?.nombre}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatNumber(item.estadisticas?.totalPatinetes)}
                      </TableCell>
                      <TableCell className="text-center">
                        {item.estadisticas?.proveedoresActivos}/{item.estadisticas?.totalProveedores}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={getDensityBadgeVariant(item.estadisticas?.densidadPatinetes)}>
                          {item.estadisticas?.densidadPatinetes}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {item.clasificacionArea?.tipoZona?.replace(/_/g, ' ')}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={getDemandBadgeVariant(item.clasificacionArea?.demandaEstimada)}>
                          {item.clasificacionArea?.demandaEstimada}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {item.analisisDistribucion?.proveedorDominante?.nombre || '-'}
                      </TableCell>
                      <TableCell className="text-right font-mono text-slate-300">
                        {formatNumber(item.analisisDistribucion?.indiceHerfindahl)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Paginacion */}
              <Pagination
                currentPage={paginacion.currentPage}
                totalPages={paginacion.totalPages}
                totalItems={paginacion.totalItems}
                itemsPerPage={paginacion.itemsPerPage}
                onPageChange={manejarCambioPagina}
              />
            </>
          )}
        </CardContent>
      </Card>
      {/* Detalle de area seleccionada */}
      {cargandoArea && (
        <Card className="mt-6">
          <CardContent className="py-6">
            <LoadingState message="Cargando detalle del area..." />
          </CardContent>
        </Card>
      )}

      {areaSeleccionada && !cargandoArea && (
        <Card className="mt-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <MapPin className="h-5 w-5" />
                {areaSeleccionada.distrito?.nombre || '-'} - {areaSeleccionada.barrio?.nombre || '-'}
              </CardTitle>
              <Button variant="ghost" onClick={() => setAreaSeleccionada(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <CardDescription>
              Detalle de asignacion de patinetes en el area seleccionada
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Estadisticas del area */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div>
                <p className="text-sm text-slate-400">Total Patinetes</p>
                <p className="text-xl font-bold">{formatNumber(areaSeleccionada.estadisticas?.totalPatinetes)}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Proveedores Activos</p>
                <p className="text-xl font-bold">
                  {areaSeleccionada.estadisticas?.proveedoresActivos || 0}/{areaSeleccionada.estadisticas?.totalProveedores || 0}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Densidad</p>
                <Badge variant={getDensityBadgeVariant(areaSeleccionada.estadisticas?.densidadPatinetes)}>
                  {areaSeleccionada.estadisticas?.densidadPatinetes || '-'}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-slate-400">Tipo de Zona</p>
                <p className="font-medium">
                  {areaSeleccionada.clasificacionArea?.tipoZona?.replace(/_/g, ' ') || '-'}
                </p>
              </div>
            </div>

            {/* Clasificacion del area */}
            {areaSeleccionada.clasificacionArea && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <p className="text-sm text-slate-400">Demanda Estimada</p>
                  <Badge variant={getDemandBadgeVariant(areaSeleccionada.clasificacionArea.demandaEstimada)}>
                    {areaSeleccionada.clasificacionArea.demandaEstimada || '-'}
                  </Badge>
                </div>
                {areaSeleccionada.analisisDistribucion?.proveedorDominante && (
                  <div>
                    <p className="text-sm text-slate-400">Proveedor Dominante</p>
                    <p className="font-medium">{areaSeleccionada.analisisDistribucion.proveedorDominante.nombre || '-'}</p>
                  </div>
                )}
                {areaSeleccionada.analisisDistribucion?.indiceHerfindahl != null && (
                  <div>
                    <p className="text-sm text-slate-400">Indice Herfindahl (HHI)</p>
                    <p className="font-mono font-medium">{formatNumber(areaSeleccionada.analisisDistribucion.indiceHerfindahl)}</p>
                  </div>
                )}
              </div>
            )}

            {/* Proveedores en el area */}
            {areaSeleccionada.proveedores?.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-slate-300 mb-3">
                  Proveedores en el Area ({areaSeleccionada.proveedores.length})
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
                    {areaSeleccionada.proveedores.map((prov, idx) => (
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
      )}
    </PageLayout>
  );
}

export default PaginaPatinetes;
