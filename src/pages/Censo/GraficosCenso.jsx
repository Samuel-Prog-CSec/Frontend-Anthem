/**
 * Sub-componente GraficosCenso
 *
 * BarChart con top 10 distritos por poblacion (espanoles vs extranjeros)
 * + piramide poblacional real (hombres / mujeres por grupo de edad).
 */

import { BarChartCard } from '../../components/charts';
import { CHART_COLORS } from '../../constants';
import PiramidePoblacional from './PiramidePoblacional';

function GraficosCenso({ datosGraficoDistritos, datosPiramide }) {
  const tieneAlgo = datosGraficoDistritos.length > 0 || datosPiramide.length > 0;
  if (!tieneAlgo) { return null; }

  return (
    <div className="grid grid-cols-1 gap-6 mb-6 lg:grid-cols-2">
      {datosGraficoDistritos.length > 0 && (
        <BarChartCard
          title="Población por distrito (Top 10)"
          data={datosGraficoDistritos}
          xKey="nombre"
          bars={[
            { key: 'espanoles', name: 'Españoles', color: CHART_COLORS.primary },
            { key: 'extranjeros', name: 'Extranjeros', color: CHART_COLORS.tertiary }
          ]}
        />
      )}
      {datosPiramide.length > 0 && (
        <PiramidePoblacional title="Pirámide poblacional" datos={datosPiramide} />
      )}
    </div>
  );
}

export default GraficosCenso;
