/**
 * Hub /correlaciones - indice de paginas de analisis entre areas.
 *
 * El cruce se presenta como un grafo de nodos (dominios) y aristas (cruces
 * disponibles), no como una rejilla de tarjetas identicas.
 */

import { Network } from 'lucide-react';
import { PageLayout } from '../../components/layout';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/common';
import MapaNodosCorrelaciones from './MapaNodosCorrelaciones';

function HubCorrelaciones() {
  return (
    <PageLayout
      title="Correlaciones"
      description="Cruces entre distintas áreas del dashboard para descubrir patrones que un solo apartado no revela."
    >
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Network className="size-5 text-dominio" aria-hidden="true" />
            Por qué correlaciones
          </CardTitle>
          <CardDescription>
            Los datos de la ciudad no son compartimentos estancos. Aquí se cruzan
            dos áreas para ver lo que ninguna muestra por separado: la cobertura
            de servicios frente a la población, la distancia entre normativa y
            siniestralidad, o cómo el tráfico modula la calidad del aire.
          </CardDescription>
        </CardHeader>
      </Card>

      <MapaNodosCorrelaciones />
    </PageLayout>
  );
}

export default HubCorrelaciones;
