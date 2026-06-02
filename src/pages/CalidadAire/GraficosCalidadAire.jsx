/**
 * Sub-componente GraficosCalidadAire
 *
 * Dos visualizaciones:
 *   1. Tendencia BarChart sobre los datos de la pagina actual.
 *   2. Card de "Tendencias por contaminante" con su propio selector y un
 *      LineChart cuyo dataset proviene del endpoint dedicado.
 *
 * Mantener los dos charts en el mismo sub-componente facilita la coherencia
 * narrativa (titulo + filtros + chart) sin obligar a la pagina principal a
 * orquestar dos paneles independientes.
 */

import { TrendingUp } from 'lucide-react';
import {
  Card, CardHeader, CardTitle, CardContent, CardDescription,
  Select, EmptyState, ChartSkeleton
} from '../../components/common';
import { BarChartCard, LineChartCard } from '../../components/charts';
import { AIR_QUALITY_MAGNITUDES, CHART_COLORS } from '../../constants';
import { opcionesMagnitud } from './opcionesFiltros';
import { obtenerUnidadMagnitud } from './helpers';

function GraficosCalidadAire({
  datosGraficoPagina,
  magnitudFiltro,
  magnitudTendencia,
  setMagnitudTendencia,
  datosTendencia,
  cargandoTendencias,
  isLoading,
  hayDatosPagina
}) {
  // Cada contaminante tiene su propia escala/unidad (CO en mg/m3, resto ug/m3).
  // La unidad se resuelve por magnitud para no rotular todo como ug/m3.
  const unidadPagina = obtenerUnidadMagnitud(parseInt(magnitudFiltro, 10));
  const unidadTendencia = obtenerUnidadMagnitud(parseInt(magnitudTendencia, 10));

  return (
    <>
      {/* El grafico de tendencia de la pagina solo se muestra cuando hay un
          contaminante seleccionado: sin filtro, la pagina mezcla magnitudes
          (NO2, O3, PM10, CO...) con escalas y unidades distintas, y promediarlas
          en un mismo eje no tiene sentido. Para la vista por contaminante sin
          filtrar la tabla esta el panel "Tendencias por contaminante" de abajo. */}
      {!isLoading && hayDatosPagina && magnitudFiltro && (
        <div className="mb-6">
          <BarChartCard
            title={`Tendencia - ${AIR_QUALITY_MAGNITUDES[magnitudFiltro] || 'Contaminante'}`}
            data={datosGraficoPagina}
            xKey="fecha"
            bars={[{ key: 'promedio', name: `Promedio diario (${unidadPagina})`, color: CHART_COLORS.primary }]}
            height={250}
          />
        </div>
      )}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="size-5" aria-hidden="true" />
            Tendencias por contaminante
          </CardTitle>
          <CardDescription>
            Seleccione un contaminante para visualizar su evolucion temporal.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 max-w-sm">
            <label className="text-sm text-muted-foreground mb-1 block">Contaminante para tendencia</label>
            <Select
              value={magnitudTendencia}
              onChange={(e) => setMagnitudTendencia(e.target.value)}
              options={opcionesMagnitud}
              placeholder="Seleccionar contaminante"
            />
          </div>

          {cargandoTendencias && <ChartSkeleton height={300} />}

          {!cargandoTendencias && magnitudTendencia && datosTendencia.length > 0 && (
            <LineChartCard
              title={`Evolucion - ${AIR_QUALITY_MAGNITUDES[magnitudTendencia] || 'Contaminante'}`}
              data={datosTendencia}
              xKey="periodo"
              lines={[
                { key: 'promedio', name: `Promedio (${unidadTendencia})`, color: CHART_COLORS.primary },
                { key: 'maximo', name: `Maximo (${unidadTendencia})`, color: CHART_COLORS.danger },
                { key: 'minimo', name: `Minimo (${unidadTendencia})`, color: CHART_COLORS.secondary }
              ]}
              height={300}
            />
          )}

          {!cargandoTendencias && magnitudTendencia && datosTendencia.length === 0 && (
            <EmptyState
              title="Sin datos de tendencia"
              description="No se encontraron datos de tendencia para el contaminante seleccionado."
              icon={TrendingUp}
            />
          )}

          {!magnitudTendencia && (
            <p className="text-sm text-muted-foreground text-center py-8">
              Seleccione un contaminante para ver la tendencia
            </p>
          )}
        </CardContent>
      </Card>
    </>
  );
}

export default GraficosCalidadAire;
