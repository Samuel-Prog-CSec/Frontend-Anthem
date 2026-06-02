/**
 * Vista por distrito - Pagina cross-domain
 *
 * Compone datos de varios dominios (censo + accidentes + patinetes + multas)
 * filtrados por el distrito que llega como parametro de URL `:codigo`.
 *
 * Flujo:
 *   1. Lee `:codigo` de la URL.
 *   2. Resuelve distrito via `useDistritoPorCodigo` (usa el endpoint
 *      `/censo/distritos/resumen` cacheado en React Query).
 *   3. Si el codigo es invalido o no existe el distrito, renderiza un 404
 *      amigable con link a Censo.
 *   4. Una vez tenemos `nombreDistrito`, dispara en paralelo los hooks de
 *      cada dominio con ese filtro. React Query deduplica/cachea por su cuenta.
 *
 * Performance:
 *   - 4 queries en paralelo, todas con caches multi-nivel (frontend + backend).
 *   - Cada subcomponente esta memoizado y solo recibe primitives o referencias
 *     estables, asi un loading parcial no re-renderiza los demas.
 */

import { useMemo, useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { PageLayout } from '../../components/layout';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, EnlacesCruzados } from '../../components/common';
import { useFiltroGeo } from '../../context';
import {
  useDistritoPorCodigo,
  useCensoResumenDistritos,
  useAccidentes,
  useAccidentesComparativa,
  usePatinetes
} from '../../api/hooks';
import { ROUTES, DATE_CONFIG } from '../../constants';
import {
  HeroDistrito,
  TarjetasResumenDistrito,
  GraficoComparativaDistrito,
  TablaAccidentesRecientes,
  MapaMultasDistrito,
  ResumenServiciosDistrito
} from './components';
// Centroides estaticos (los 21 distritos de Madrid). Usado para centrar el
// mini-mapa de multas. Importamos desde el frontend para evitar otra request.
const CENTROIDES_DISTRITOS = {
  1: [-3.7033, 40.4168], 2: [-3.7014, 40.4009], 3: [-3.6820, 40.4094],
  4: [-3.6775, 40.4310], 5: [-3.6773, 40.4595], 6: [-3.6999, 40.4618],
  7: [-3.6993, 40.4336], 8: [-3.7100, 40.5065], 9: [-3.7330, 40.4352],
  10: [-3.7500, 40.4020], 11: [-3.7363, 40.3843], 12: [-3.7094, 40.3811],
  13: [-3.6632, 40.3843], 14: [-3.6450, 40.4080], 15: [-3.6500, 40.4500],
  16: [-3.6400, 40.4820], 17: [-3.7100, 40.3470], 18: [-3.6350, 40.3800],
  19: [-3.6100, 40.4050], 20: [-3.6200, 40.4370], 21: [-3.5900, 40.4770]
};

