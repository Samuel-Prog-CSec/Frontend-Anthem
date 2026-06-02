/**
 * Hub /correlaciones - Indice de paginas de Business Intelligence cross-module.
 *
 * Cada card representa una correlacion no trivial entre dos o mas datasets
 * que el dashboard ofrece. Cada una abre una pagina dedicada con sus
 * visualizaciones especificas.
 */

import { Link } from 'react-router-dom';
import { Wind, TrafficCone, FileWarning, AlertTriangle, Users, Recycle, Volume2, ArrowRight, Sparkles } from 'lucide-react';
import { PageLayout } from '../../components/layout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/common';
import { ROUTES } from '../../constants';

const CORRELACIONES = [
  {
    titulo: 'Calidad del aire vs. Trafico',
    descripcion: 'Como influye la intensidad del trafico en los niveles de contaminantes (NO2, PM10) por distrito en un mismo periodo.',
    iconoA: Wind,
    iconoB: TrafficCone,
    ruta: ROUTES.CORRELACION_AIRE_TRAFICO
  },
  {
    titulo: 'Multas vs. Accidentes',
    descripcion: 'Comparativa por distrito: zonas con mas multas tienden a tener mas o menos accidentes? Identifica patrones de riesgo y prevencion.',
    iconoA: FileWarning,
    iconoB: AlertTriangle,
    ruta: ROUTES.CORRELACION_MULTAS_ACCIDENTES
  },
  {
    titulo: 'Censo vs. Contenedores',
    descripcion: 'Cobertura de contenedores por cada 1.000 habitantes. Detecta distritos infra o sobre-cubiertos respecto a su poblacion.',
    iconoA: Users,
    iconoB: Recycle,
    ruta: ROUTES.CORRELACION_CENSO_CONTENEDORES
  },
  {
    titulo: 'Ruido vs. Censo',
    descripcion: 'Estima la poblacion expuesta a niveles de ruido superiores a los limites diurnos por distrito.',
    iconoA: Volume2,
    iconoB: Users,
    ruta: ROUTES.CORRELACION_RUIDO_CENSO
  }
];

function HubCorrelaciones() {
  return (
    <PageLayout
      title="Analisis BI cross-module"
      description="Correlaciones entre distintos dominios del dashboard para descubrir patrones que un solo modulo no revela."
    >
      <Card className="mb-6 bg-card border-[var(--border-emphasis)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="size-5 text-muted-foreground" aria-hidden="true" />
            Por que correlaciones
          </CardTitle>
          <CardDescription>
            Los datos de la Smart City no son compartimentos estancos. Esta seccion expone relaciones que solo emergen al combinar dos fuentes: el ratio cobertura/poblacion, la distancia entre normativa (multas) y siniestralidad (accidentes), o como el trafico modula la calidad del aire. Cada pagina resume un cruce concreto.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {CORRELACIONES.map(corr => {
          const IconoA = corr.iconoA;
          const IconoB = corr.iconoB;
          return (
            <Link key={corr.ruta} to={corr.ruta} className="group">
              <Card hover className="h-full bg-card hover:border-[var(--border-emphasis)]">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="size-10 rounded-lg bg-card flex items-center justify-center border border-border">
                      <IconoA className="size-5 text-muted-foreground" aria-hidden="true" />
                    </div>
                    <span className="text-muted-foreground text-lg" aria-hidden="true">x</span>
                    <div className="size-10 rounded-lg bg-card flex items-center justify-center border border-border">
                      <IconoB className="size-5 text-muted-foreground" aria-hidden="true" />
                    </div>
                  </div>
                  <CardTitle className="text-lg group-hover:text-primary transition-colors">
                    {corr.titulo}
                  </CardTitle>
                  <CardDescription className="text-sm">
                    {corr.descripcion}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <span className="inline-flex items-center gap-1 text-sm text-primary font-medium">
                    Explorar correlacion
                    <ArrowRight className="size-4 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
                  </span>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </PageLayout>
  );
}

export default HubCorrelaciones;
