/**
 * Pagina de Dashboard
 *
 * Vista principal del dashboard de Smart City. Refactor anti AI-slop:
 *
 *   - Header con eyebrow editorial (via PageLayout).
 *   - Hero data-first (BannerCabecera) en vez del banner "bienvenida + gradient".
 *   - Stats con grid 12 columnas que da pesos visuales asimetricos.
 *   - Modulos numerados (01-09) para anclar la idea de catalogo en lugar
 *     de "tiles" identicos.
 *
 * La logica sigue delegada en useEstadisticasDashboard (3 requests
 * paralelas con AbortController).
 */

import {
  MapPin, Wind, Volume2, Activity,
  AlertTriangle, Bike, Users, FileWarning, Zap,
  TrafficCone, Recycle, Footprints
} from 'lucide-react';
import { PageLayout } from '../../components/layout';
import { dominioDeRuta } from '../../components/layout/navegacion';
import { ROUTES, DATE_CONFIG } from '../../constants';
import { useEstadisticasDashboard } from './hooks/useEstadisticasDashboard';
import {
  TarjetaEstadisticaDashboard,
  TarjetaAccesoRapido,
  BannerCabecera,
  PanelAlertas,
  EstadoSistema
} from './components';

const MODULOS_ACCESO_RAPIDO = [
  { titulo: 'Tráfico', descripcion: 'Intensidad, ocupación y congestión por punto de medición', icono: TrafficCone, ruta: ROUTES.TRAFICO },
  { titulo: 'Ubicaciones', descripcion: 'Estaciones de medición, rutas de transporte y zonas de interés', icono: MapPin, ruta: ROUTES.UBICACIONES },
  { titulo: 'Calidad del aire', descripcion: 'Niveles de contaminantes (NO2, O3, PM10) y su tendencia', icono: Wind, ruta: ROUTES.CALIDAD_AIRE },
  { titulo: 'Ruido ambiental', descripcion: 'Niveles por zona y periodo: diurno, vespertino y nocturno', icono: Volume2, ruta: ROUTES.RUIDO },
  { titulo: 'Contenedores', descripcion: 'Ubicación por tipo de residuo, lote y cobertura por distrito', icono: Recycle, ruta: ROUTES.CONTENEDORES },
  { titulo: 'Accidentes', descripcion: 'Accidentalidad por distrito, tipo y gravedad', icono: AlertTriangle, ruta: ROUTES.ACCIDENTES },
  { titulo: 'Multas', descripcion: 'Infracciones, importes, calificaciones y ubicación', icono: FileWarning, ruta: ROUTES.MULTAS },
  { titulo: 'Patinetes', descripcion: 'Reparto por distrito, proveedor y densidad', icono: Zap, ruta: ROUTES.PATINETES },
  { titulo: 'Bicicletas', descripcion: 'Disponibilidad, usos diarios y suscripciones', icono: Bike, ruta: ROUTES.BICICLETAS },
  { titulo: 'Aforo de bicicletas', descripcion: 'Conteo horario de tráfico ciclista por estación', icono: Activity, ruta: ROUTES.AFORO_BICICLETAS },
  { titulo: 'Aforo de peatones', descripcion: 'Conteo horario de tránsito peatonal por estación', icono: Footprints, ruta: ROUTES.AFORO_PEATONES },
  { titulo: 'Censo', descripcion: 'Población por distrito, barrio y grupo de edad', icono: Users, ruta: ROUTES.CENSO }
];

