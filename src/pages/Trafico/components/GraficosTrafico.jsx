/**
 * Bloque de graficos del modulo Trafico:
 *   - Congestion por distrito (bar)
 *   - Distribucion horaria de la intensidad (bar/line)
 *
 * Subcomponente de PaginaTrafico.
 */

import { memo, useMemo } from 'react';
import { BarChartCard } from '../../../components/charts';
import { Card, CardHeader, CardTitle, CardContent, EmptyState } from '../../../components/common';
import { CHART_COLORS, nombreDistrito } from '../../../constants';

/**
 * Placeholder para un slot de grafico sin datos tras cargar.
 * Mantiene el marco (titulo + tarjeta) del grafico que sustituye y evita
 * el skeleton infinito cuando la carga ha terminado sin resultados.
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

const GraficosTrafico = memo(function GraficosTrafico({
  analisisCongestion,
  distribucionHoraria,
  isLoading
}) {
  const datosCongestion = useMemo(() => {
    if (!Array.isArray(analisisCongestion)) {return [];}
    return [...analisisCongestion]
      .filter(d => d.zona)
      .sort((a, b) => (b.porcentajeCongestion || 0) - (a.porcentajeCongestion || 0))
      .slice(0, 12)
      .map(d => ({
        // `zona` es el codigo numerico de distrito (1-21): mapear a nombre.
        name: nombreDistrito(d.zona),
        congestion: d.porcentajeCongestion || 0,
        fluido: d.porcentajeFluido || 0
      }));
  }, [analisisCongestion]);

  const datosHorarios = useMemo(() => {
    if (!Array.isArray(distribucionHoraria)) {return [];}
    // Solo `intensidad` se pinta en el BarChart de abajo; antes se mapeaba
    // tambien `congestion: d.nivelCongestion` que nunca se renderizaba.
    return distribucionHoraria.map(d => ({
      name: d.periodo || '-',
      intensidad: d.intensidadPromedio || 0
    }));
  }, [distribucionHoraria]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      {!isLoading && datosCongestion.length === 0 ? (
        <PlaceholderGraficoVacio title="Top 12 zonas por congestión (%)" />
      ) : (
        <BarChartCard
          title="Top 12 zonas por congestión (%)"
          data={datosCongestion}
          xKey="name"
          bars={[
            { key: 'congestion', name: 'Congestión', color: CHART_COLORS.danger },
            { key: 'fluido', name: 'Fluido', color: CHART_COLORS.secondary }
          ]}
          height={320}
          isLoading={isLoading}
        />
      )}
      {!isLoading && datosHorarios.length === 0 ? (
        <PlaceholderGraficoVacio title="Intensidad por periodo del día" />
      ) : (
        <BarChartCard
          title="Intensidad por periodo del día"
          data={datosHorarios}
          xKey="name"
          bars={[
            { key: 'intensidad', name: 'Intensidad media', color: CHART_COLORS.primary }
          ]}
          height={320}
          isLoading={isLoading}
        />
      )}
    </div>
  );
});

export { GraficosTrafico };
