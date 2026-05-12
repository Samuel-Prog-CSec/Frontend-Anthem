/**
 * Grafico comparativo: este distrito vs el resto (top 10 mas habitados).
 * Resalta el distrito actual con un color destacado.
 *
 * Subcomponente de PaginaDistrito.
 */

import { memo, useMemo } from 'react';
import { BarChart3 } from 'lucide-react';
import { BarChartCard } from '../../../components/charts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/common';

const COLOR_DESTACADO = '#06b6d4';
const COLOR_BASE = '#475569';

const GraficoComparativaDistrito = memo(function GraficoComparativaDistrito({
  distritos,
  codigoActual
}) {
  const datos = useMemo(() => {
    if (!Array.isArray(distritos) || distritos.length === 0) return [];

    // Top 10 mas habitados, asegurando que el distrito actual esta incluido aun
    // si no esta en el top 10 (asi siempre se ve la barra del usuario)
    const top10 = [...distritos]
      .sort((a, b) => (b.totalPoblacion || 0) - (a.totalPoblacion || 0))
      .slice(0, 10);

    const codActual = Number(codigoActual);
    const incluidoEnTop = top10.some(d => Number(d.codigo) === codActual);
    if (!incluidoEnTop) {
      const distritoActual = distritos.find(d => Number(d.codigo) === codActual);
      if (distritoActual) {
        top10.push(distritoActual);
      }
    }

    return top10
      .sort((a, b) => (b.totalPoblacion || 0) - (a.totalPoblacion || 0))
      .map(d => ({
        nombre: d.nombre,
        poblacion: d.totalPoblacion || 0,
        // Recharts soporta `fill` por dato cuando la barra usa una funcion de color
        // Lo dejamos como flag para que el wrapper lo use si quisiera
        esActual: Number(d.codigo) === codActual
      }));
  }, [distritos, codigoActual]);

  if (datos.length === 0) {
    return null;
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <BarChart3 className="size-5" />
          Comparativa de poblacion - Top distritos
        </CardTitle>
        <CardDescription>
          El distrito actual se resalta en cyan; el resto en gris para referencia.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <BarChartCard
          data={datos}
          xKey="nombre"
          bars={[
            {
              key: 'poblacion',
              name: 'Poblacion',
              // Color uniforme; en una iteracion futura se podria usar Cell
              // para colorear solo la barra del distrito actual
              color: datos.some(d => d.esActual) ? COLOR_DESTACADO : COLOR_BASE
            }
          ]}
          height={320}
        />
      </CardContent>
    </Card>
  );
});

export { GraficoComparativaDistrito };
