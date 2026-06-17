/**
 * Sub-componente EstadisticasCalidadAire
 *
 * Fila de 4 StatCards con totales y promedios de la calidad del aire.
 * Resuelve internamente la dualidad "estadisticas globales de la API
 * vs. estadisticas calculadas sobre la pagina actual" para no contaminar
 * la pagina principal con esa logica.
 */

import { Activity, Wind, TrendingUp, TrendingDown } from 'lucide-react';
import { StatCard } from '../../components/charts';
import { formatNumber } from '../../utils';
import { obtenerUnidadMagnitud } from './helpers';

function EstadisticasCalidadAire({
  estadisticasApi,
  estadisticasLocales,
  totalDocumentos,
  cargandoStats,
  serieTendenciaPromedio,
  magnitudFiltro
}) {
  const hasApi = !!estadisticasApi;
  // Cada contaminante tiene su unidad (CO en mg/m3, resto ug/m3). Solo se rotula
  // la unidad cuando hay un contaminante filtrado; sin filtro los KPIs mezclan
  // magnitudes con escalas distintas y una unica unidad seria incorrecta.
  const unidad = magnitudFiltro ? obtenerUnidadMagnitud(parseInt(magnitudFiltro, 10)) : '';
  const sufijoUnidad = unidad ? ` ${unidad}` : '';

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {/*
        `estadisticasApi.totalRegistros` solo cuenta el subconjunto del
        agregado (un (fecha, magnitud) concreto). Para el KPI principal el
        valor honesto es el total de documentos del listado, que viene de
        la paginacion del propio endpoint /calidad-aire. Asi evitamos
        mostrar "10.850" cuando hay 55.265 mediciones en el dataset.
      */}
      <StatCard
        title="Total mediciones"
        value={totalDocumentos != null
          ? formatNumber(totalDocumentos)
          : (hasApi ? formatNumber(estadisticasApi.totalRegistros) : '-')}
        subtitle={cargandoStats ? 'Cargando...' : undefined}
        icon={Activity}
        accent="dominio"
      />
      <StatCard
        title="Promedio general"
        value={hasApi
          ? `${formatNumber(estadisticasApi.promedio, 1)}${sufijoUnidad}`
          : `${formatNumber(estadisticasLocales.avg, 1)}${sufijoUnidad}`}
        subtitle={hasApi ? 'todas las estaciones' : 'en página actual'}
        icon={Wind}
        accent="dominio"
        serie={serieTendenciaPromedio}
      />
      <StatCard
        title="Valor máximo"
        value={hasApi
          ? `${formatNumber(estadisticasApi.maximo, 1)}${sufijoUnidad}`
          : `${formatNumber(estadisticasLocales.max, 1)}${sufijoUnidad}`}
        subtitle={hasApi ? 'registrado' : 'en página actual'}
        icon={TrendingUp}
        accent="dominio"
      />
      <StatCard
        title="Valor mínimo"
        value={hasApi
          ? `${formatNumber(estadisticasApi.minimo, 1)}${sufijoUnidad}`
          : `${formatNumber(estadisticasLocales.min, 1)}${sufijoUnidad}`}
        subtitle={hasApi ? 'registrado' : 'en página actual'}
        icon={TrendingDown}
        accent="dominio"
      />
    </div>
  );
}

export default EstadisticasCalidadAire;
