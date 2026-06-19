/**
 * Sub-componente GraficosMultas
 *
 * Dos BarChartCard: distribucion por calificacion y top 10 ubicaciones
 * con mas multas. Si alguno de los datasets esta vacio, se renderiza
 * solo el que tenga datos.
 */

import { BarChartCard } from '../../components/charts';
import { CHART_COLORS } from '../../constants';

// Configuraciones de barras estables a nivel de modulo: solo dependen de
// CHART_COLORS (constante), nunca de props/estado. Definirlas fuera del
// componente garantiza una referencia estable entre renders para que el
// React.memo de BarChartCard pueda evitar re-renders innecesarios.
const BARRAS_CALIFICACION = [{ key: 'total', name: 'Total multas', color: CHART_COLORS.primary }];
const BARRAS_RANKING = [{ key: 'total', name: 'Total multas', color: CHART_COLORS.quaternary }];

function GraficosMultas({ datosGraficoCalificacion, datosGraficoRanking }) {
  const tieneAlgo = datosGraficoCalificacion.length > 0 || datosGraficoRanking.length > 0;
  if (!tieneAlgo) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      {datosGraficoCalificacion.length > 0 && (
        <BarChartCard
          title="Distribución por calificación"
          data={datosGraficoCalificacion}
          xKey="nombre"
          bars={BARRAS_CALIFICACION}
        />
      )}
      {datosGraficoRanking.length > 0 && (
        <BarChartCard
          title="Top 10 ubicaciones con más multas"
          data={datosGraficoRanking}
          xKey="nombre"
          bars={BARRAS_RANKING}
        />
      )}
    </div>
  );
}

export default GraficosMultas;
