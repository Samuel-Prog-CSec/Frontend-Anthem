/**
 * Sub-componente EstadisticasCalidadAire
 *
 * Fila de 4 StatCards con totales y promedios de la calidad del aire.
 * Resuelve internamente la dualidad "estadisticas globales de la API
 * vs. estadisticas calculadas sobre la pagina actual" para no contaminar
 * la pagina principal con esa logica.
 */

import { Activity, Wind, TrendingUp, BarChart3, AlertTriangle } from 'lucide-react';
import { StatCard } from '../../components/charts';
import { formatNumber } from '../../utils';

function EstadisticasCalidadAire({
  estadisticasApi,
  estadisticasLocales,
  totalDocumentos,
  cargandoStats
}) {
  const hasApi = !!estadisticasApi;

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
        accent="cyan"
      />
      <StatCard
        title="Promedio general"
        value={hasApi
          ? `${formatNumber(estadisticasApi.promedio, 1)} μg/m³`
          : `${formatNumber(estadisticasLocales.avg, 1)} μg/m³`}
        subtitle={hasApi ? 'todas las estaciones' : 'en pagina actual'}
        icon={Wind}
        accent="emerald"
      />
      <StatCard
        title="Valor maximo"
        value={hasApi
          ? `${formatNumber(estadisticasApi.maximo, 1)} μg/m³`
          : `${formatNumber(estadisticasLocales.max, 1)} μg/m³`}
        subtitle={hasApi ? 'registrado' : 'en pagina actual'}
        icon={TrendingUp}
        accent="amber"
      />
      <StatCard
        title={estadisticasApi?.diasConExcedencias != null ? 'Dias con excedencias' : 'Datos validos'}
        value={estadisticasApi?.diasConExcedencias != null
          ? formatNumber(estadisticasApi.diasConExcedencias)
          : (estadisticasApi?.medicionesValidas
            ? formatNumber(estadisticasApi.medicionesValidas)
            : estadisticasLocales.valid)}
        subtitle={estadisticasApi?.diasConExcedencias != null ? 'sobre limite' : 'en pagina actual'}
        icon={estadisticasApi?.diasConExcedencias != null ? AlertTriangle : BarChart3}
        accent={estadisticasApi?.diasConExcedencias != null ? 'rose' : 'violet'}
      />
    </div>
  );
}

export default EstadisticasCalidadAire;