function PaginaDistrito() {
  const { codigo } = useParams();
  const { aplicarDistrito } = useFiltroGeo();

  // El conteo de multas se calcula dentro de MapaMultasDistrito (segun el bbox);
  // lo recibimos por callback para alimentar la tarjeta KPI "Multas en zona".
  const [multasEstado, setMultasEstado] = useState({ total: 0, isLoading: true });
  const manejarEstadoMultas = useCallback((estado) => setMultasEstado(estado), []);

  // Hook helper que resuelve codigo a {codigo, nombre, totalPoblacion}
  const {
    distrito,
    isLoading: cargandoDistrito,
    esCodigoValido
  } = useDistritoPorCodigo(codigo);

  // Sincronizar el distrito de la URL con el filtro global. Cuando el
  // usuario salte a otro modulo via EnlacesCruzados, el filtro persiste.
  useEffect(() => {
    if (distrito?.nombre && Number.isFinite(distrito?.codigo)) {
      aplicarDistrito(distrito.nombre, distrito.codigo);
    }
  }, [distrito?.nombre, distrito?.codigo, aplicarDistrito]);

  // Para la grafica comparativa con todos los distritos
  const { data: resumenDistritos } = useCensoResumenDistritos({
    año: DATE_CONFIG.DATASET_YEAR
  });
  const todosLosDistritos = useMemo(
    () => resumenDistritos?.data?.data || resumenDistritos?.data || [],
    [resumenDistritos]
  );

  const nombreDistrito = distrito?.nombre;
  const codigoNumerico = distrito?.codigo;

  // Top 10 accidentes mas recientes del distrito.
  // El hook acepta `distrito` por nombre segun la validacion del backend.
  const {
    data: accidentesResult,
    isLoading: cargandoAccidentes,
    error: errorAccidentes,
    refetch: refetchAccidentes
  } = useAccidentes(
    nombreDistrito
      ? { distrito: nombreDistrito, limit: 10, sortBy: 'fecha', sortOrder: 'desc' }
      : null
  );
  const accidentesRecientes = accidentesResult?.data || [];
  const totalAccidentesPag = accidentesResult?.pagination?.totalDocuments || 0;

  // Comparativa por distritos para extraer total acumulado del distrito actual.
  //
  // El backend devuelve `{ success, data: { comparativa: [...] } }`. El hook
  // pasa `response.data` (objeto), por lo que necesitamos descender un nivel
  // mas y tolerar tambien el caso de que algun importador antiguo devuelva
  // un array plano directamente. Sin este guard `.find()` revienta y
  // ErrorBoundary tira toda la pagina /distritos/:codigo.
  const { data: comparativaResult } = useAccidentesComparativa();
  const datosComparativa = useMemo(() => {
    const raw = comparativaResult?.data;
    if (Array.isArray(raw)) {return raw;}
    if (Array.isArray(raw?.comparativa)) {return raw.comparativa;}
    return [];
  }, [comparativaResult?.data]);
  const accidentesEnDistrito = useMemo(() => {
    if (!nombreDistrito) return 0;
    const upper = nombreDistrito.toUpperCase();
    const entry = datosComparativa.find(d =>
      (d._id || d.distrito || '').toUpperCase() === upper
    );
    return entry?.totalAccidentes || entry?.total || totalAccidentesPag || 0;
  }, [datosComparativa, nombreDistrito, totalAccidentesPag]);

  // Patinetes asignados en el distrito (suma por barrio)
  const {
    data: patinetesResult,
    isLoading: cargandoPatinetes
  } = usePatinetes(
    nombreDistrito
      ? { distrito: nombreDistrito, limit: 50 }
      : null
  );
  const totalPatinetes = useMemo(() => {
    const datos = patinetesResult?.data || [];
    return datos.reduce(
      (acc, item) => acc + (item.estadisticas?.totalPatinetes || 0),
      0
    );
  }, [patinetesResult?.data]);

  // ----- Estados especiales -----

  // Codigo invalido (fuera de 1-21) o distrito no encontrado
  if (!cargandoDistrito && (!esCodigoValido || (!distrito && todosLosDistritos.length > 0))) {
    return (
      <PageLayout title="Distrito no encontrado">
        <Card>
          <CardHeader>
            <CardTitle>Distrito no encontrado</CardTitle>
            <CardDescription>
              El codigo &quot;{codigo}&quot; no corresponde a ningun distrito de Madrid (1-21).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <Link to={ROUTES.CENSO}>
                Volver al Censo
                <ArrowRight className="size-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </PageLayout>
    );
  }

  const centroide = codigoNumerico ? CENTROIDES_DISTRITOS[codigoNumerico] : null;

  return (
    <PageLayout
      title={distrito ? `Distrito ${distrito.nombre}` : 'Distrito'}
      description="Vista cross-domain: censo, accidentalidad, patinetes y multas en una sola pagina"
    >
      <HeroDistrito distrito={distrito} isLoading={cargandoDistrito} />

      {nombreDistrito && Number.isFinite(codigoNumerico) && (
        <div className="mb-6">
          <EnlacesCruzados
            distrito={nombreDistrito}
            codigoDistrito={codigoNumerico}
            modulosExcluidos={['distrito', 'censo']}
            titulo="Explorar este distrito en otros modulos:"
          />
        </div>
      )}

      <TarjetasResumenDistrito
        totalPoblacion={distrito?.totalPoblacion}
        totalAccidentes={accidentesEnDistrito}
        totalPatinetes={totalPatinetes}
        totalMultasEnZona={multasEstado.total}
        cargandoAccidentes={cargandoAccidentes}
        cargandoPatinetes={cargandoPatinetes}
        cargandoMultas={multasEstado.isLoading}
      />

      <GraficoComparativaDistrito
        distritos={todosLosDistritos}
        codigoActual={codigoNumerico}
      />

      <TablaAccidentesRecientes
        accidentes={accidentesRecientes}
        isLoading={cargandoAccidentes}
        error={errorAccidentes}
        onRetry={refetchAccidentes}
        nombreDistrito={nombreDistrito}
      />

      {codigoNumerico && (
        <MapaMultasDistrito
          codigo={codigoNumerico}
          nombreDistrito={nombreDistrito}
          centroide={centroide}
          onEstadoCambio={manejarEstadoMultas}
        />
      )}

      {nombreDistrito && (
        <ResumenServiciosDistrito
          nombreDistrito={nombreDistrito}
          totalPoblacion={distrito?.totalPoblacion}
        />
      )}
    </PageLayout>
  );
}

export default PaginaDistrito;
