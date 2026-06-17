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
import { LineChartCard } from '../../components/charts';
import { AIR_QUALITY_MAGNITUDES, CHART_COLORS } from '../../constants';
import { opcionesMagnitud } from './opcionesFiltros';
import { obtenerUnidadMagnitud } from './helpers';

function GraficosCalidadAire({
  magnitudTendencia,
  setMagnitudTendencia,
  datosTendencia,
  cargandoTendencias
}) {
  // Cada contaminante tiene su unidad (CO en mg/m3, resto ug/m3); se resuelve
  // por magnitud para no rotular todo como ug/m3. Se eliminó el BarChart
  // "Tendencia" que se calculaba sobre el slice de la pagina paginada (no era
  // una tendencia real); la evolucion correcta es el LineChart de abajo, que
  // proviene del endpoint agregado /calidad-aire/tendencias.
  const unidadTendencia = obtenerUnidadMagnitud(parseInt(magnitudTendencia, 10));

  return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="size-5" aria-hidden="true" />
            Tendencias por contaminante
          </CardTitle>
          <CardDescription>
            Seleccione un contaminante para visualizar su evolución temporal.
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
              title={`Evolución - ${AIR_QUALITY_MAGNITUDES[magnitudTendencia] || 'Contaminante'}`}
              data={datosTendencia}
              xKey="periodo"
              lines={[
                { key: 'promedio', name: `Promedio (${unidadTendencia})`, color: CHART_COLORS.primary },
                { key: 'maximo', name: `Máximo (${unidadTendencia})`, color: CHART_COLORS.danger },
                { key: 'minimo', name: `Mínimo (${unidadTendencia})`, color: CHART_COLORS.secondary }
              ]}
              height={300}
            />
          )}

          {!cargandoTendencias && magnitudTendencia && datosTendencia.length === 0 && (
            <EmptyState
              title="Sin resultados para estos filtros"
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
  );
}

export default GraficosCalidadAire;
