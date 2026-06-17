/**
 * Bloque de graficos para Contenedores: distribucion por tipo (pie) y
 * volumen por distrito (bar). Subcomponente de PaginaContenedores.
 */

import { memo, useMemo } from 'react';
import { PieChartCard, BarChartCard } from '../../../components/charts';
import { Card, CardHeader, CardTitle, CardContent, EmptyState } from '../../../components/common';
import { CHART_COLORS } from '../../../constants';
import { etiquetaTipoContenedor, colorTipoContenedor } from '../helpers';

/**
 * Placeholder para un slot de grafico sin datos tras cargar.
 * Mantiene el marco (titulo + tarjeta) del grafico que sustituye.
 */
function PlaceholderGraficoVacio({ title }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <EmptyState
          title="Sin datos"
          description="No hay datos para mostrar con los filtros actuales."
          className="py-10"
        />
      </CardContent>
    </Card>
  );
}

const GraficosContenedores = memo(function GraficosContenedores({
  resumenPorTipo,
  estadisticasDistritos,
  tipoFiltro,
  isLoading
}) {
  // Datos del grafico de pastel (distribucion por tipo)
  const datosPie = useMemo(() => {
    if (!Array.isArray(resumenPorTipo)) {return [];}
    return resumenPorTipo.map(item => ({
      name: etiquetaTipoContenedor(item.tipo),
      value: item.total || 0,
      color: colorTipoContenedor(item.tipo)
    }));
  }, [resumenPorTipo]);

  // Datos del grafico de barras (top 10 distritos por volumen). Con un tipo
  // filtrado el ranking usa el conteo de ESE tipo (desde el desglose ya cargado
  // por distrito), de modo que la grafica reacciona al filtro de tipo sin una
  // query adicional ni colapsar a un solo distrito.
  const datosBar = useMemo(() => {
    if (!Array.isArray(estadisticasDistritos)) {return [];}
    return estadisticasDistritos
      .map(d => {
        const valor = tipoFiltro
          ? (Array.isArray(d.contenedoresPorTipo)
            ? (d.contenedoresPorTipo.find(t => t.tipo === tipoFiltro)?.total || 0)
            : 0)
          : (d.totalGeneral || 0);
        return { name: d.distrito, contenedores: valor };
      })
      .filter(d => d.contenedores > 0)
      .sort((a, b) => b.contenedores - a.contenedores)
      .slice(0, 10);
  }, [estadisticasDistritos, tipoFiltro]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      {!isLoading && datosPie.length === 0 ? (
        <PlaceholderGraficoVacio title="Distribución por tipo de residuo" />
      ) : (
        <PieChartCard
          title="Distribución por tipo de residuo"
          data={datosPie}
          donut
          height={320}
          isLoading={isLoading}
        />
      )}
      {!isLoading && datosBar.length === 0 ? (
        <PlaceholderGraficoVacio title="Top 10 distritos por volumen" />
      ) : (
        <BarChartCard
          title="Top 10 distritos por volumen"
          data={datosBar}
          xKey="name"
          bars={[
            { key: 'contenedores', name: 'Contenedores', color: CHART_COLORS.primary }
          ]}
          height={320}
          isLoading={isLoading}
        />
      )}
    </div>
  );
});

export { GraficosContenedores };
