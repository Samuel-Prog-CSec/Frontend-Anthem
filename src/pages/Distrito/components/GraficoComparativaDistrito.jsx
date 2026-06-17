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
import { formatearNombreDistritoTitulo } from '../../../utils';

// Resueltos desde tokens: signal (estado activo = distrito actual) y gris (--ink-muted).
const COLOR_DESTACADO = '#d4ed3a';
const COLOR_BASE = '#5a5e64';

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
      .map(d => {
        const esActual = Number(d.codigo) === codActual;
        return {
          nombre: formatearNombreDistritoTitulo(d.nombre),
          poblacion: d.totalPoblacion || 0,
          esActual,
          // Color por dato consumido por BarChartCard (colorByDatum)
          barColor: esActual ? COLOR_DESTACADO : COLOR_BASE
        };
      });
  }, [distritos, codigoActual]);

  if (datos.length === 0) {
    return null;
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <BarChart3 className="size-5" />
          Comparativa de población - Distritos más habitados
        </CardTitle>
        <CardDescription>
          El distrito actual se resalta; el resto en gris para referencia.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <BarChartCard
          data={datos}
          xKey="nombre"
          bars={[
            {
              key: 'poblacion',
              name: 'Población',
              color: COLOR_BASE,
              // Colorea solo la barra del distrito actual (resto en gris)
              colorByDatum: true
            }
          ]}
          height={320}
        />
      </CardContent>
    </Card>
  );
});

export { GraficoComparativaDistrito };
