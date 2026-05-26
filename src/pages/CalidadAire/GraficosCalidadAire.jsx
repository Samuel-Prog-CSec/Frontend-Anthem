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
  return (
    <>
      {!isLoading && hayDatosPagina && (
        <div className="mb-6">
          <BarChartCard
            title={`Tendencia - ${AIR_QUALITY_MAGNITUDES[magnitudFiltro] || 'Contaminante'}`}
            data={datosGraficoPagina}
            xKey="fecha"
            bars={[{ key: 'promedio', name: 'Promedio diario (ug/m3)', color: CHART_COLORS.primary }]}
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
                { key: 'promedio', name: 'Promedio (ug/m3)', color: CHART_COLORS.primary },
                { key: 'maximo', name: 'Maximo (ug/m3)', color: CHART_COLORS.danger },
                { key: 'minimo', name: 'Minimo (ug/m3)', color: CHART_COLORS.secondary }
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
