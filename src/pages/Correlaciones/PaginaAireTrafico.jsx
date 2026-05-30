/**
 * Correlacion Calidad del aire x Trafico
 *
 * Compara intensidad de trafico vs niveles de NO2 / PM10 por distrito en
 * un periodo dado. Cruza:
 *   - useAnalisisCongestion (groupBy=distrito)
 *   - useCalidadAireStats (con periodos)
 *
 * Hipotesis: zonas con mayor intensidad / mayor congestion tienden a tener
 * mayores valores de contaminantes asociados a vehiculos. Esta pagina
 * permite ver la correlacion a nivel agregado por distrito.
 */

import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Wind, TrafficCone, AlertCircle } from 'lucide-react';
import { PageLayout } from '../../components/layout';
import {
  Card, CardHeader, CardTitle, CardDescription, CardContent, Button,
  EmptyState, Skeleton
} from '../../components/common';
import { StatCard, BarChartCard } from '../../components/charts';
import {
  useAnalisisCongestion,
  useCalidadAireStats
} from '../../api/hooks';
import { ROUTES, TRAFICO_MAPA_MAX_DIAS } from '../../constants';
import { formatNumber } from '../../utils';
import { rangoFechasInicial, validarRangoMapa } from '../Trafico/helpers';

function PaginaAireTrafico() {
  const [borrador, setBorrador] = useState(rangoFechasInicial);
  const [aplicados, setAplicados] = useState(null);

  const validacion = useMemo(
    () => validarRangoMapa(borrador.startDate, borrador.endDate),
    [borrador.startDate, borrador.endDate]
  );

  const aplicar = () => {
    if (!validacion.valido) {return;}
    setAplicados({ ...borrador });
  };

  const queryParams = aplicados;
  const habilitado = Boolean(queryParams);

  const {
    data: congestionResult,
    isLoading: cargandoCongestion
  } = useAnalisisCongestion(
    queryParams ? { ...queryParams, groupBy: 'distrito' } : {},
    { enabled: habilitado }
  );

  const {
    data: aireResult,
    isLoading: cargandoAire
  } = useCalidadAireStats(queryParams || {});

  const congestion = useMemo(
    () => congestionResult?.data?.analisis || [],
    [congestionResult]
  );

  const aire = useMemo(
    () => aireResult?.data?.byMagnitude || aireResult?.data?.byMagnitud || aireResult?.data || [],
    [aireResult]
  );

  const cargando = cargandoCongestion || cargandoAire;

  // Datos del grafico: top distritos por congestion + media de NO2 (magnitud 8) si lo tenemos
  const no2Promedio = useMemo(() => {
    if (!Array.isArray(aire)) {return 0;}
    const no2 = aire.find(a => a._id === 8 || a.magnitud === 8);
    return no2?.promedio || no2?.average || no2?.avg || 0;
  }, [aire]);

  const datosGrafico = useMemo(() => {
    return [...congestion]
      .filter(c => c.zona)
      .sort((a, b) => (b.intensidadPromedio || 0) - (a.intensidadPromedio || 0))
      .slice(0, 12)
      .map(c => ({
        name: c.zona,
        intensidad: c.intensidadPromedio || 0,
        congestion: c.porcentajeCongestion || 0
      }));
  }, [congestion]);

  return (
    <PageLayout
      title="Calidad del aire vs. Trafico"
      description="Cruce por distrito entre intensidad/congestion del trafico y niveles de contaminacion en el mismo periodo."
      actions={
        <Button asChild variant="outline" size="sm">
          <Link to={ROUTES.CORRELACIONES}>
            <ArrowLeft className="size-4 mr-2" aria-hidden="true" />
            Volver a correlaciones
          </Link>
        </Button>
      }
    >
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Periodo de analisis</CardTitle>
          <CardDescription>
            Selecciona un rango (max {TRAFICO_MAPA_MAX_DIAS} dias) y aplica para cargar el cruce.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block" htmlFor="aire-start">
                Fecha inicio
              </label>
              <input
                id="aire-start"
                type="date"
                value={borrador.startDate}
                onChange={(e) => setBorrador(b => ({ ...b, startDate: e.target.value }))}
                min="2051-01-01"
                max="2051-12-31"
                className="flex h-10 w-full rounded-md border border-border bg-input/60 px-3 py-2 text-sm text-foreground"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block" htmlFor="aire-end">
                Fecha fin
              </label>
              <input
                id="aire-end"
                type="date"
                value={borrador.endDate}
                onChange={(e) => setBorrador(b => ({ ...b, endDate: e.target.value }))}
                min="2051-01-01"
                max="2051-12-31"
                className="flex h-10 w-full rounded-md border border-border bg-input/60 px-3 py-2 text-sm text-foreground"
              />
            </div>
            <div className="flex items-end">
              <Button
                variant="primary"
                onClick={aplicar}
                disabled={!validacion.valido}
                className="w-full"
              >
                Aplicar
              </Button>
            </div>
          </div>
          {!validacion.valido && (
            <div className="flex items-start gap-2 mt-3 text-sm text-destructive">
              <AlertCircle className="size-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
              <span>{validacion.error}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {!aplicados ? (
        <Card>
          <CardContent>
            <EmptyState
              title="Aplica un rango para empezar"
              description="Las queries de trafico (138M docs) y aire son pesadas; necesitan filtros."
              icon={Wind}
            />
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <StatCard
              title="Distritos analizados"
              value={formatNumber(congestion.length)}
              icon={TrafficCone}
              isLoading={cargando}
            />
            <StatCard
              title="NO2 promedio"
              value={formatNumber(no2Promedio, 1)}
              subtitle="μg/m³ en el periodo"
              icon={Wind}
              isLoading={cargando}
            />
            <StatCard
              title="Magnitudes con datos"
              value={formatNumber(Array.isArray(aire) ? aire.length : 0)}
              subtitle="contaminantes registrados"
              icon={Wind}
              isLoading={cargando}
            />
          </div>

          {cargando ? (
            <Skeleton className="h-96 w-full rounded-xl" />
          ) : datosGrafico.length === 0 ? (
            <Card>
              <CardContent>
                <EmptyState
                  title="Sin datos para el rango"
                  description="No hay datos de trafico para el periodo aplicado."
                  icon={TrafficCone}
                />
              </CardContent>
            </Card>
          ) : (
            <BarChartCard
              title="Top 12 distritos por intensidad de trafico (con % de congestion)"
              data={datosGrafico}
              xKey="name"
              bars={[
                { key: 'intensidad', name: 'Intensidad media (v/h)', color: '#06b6d4' },
                { key: 'congestion', name: '% Congestion', color: '#f59e0b' }
              ]}
              height={400}
            />
          )}

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Lectura del cruce</CardTitle>
              <CardDescription>
                Las dimensiones se muestran a nivel agregado de distrito por simplicidad. El siguiente paso (no incluido) seria correlacionar series temporales hora a hora entre estaciones de aire y puntos de trafico cercanos para detectar lag horario y dependencia espacial fina.
              </CardDescription>
            </CardHeader>
          </Card>
        </>
      )}
    </PageLayout>
  );
}

export default PaginaAireTrafico;
