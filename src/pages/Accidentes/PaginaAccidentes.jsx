/**
 * Pagina de Accidentalidad
 *
 * Visualizacion de datos de accidentes de trafico:
 * - Personas afectadas por accidentes
 * - Distribucion por tipo de accidente y gravedad
 * - Comparativa por distritos
 * - Analisis de presencia de alcohol
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { AlertTriangle, Filter, RefreshCw, ShieldAlert, Skull, Wine, Car, Users, X, FileText, MapPin } from 'lucide-react';
import { PageLayout } from '../../components/layout';
import {
  Card, CardHeader, CardTitle, CardContent, CardDescription,
  Button, Select, Badge,
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
  LoadingState, ErrorState, EmptyState, Pagination
} from '../../components/common';
import { StatCard, BarChartCard, PieChartCard } from '../../components/charts';
import {
  obtenerDatosAccidentes, obtenerComparativaDistritos,
  obtenerEstadisticasAccidentes, obtenerAccidentePorExpediente,
  obtenerMapaCalorAccidentes
} from '../../api/servicioAccidentes';
import { PAGINATION, DATE_CONFIG } from '../../constants';
import { formatDate, formatNumber } from '../../utils';

// Meses para selector
const opcionesMes = [
  { value: '1', label: 'Enero' },
  { value: '2', label: 'Febrero' },
  { value: '3', label: 'Marzo' },
  { value: '4', label: 'Abril' },
  { value: '5', label: 'Mayo' },
  { value: '6', label: 'Junio' },
  { value: '7', label: 'Julio' },
  { value: '8', label: 'Agosto' },
  { value: '9', label: 'Septiembre' },
  { value: '10', label: 'Octubre' },
  { value: '11', label: 'Noviembre' },
  { value: '12', label: 'Diciembre' }
];

// Tipos de accidente para selector
const opcionesTipoAccidente = [
  { value: 'ALCANCE', label: 'Alcance' },
  { value: 'ATROPELLO_A_PERSONA', label: 'Atropello a persona' },
  { value: 'CAÍDA', label: 'Caida' },
  { value: 'CHOQUE_CONTRA_OBSTÁCULO_FIJO', label: 'Choque contra obstaculo fijo' },
  { value: 'COLISIÓN_FRONTAL', label: 'Colision frontal' },
  { value: 'COLISIÓN_FRONTO-LATERAL', label: 'Colision fronto-lateral' },
  { value: 'COLISIÓN_LATERAL', label: 'Colision lateral' },
  { value: 'COLISIÓN_MÚLTIPLE', label: 'Colision multiple' },
  { value: 'VUELCO', label: 'Vuelco' },
  { value: 'OTRO', label: 'Otro' }
];

// Niveles de gravedad para selector
const opcionesGravedad = [
  { value: 'LEVE', label: 'Leve' },
  { value: 'GRAVE', label: 'Grave' },
  { value: 'MORTAL', label: 'Mortal' }
];

/**
 * Obtiene la variante del badge segun la gravedad
 * @param {string} gravedad - Nivel de gravedad
 * @returns {string} Variante del badge
 */
function obtenerVarianteBadgeGravedad(gravedad) {
  if (!gravedad) return 'secondary';
  const upper = gravedad.toUpperCase();
  if (upper === 'LEVE') return 'success';
  if (upper === 'GRAVE') return 'warning';
  if (upper === 'MORTAL') return 'destructive';
  return 'secondary';
}

/**
 * Obtiene la variante del badge segun resultado de alcohol
 * @param {string} value - Valor del test de alcohol ('S', 'N', etc.)
 * @returns {{ variant: string, label: string }}
 */
function obtenerBadgeAlcohol(value) {
  if (value === 'S') return { variant: 'destructive', label: 'Positivo' };
  if (value === 'N') return { variant: 'success', label: 'Negativo' };
  return { variant: 'secondary', label: 'N/D' };
}

/**
 * Pagina de accidentalidad
 */
