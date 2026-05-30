/**
 * Pagina de Disponibilidad de Bicicletas
 *
 * Refactorizada en sub-componentes: Estadisticas, Filtros, Graficos,
 * ComparativaSuscripciones, DiasMayorMenorUso, Tabla.
 */

import { useState, useCallback, useMemo } from 'react';
import { RefreshCw } from 'lucide-react';
import { PageLayout } from '../../components/layout';
import { Button } from '../../components/common';
import {
  useBicicletas, useBicicletasEstadisticas, useBicicletasTendencias,
  useBicicletasMayorUso, useBicicletasSuscripciones
} from '../../api/hooks';
import { PAGINATION, DATE_CONFIG } from '../../constants';

import EstadisticasBicicletas from './EstadisticasBicicletas';
import FiltrosBicicletas from './FiltrosBicicletas';
import GraficosBicicletas from './GraficosBicicletas';
import ComparativaSuscripciones from './ComparativaSuscripciones';
import DiasMayorMenorUso from './DiasMayorMenorUso';
import TablaBicicletas from './TablaBicicletas';

const MESES_ABREVIATURAS = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
];

function PaginaBicicletas() {
  const [filtros, setFiltros] = useState({ mes: '' });
  const [paginacion, setPaginacion] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: PAGINATION.BIKES_DEFAULT_LIMIT
  });

  const queryParams = useMemo(() => {
    const params = {
      page: paginacion.currentPage,
      limit: paginacion.itemsPerPage,
      año: DATE_CONFIG.DATASET_YEAR
    };
    if (filtros.mes) params.mes = parseInt(filtros.mes);
    return params;
  }, [paginacion.currentPage, paginacion.itemsPerPage, filtros]);

  const statsParams = useMemo(() => {
    const params = { año: DATE_CONFIG.DATASET_YEAR };
    if (filtros.mes) params.mes = parseInt(filtros.mes);
    return params;
  }, [filtros]);

  const {
    data: availabilityResult,
    isLoading,
    error: mainError,
    refetch
  } = useBicicletas(queryParams);

  const { data: statsResult } = useBicicletasEstadisticas(statsParams);
  const { data: trendsResult } = useBicicletasTendencias({ year: DATE_CONFIG.DATASET_YEAR });
  // mayor-uso y comparativa-suscripciones aceptan filtro mes para reflejar
  // el periodo activo. Sin propagacion el panel mostraba siempre los mismos
  // numeros aunque se cambiase el selector de mes.
  const { data: mayorUsoResult } = useBicicletasMayorUso(statsParams);
  const { data: suscripcionesResult } = useBicicletasSuscripciones(statsParams);

  const datos = useMemo(() => availabilityResult?.data || [], [availabilityResult?.data]);
  // El endpoint /bicicletas/estadisticas envuelve los totales en
  // `data.estadisticas`; aceptamos tambien data plana por compatibilidad.
  const estadisticas = statsResult?.data?.estadisticas || statsResult?.data || null;
  // useBicicletasTendencias puede devolver `data` como objeto envoltorio o
  // como array plano segun la version del controller. Aceptamos ambos
  // shapes y nos quedamos con el primer array que aparezca para no romper
  // el .map() de mas abajo.
  const tendencias = useMemo(() => {
    const raw = trendsResult?.data;
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw?.tendencias)) return raw.tendencias;
    if (Array.isArray(raw?.data)) return raw.data;
    return [];
  }, [trendsResult?.data]);
  const datosMayorUso = mayorUsoResult?.data || null;
  const comparativaSuscripciones = suscripcionesResult?.data || null;
  const error = mainError?.message || null;

  const paginacionActual = useMemo(() => ({
    ...paginacion,
    totalPages: availabilityResult?.pagination?.totalPages || 1,
    totalItems: availabilityResult?.pagination?.totalDocuments
      || availabilityResult?.pagination?.totalItems
      || 0
  }), [paginacion, availabilityResult?.pagination]);

  const computedStats = useMemo(() => {
    // El endpoint usa nombres `promedioUsosDiarios` y
    // `promedioBicicletasDisponibles`. Aceptamos las variantes historicas
    // (promedioTotalUsos / promedioMediaBicicletas) por compatibilidad.
    const promedioUsosDiarios = estadisticas?.promedioUsosDiarios
      || estadisticas?.promedioTotalUsos
      || (datos.length > 0
        ? datos.reduce((sum, d) => sum + (d.totalUsos || 0), 0) / datos.length
        : 0);

    return {
      promedioUsosDiarios,
      mediaBicisDisponibles: estadisticas?.promedioBicicletasDisponibles
        || estadisticas?.promedioMediaBicicletas
        || 0,
      tasaOcupacion: estadisticas?.promedioTasaOcupacion || 0,
      totalRegistros: paginacionActual.totalItems
    };
  }, [estadisticas, datos, paginacionActual.totalItems]);

  const tendenciasGrafico = useMemo(() => {
    if (!tendencias || tendencias.length === 0) return [];
    return tendencias.map(item => {
      // El backend devuelve `mes` (no `_id`), `totalUsosAnual`,
      // `totalUsosOcasional` (no `usosAnual`/`usosOcasional`). Tolerar ambos
      // shapes por si el endpoint cambia.
      const numMes = item.mes ?? item._id;
      return {
        mes: MESES_ABREVIATURAS[numMes - 1] || item.nombreMes || `Mes ${numMes}`,
        totalUsos: item.totalUsos ?? 0,
        usosAnual: item.totalUsosAnual ?? item.usosAnual ?? 0,
        usosOcasional: item.totalUsosOcasional ?? item.usosOcasional ?? 0
      };
    });
  }, [tendencias]);

  const manejarCambioFiltro = useCallback((nombre, valor) => {
    setFiltros(prev => ({ ...prev, [nombre]: valor }));
    setPaginacion(prev => ({ ...prev, currentPage: 1 }));
  }, []);

  const limpiarFiltros = useCallback(() => {
    setFiltros({ mes: '' });
    setPaginacion(prev => ({ ...prev, currentPage: 1 }));
  }, []);

  const manejarCambioPagina = useCallback((page) => {
    setPaginacion(prev => ({ ...prev, currentPage: page }));
  }, []);

  const refrescar = useCallback(() => {
    refetch();
  }, [refetch]);

  return (
    <PageLayout
      eyebrow="Movilidad / Bicicletas"
      title="Flota ciclista en circulacion"
      description={`Disponibilidad diaria, suscripciones anuales frente a uso ocasional y tendencias mensuales del servicio en ${DATE_CONFIG.DATASET_YEAR}.`}
      actions={
        <Button variant="outline" onClick={refrescar}>
          <RefreshCw className="size-4 mr-2" aria-hidden="true" />
          Actualizar
        </Button>
      }
    >
      <EstadisticasBicicletas stats={computedStats} isLoading={!estadisticas} />

      <FiltrosBicicletas
        filtros={filtros}
        onCambioFiltro={manejarCambioFiltro}
        onLimpiar={limpiarFiltros}
      />

      {!isLoading && (
        <>
          <GraficosBicicletas datos={tendenciasGrafico} />
          <ComparativaSuscripciones comparativa={comparativaSuscripciones} />
          <DiasMayorMenorUso datos={datosMayorUso} />
        </>
      )}

      <TablaBicicletas
        datos={datos}
        paginacion={paginacionActual}
        isLoading={isLoading}
        error={error}
        onCambioPagina={manejarCambioPagina}
        onReintentar={refrescar}
      />
    </PageLayout>
  );
}

export default PaginaBicicletas;