function DashboardPage() {
  const estadisticas = useEstadisticasDashboard();

  return (
    <PageLayout
      title="Resumen de la ciudad"
      description={`Vista agregada de Anthem en ${DATE_CONFIG.DATASET_YEAR}: aire, ruido, movilidad, seguridad vial, residuos y demografía sobre un único modelo de datos.`}
    >
      <BannerCabecera />

      <PanelAlertas />

      {/* Stats: grid 3 columnas en lg con UNA tarjeta por modulo. Antes
          mostrabamos solo 3 (ubicaciones, aire, ruido) y el dashboard se
          sentia descompensado respecto a los 9 modulos de mas abajo.
          Cada tarjeta hace una llamada `limit: 1` en paralelo (ver
          useEstadisticasDashboard) para minimizar payload. */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-14">
        <TarjetaEstadisticaDashboard
          titulo="Ubicaciones registradas"
          valor={estadisticas.ubicaciones.total.toLocaleString('es-ES')}
          subtitulo="Puntos de interés y medición"
          icono={MapPin}
          dominio={dominioDeRuta(ROUTES.UBICACIONES)}
          cargando={estadisticas.ubicaciones.cargando}
        />
        <TarjetaEstadisticaDashboard
          titulo="Mediciones de aire"
          valor={estadisticas.calidadAire.total.toLocaleString('es-ES')}
          subtitulo="Registros de calidad ambiental"
          icono={Wind}
          dominio={dominioDeRuta(ROUTES.CALIDAD_AIRE)}
          cargando={estadisticas.calidadAire.cargando}
        />
        <TarjetaEstadisticaDashboard
          titulo="Mediciones de ruido"
          valor={estadisticas.ruido.total.toLocaleString('es-ES')}
          subtitulo="Registros de nivel acústico"
          icono={Volume2}
          dominio={dominioDeRuta(ROUTES.RUIDO)}
          cargando={estadisticas.ruido.cargando}
        />
        <TarjetaEstadisticaDashboard
          titulo="Accidentes registrados"
          valor={estadisticas.accidentes.total.toLocaleString('es-ES')}
          subtitulo="Personas afectadas en siniestros"
          icono={AlertTriangle}
          dominio={dominioDeRuta(ROUTES.ACCIDENTES)}
          cargando={estadisticas.accidentes.cargando}
        />
        <TarjetaEstadisticaDashboard
          titulo="Asignaciones de patinetes"
          valor={estadisticas.patinetes.total.toLocaleString('es-ES')}
          subtitulo="Reparto por distrito y proveedor"
          icono={Zap}
          dominio={dominioDeRuta(ROUTES.PATINETES)}
          cargando={estadisticas.patinetes.cargando}
        />
        <TarjetaEstadisticaDashboard
          titulo="Registros de bicicletas"
          valor={estadisticas.bicicletas.total.toLocaleString('es-ES')}
          subtitulo="Disponibilidad y usos"
          icono={Bike}
          dominio={dominioDeRuta(ROUTES.BICICLETAS)}
          cargando={estadisticas.bicicletas.cargando}
        />
        <TarjetaEstadisticaDashboard
          titulo="Filas del censo"
          valor={estadisticas.censo.total.toLocaleString('es-ES')}
          subtitulo="Demografía por distrito y barrio"
          icono={Users}
          dominio={dominioDeRuta(ROUTES.CENSO)}
          cargando={estadisticas.censo.cargando}
        />
        <TarjetaEstadisticaDashboard
          titulo="Multas de tráfico"
          valor={estadisticas.multas.total.toLocaleString('es-ES')}
          subtitulo="Infracciones registradas"
          icono={FileWarning}
          dominio={dominioDeRuta(ROUTES.MULTAS)}
          cargando={estadisticas.multas.cargando}
        />
        <TarjetaEstadisticaDashboard
          titulo="Aforo de bicicletas"
          valor={estadisticas.aforoBicicletas.total.toLocaleString('es-ES')}
          subtitulo="Conteo horario por estación"
          icono={Activity}
          dominio={dominioDeRuta(ROUTES.AFORO_BICICLETAS)}
          cargando={estadisticas.aforoBicicletas.cargando}
        />
      </div>

      {/* Modulos: header editorial con eyebrow + titulo + descriptor */}
      <section className="mb-14" aria-labelledby="dashboard-modulos-titulo">
        <div className="mb-8">
          <h2 id="dashboard-modulos-titulo" className="font-display text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            Explora por área
          </h2>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Cada área tiene sus propios filtros, mapas y series temporales sobre
            el mismo modelo de datos.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {MODULOS_ACCESO_RAPIDO.map((modulo) => (
            <TarjetaAccesoRapido key={modulo.ruta} {...modulo} dominio={dominioDeRuta(modulo.ruta)} />
          ))}
        </div>
      </section>

      <EstadoSistema />
    </PageLayout>
  );
}

export default DashboardPage;