function PaginaAccidentes() {
  const [datos, setDatos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [datosDistritos, setDatosDistritos] = useState([]);
  const [estadisticasGenerales, setEstadisticasGenerales] = useState(null);
  const [zonasAccidentalidad, setZonasAccidentalidad] = useState([]);
  const [expedienteSeleccionado, setExpedienteSeleccionado] = useState(null);
  const [cargandoExpediente, setCargandoExpediente] = useState(false);
  const [filtros, setFiltros] = useState({
    distrito: '',
    tipoAccidente: '',
    gravedad: '',
    mes: ''
  });
  const [paginacion, setPaginacion] = useState({
    paginaActual: 1,
    totalPaginas: 1,
    totalElementos: 0,
    elementosPorPagina: PAGINATION.DEFAULT_LIMIT
  });

  // Cargar datos
  const cargarDatos = useCallback(async () => {
    setCargando(true);
    setError(null);

    try {
      const params = {
        page: paginacion.paginaActual,
        limit: paginacion.elementosPorPagina
      };

      if (filtros.distrito) params.distrito = filtros.distrito;
      if (filtros.tipoAccidente) params.tipoAccidente = filtros.tipoAccidente;
      if (filtros.gravedad) params.gravedad = filtros.gravedad;

      if (filtros.mes) {
        const year = DATE_CONFIG.DATASET_YEAR;
        const month = parseInt(filtros.mes);
        params.startDate = new Date(year, month - 1, 1).toISOString();
        params.endDate = new Date(year, month, 0, 23, 59, 59).toISOString();
      }

      const [dataResponse, districtResponse, statsResponse, heatmapResponse] = await Promise.all([
        obtenerDatosAccidentes(params),
        obtenerComparativaDistritos(),
        obtenerEstadisticasAccidentes(),
        obtenerMapaCalorAccidentes({ limite: 300, precision: 100 }).catch(() => null)
      ]);

      if (dataResponse.success) {
        setDatos(dataResponse.data || []);
        setPaginacion(prev => ({
          ...prev,
          totalPaginas: dataResponse.pagination?.totalPages || 1,
          totalElementos: dataResponse.pagination?.totalDocuments || dataResponse.pagination?.totalItems || 0
        }));
      }

      if (districtResponse.success) {
        setDatosDistritos(districtResponse.data || []);
      }

      if (statsResponse.success) {
        setEstadisticasGenerales(statsResponse.data || null);
      }

      // Procesar zonas de accidentalidad del mapa de calor
      if (heatmapResponse?.success && heatmapResponse?.data?.data) {
        const zonas = Array.isArray(heatmapResponse.data.data)
          ? heatmapResponse.data.data
              .sort((a, b) => b.totalAccidentes - a.totalAccidentes)
              .slice(0, 10)
          : [];
        setZonasAccidentalidad(zonas);
      }
    } catch (err) {
      setError(err.message || 'Error al cargar datos de accidentes');
    } finally {
      setCargando(false);
    }
  }, [paginacion.paginaActual, paginacion.elementosPorPagina, filtros]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  // Cambiar pagina
  const manejarCambioPagina = (page) => {
    setPaginacion(prev => ({ ...prev, paginaActual: page }));
  };

  // Cambiar filtros
  const manejarCambioFiltro = (name, value) => {
    setFiltros(prev => ({ ...prev, [name]: value }));
    setPaginacion(prev => ({ ...prev, paginaActual: 1 }));
  };

  // Limpiar filtros
  const limpiarFiltros = () => {
    setFiltros({ distrito: '', tipoAccidente: '', gravedad: '', mes: '' });
    setPaginacion(prev => ({ ...prev, paginaActual: 1 }));
  };

  // Cargar detalle de expediente
  const manejarClickExpediente = useCallback(async (numeroExpediente) => {
    if (!numeroExpediente) return;

    // Si ya esta seleccionado, cerrar el detalle
    if (expedienteSeleccionado?.numeroExpediente === numeroExpediente) {
      setExpedienteSeleccionado(null);
      return;
    }

    setCargandoExpediente(true);
    try {
      const response = await obtenerAccidentePorExpediente(numeroExpediente);
      if (response.success) {
        setExpedienteSeleccionado(response.data || null);
      }
    } catch (err) {
      // Silenciar error - simplemente no mostrar el detalle
      setExpedienteSeleccionado(null);
    } finally {
      setCargandoExpediente(false);
    }
  }, [expedienteSeleccionado]);

  // Calcular estadisticas de la pagina actual
  const estadisticas = useMemo(() => {
    if (datos.length === 0) {
      return {
        totalPersonasAfectadas: paginacion.totalElementos,
        accidentesGraves: 0,
        accidentesMortales: 0,
        conAlcohol: 0
      };
    }

    const accidentesGraves = datos.filter(d => {
      const gravedad = d.circunstancias?.gravedad?.toUpperCase();
      return gravedad === 'GRAVE' || gravedad === 'MORTAL';
    }).length;

    const accidentesMortales = datos.filter(d =>
      d.circunstancias?.gravedad?.toUpperCase() === 'MORTAL'
    ).length;

    const conAlcohol = datos.filter(d =>
      d.personaAfectada?.positivaAlcohol === 'S'
    ).length;

    return {
      totalPersonasAfectadas: paginacion.totalElementos,
      accidentesGraves,
      accidentesMortales,
      conAlcohol
    };
  }, [datos, paginacion.totalElementos]);

  // Preparar datos para grafico de barras (top 10 distritos)
  const datosGrafico = useMemo(() => {
    return datosDistritos
      .sort((a, b) => (b.totalAccidentes || 0) - (a.totalAccidentes || 0))
      .slice(0, 10)
      .map(d => ({
        distrito: d._id,
        totalAccidentes: d.totalAccidentes || 0
      }));
  }, [datosDistritos]);

  // Preparar datos para grafico de pastel (distribucion por tipo de accidente)
  const datosGraficoPastel = useMemo(() => {
    if (datos.length === 0) return [];

    const conteosPorTipo = {};
    datos.forEach(d => {
      const tipo = d.circunstancias?.tipoAccidente || 'Desconocido';
      conteosPorTipo[tipo] = (conteosPorTipo[tipo] || 0) + 1;
    });

    return Object.entries(conteosPorTipo)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [datos]);

  // Opciones de distrito derivadas de datosDistritos
  const opcionesDistrito = useMemo(() =>
    datosDistritos.map(d => ({ value: d._id, label: d._id })),
  [datosDistritos]);

  return (
    <PageLayout
      title="Accidentalidad"
      description={`Datos de accidentes de trafico - ${DATE_CONFIG.DATASET_YEAR}`}
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
          title="Total Personas Afectadas"
          value={formatNumber(estadisticasGenerales?.totalAccidentes || estadisticas.totalPersonasAfectadas)}
          icon={Users}
        />
        <StatCard
          title="Accidentes Graves"
          value={formatNumber(estadisticasGenerales?.accidentesGraves || estadisticas.accidentesGraves)}
          subtitle={estadisticasGenerales ? 'total global' : 'en pagina actual'}
          icon={ShieldAlert}
        />
        <StatCard
          title="Accidentes Mortales"
          value={formatNumber(estadisticasGenerales?.accidentesMortales || estadisticas.accidentesMortales)}
          subtitle={estadisticasGenerales ? 'total global' : 'en pagina actual'}
          icon={Skull}
        />
        <StatCard
          title={estadisticasGenerales?.promedioGravedad != null ? 'Promedio Gravedad' : 'Con Alcohol'}
          value={estadisticasGenerales?.promedioGravedad != null
            ? formatNumber(estadisticasGenerales.promedioGravedad, 2)
            : estadisticas.conAlcohol}
          subtitle={estadisticasGenerales?.promedioGravedad != null ? 'escala de severidad' : 'en pagina actual'}
          icon={estadisticasGenerales?.promedioGravedad != null ? AlertTriangle : Wine}
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
                options={opcionesDistrito}
                placeholder="Todos los distritos"
              />
            </div>
            <div className="flex-1">
              <label className="text-sm text-slate-400 mb-1 block">Tipo de Accidente</label>
              <Select
                value={filtros.tipoAccidente}
                onChange={(e) => manejarCambioFiltro('tipoAccidente', e.target.value)}
                options={opcionesTipoAccidente}
                placeholder="Todos los tipos"
              />
            </div>
            <div className="flex-1">
              <label className="text-sm text-slate-400 mb-1 block">Gravedad</label>
              <Select
                value={filtros.gravedad}
                onChange={(e) => manejarCambioFiltro('gravedad', e.target.value)}
                options={opcionesGravedad}
                placeholder="Todas las gravedades"
              />
            </div>
            <div className="flex-1">
              <label className="text-sm text-slate-400 mb-1 block">Mes</label>
              <Select
                value={filtros.mes}
                onChange={(e) => manejarCambioFiltro('mes', e.target.value)}
                options={opcionesMes}
                placeholder="Todos los meses"
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
      {!cargando && datos.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {datosGrafico.length > 0 && (
            <BarChartCard
              title="Top 10 Distritos por Accidentes"
              data={datosGrafico}
              xKey="distrito"
              bars={[{ key: 'totalAccidentes', name: 'Total accidentes', color: '#ef4444' }]}
              height={280}
            />
          )}
          {datosGraficoPastel.length > 0 && (
            <PieChartCard
              title="Distribucion por Tipo de Accidente"
              data={datosGraficoPastel}
              height={280}
            />
          )}
        </div>
      )}

      {/* Zonas de mayor accidentalidad (datos del mapa de calor) */}
      {zonasAccidentalidad.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MapPin className="h-5 w-5" />
              Zonas de Mayor Accidentalidad
            </CardTitle>
            <CardDescription>
              Top 10 zonas con mayor concentracion de accidentes (agrupadas por coordenadas)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Zona (coordenadas)</TableHead>
                  <TableHead>Total Accidentes</TableHead>
                  <TableHead>Graves</TableHead>
                  <TableHead>Gravedad Media</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {zonasAccidentalidad.map((zona, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-mono text-sm">
                      ({formatNumber(zona.coordenadas?.x, 0)}, {formatNumber(zona.coordenadas?.y, 0)})
                    </TableCell>
                    <TableCell>
                      <Badge variant={zona.totalAccidentes >= 10 ? 'destructive' : zona.totalAccidentes >= 5 ? 'warning' : 'secondary'}>
                        {zona.totalAccidentes}
                      </Badge>
                    </TableCell>
                    <TableCell>{zona.accidentesGraves || 0}</TableCell>
                    <TableCell>{zona.puntuacionGravedadPromedio ? zona.puntuacionGravedadPromedio.toFixed(1) : '-'}</TableCell>
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
          <CardTitle>Registro de Accidentes</CardTitle>
          <CardDescription>
            Personas afectadas en accidentes de trafico
          </CardDescription>
        </CardHeader>
        <CardContent>
          {cargando ? (
            <LoadingState message="Cargando accidentes..." />
          ) : error ? (
            <ErrorState
              message={error}
              onRetry={cargarDatos}
            />
          ) : datos.length === 0 ? (
            <EmptyState
              title="Sin accidentes"
              description="No se encontraron accidentes con los filtros seleccionados."
              icon={AlertTriangle}
            />
          ) : (
            <>
              <Table>
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
                  {datos.map((record) => {
                    const alcohol = obtenerBadgeAlcohol(record.personaAfectada?.positivaAlcohol);

                    return (
                      <TableRow key={record._id}>
                        <TableCell className="font-medium font-mono text-xs">
                          {record.numeroExpediente ? (
                            <button
                              onClick={() => manejarClickExpediente(record.numeroExpediente)}
                              className="text-cyan-400 hover:text-cyan-300 underline cursor-pointer transition-colors"
                              title="Ver detalle del expediente"
                            >
                              {record.numeroExpediente}
                            </button>
                          ) : '-'}
                        </TableCell>
                        <TableCell>
                          {formatDate(record.fecha)}
                        </TableCell>
                        <TableCell className="text-slate-400">
                          {record.hora || '-'}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{record.ubicacion?.calle || '-'}</p>
                            {record.ubicacion?.numero && (
                              <p className="text-xs text-slate-500">N. {record.ubicacion.numero}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-300">
                          {record.ubicacion?.nombreDistrito || '-'}
                        </TableCell>
                        <TableCell className="text-slate-400 text-sm">
                          {record.circunstancias?.tipoAccidente || '-'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={obtenerVarianteBadgeGravedad(record.circunstancias?.gravedad)}>
                            {record.circunstancias?.gravedad || '-'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-400 text-sm">
                          {record.vehiculo?.tipo || '-'}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm">{record.personaAfectada?.tipoPersona || '-'}</p>
                            <p className="text-xs text-slate-500">{record.personaAfectada?.sexo || ''} {record.personaAfectada?.rangoEdad || ''}</p>
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

              {/* Paginacion */}
              <Pagination
                currentPage={paginacion.paginaActual}
                totalPages={paginacion.totalPaginas}
                totalItems={paginacion.totalElementos}
                itemsPerPage={paginacion.elementosPorPagina}
                onPageChange={manejarCambioPagina}
              />
            </>
          )}
        </CardContent>
      </Card>
      {/* Detalle de expediente seleccionado */}
      {cargandoExpediente && (
        <Card className="mt-6">
          <CardContent className="py-6">
            <LoadingState message="Cargando detalle del expediente..." />
          </CardContent>
        </Card>
      )}

      {expedienteSeleccionado && !cargandoExpediente && (
        <Card className="mt-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5" />
                Expediente: {expedienteSeleccionado.numeroExpediente}
              </CardTitle>
              <Button variant="ghost" onClick={() => setExpedienteSeleccionado(null)}>
                <X className="h-4 w-4" />
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
                <p className="text-sm text-slate-400">Fecha</p>
                <p className="font-medium">{formatDate(expedienteSeleccionado.fecha)}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Hora</p>
                <p className="font-medium">{expedienteSeleccionado.hora || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Ubicacion</p>
                <p className="font-medium flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {expedienteSeleccionado.ubicacion?.calle || '-'}
                  {expedienteSeleccionado.ubicacion?.numero ? `, N. ${expedienteSeleccionado.ubicacion.numero}` : ''}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Distrito</p>
                <p className="font-medium">{expedienteSeleccionado.ubicacion?.nombreDistrito || '-'}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              <div>
                <p className="text-sm text-slate-400">Tipo de Accidente</p>
                <p className="font-medium">{expedienteSeleccionado.circunstancias?.tipoAccidente || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Gravedad</p>
                <Badge variant={obtenerVarianteBadgeGravedad(expedienteSeleccionado.circunstancias?.gravedad)}>
                  {expedienteSeleccionado.circunstancias?.gravedad || '-'}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-slate-400">Vehiculo</p>
                <p className="font-medium">{expedienteSeleccionado.vehiculo?.tipo || '-'}</p>
              </div>
            </div>

            {/* Persona afectada */}
            {expedienteSeleccionado.personaAfectada && (
              <div>
                <h4 className="text-sm font-semibold text-slate-300 mb-3">Persona Afectada</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-800/50 rounded-lg p-4">
                  <div>
                    <p className="text-sm text-slate-400">Tipo</p>
                    <p className="font-medium">{expedienteSeleccionado.personaAfectada.tipoPersona || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Sexo</p>
                    <p className="font-medium">{expedienteSeleccionado.personaAfectada.sexo || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Rango de Edad</p>
                    <p className="font-medium">{expedienteSeleccionado.personaAfectada.rangoEdad || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Alcohol</p>
                    <Badge variant={obtenerBadgeAlcohol(expedienteSeleccionado.personaAfectada.positivaAlcohol).variant}>
                      {obtenerBadgeAlcohol(expedienteSeleccionado.personaAfectada.positivaAlcohol).label}
                    </Badge>
                  </div>
                </div>
              </div>
            )}

            {/* Personas afectadas (lista si viene como array) */}
            {expedienteSeleccionado.personasAfectadas?.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-slate-300 mb-3">
                  Personas Afectadas ({expedienteSeleccionado.personasAfectadas.length})
                </h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tipo Persona</TableHead>
                      <TableHead>Sexo</TableHead>
                      <TableHead>Rango Edad</TableHead>
                      <TableHead>Gravedad</TableHead>
                      <TableHead>Alcohol</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expedienteSeleccionado.personasAfectadas.map((persona, idx) => {
                      const alcoholPersona = obtenerBadgeAlcohol(persona.positivaAlcohol);
                      return (
                        <TableRow key={`persona-${idx}`}>
                          <TableCell>{persona.tipoPersona || '-'}</TableCell>
                          <TableCell>{persona.sexo || '-'}</TableCell>
                          <TableCell>{persona.rangoEdad || '-'}</TableCell>
                          <TableCell>
                            <Badge variant={obtenerVarianteBadgeGravedad(persona.gravedad)}>
                              {persona.gravedad || '-'}
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
      )}
    </PageLayout>
  );
}

export default PaginaAccidentes;
