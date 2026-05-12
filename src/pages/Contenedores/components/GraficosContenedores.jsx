/**
 * Bloque de graficos para Contenedores: distribucion por tipo (pie) y
 * volumen por distrito (bar). Subcomponente de PaginaContenedores.
 */

import { memo, useMemo } from 'react';
import { PieChartCard, BarChartCard } from '../../../components/charts';
import { etiquetaTipoContenedor, colorTipoContenedor } from '../helpers';

const GraficosContenedores = memo(function GraficosContenedores({
  resumenPorTipo,
  estadisticasDistritos,
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

  // Datos del grafico de barras (top 10 distritos por volumen total)
  const datosBar = useMemo(() => {
    if (!Array.isArray(estadisticasDistritos)) {return [];}
    return [...estadisticasDistritos]
      .sort((a, b) => (b.totalGeneral || 0) - (a.totalGeneral || 0))
      .slice(0, 10)
      .map(d => ({
        name: d.distrito,
        contenedores: d.totalGeneral || 0
      }));
  }, [estadisticasDistritos]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <PieChartCard
        title="Distribucion por tipo de residuo"
        data={datosPie}
        donut
        height={320}
        isLoading={isLoading}
      />
      <BarChartCard
        title="Top 10 distritos por volumen"
        data={datosBar}
        xKey="name"
        bars={[
          { key: 'contenedores', name: 'Contenedores', color: '#06b6d4' }
        ]}
        height={320}
        isLoading={isLoading}
      />
    </div>
  );
});

export { GraficosContenedores };
