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
  AlertTriangle, Bike, Users, FileWarning, Zap
} from 'lucide-react';
import { PageLayout } from '../../components/layout';
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
  { codigo: '01', titulo: 'Ubicaciones', descripcion: 'Estaciones de medicion, rutas de transporte y zonas de interes', icono: MapPin, color: 'cyan', ruta: ROUTES.UBICACIONES },
  { codigo: '02', titulo: 'Calidad del Aire', descripcion: 'Niveles de contaminantes (NO2, O3, PM10) y tendencias', icono: Wind, color: 'emerald', ruta: ROUTES.CALIDAD_AIRE },
  { codigo: '03', titulo: 'Ruido Ambiental', descripcion: 'Niveles de ruido por zona y periodo (diurno, vespertino, nocturno)', icono: Volume2, color: 'purple', ruta: ROUTES.RUIDO },
  { codigo: '04', titulo: 'Accidentes', descripcion: 'Datos de accidentalidad por distrito, tipo y gravedad', icono: AlertTriangle, color: 'amber', ruta: ROUTES.ACCIDENTES },
  { codigo: '05', titulo: 'Patinetes', descripcion: 'Asignacion de patinetes por distrito, proveedor y densidad', icono: Zap, color: 'rose', ruta: ROUTES.PATINETES },
  { codigo: '06', titulo: 'Bicicletas', descripcion: 'Disponibilidad de bicicletas, usos diarios y suscripciones', icono: Bike, color: 'sky', ruta: ROUTES.BICICLETAS },
  { codigo: '07', titulo: 'Censo', descripcion: 'Datos demograficos por distrito, barrio y grupo de edad', icono: Users, color: 'cyan', ruta: ROUTES.CENSO },
  { codigo: '08', titulo: 'Multas', descripcion: 'Infracciones de trafico, importes, calificaciones y ubicaciones', icono: FileWarning, color: 'amber', ruta: ROUTES.MULTAS },
  { codigo: '09', titulo: 'Aforo Bicicletas', descripcion: 'Conteo horario de trafico ciclista por estacion', icono: Activity, color: 'emerald', ruta: ROUTES.AFORO_BICICLETAS }
];

function DashboardPage() {
  const estadisticas = useEstadisticasDashboard();

  return (
    <PageLayout
      eyebrow="Dashboard / Vista general"
      title="Centro de control"
      description={`Indicadores agregados de la Smart City Anthem ${DATE_CONFIG.DATASET_YEAR}. Cada modulo enlaza con su vista detallada con filtros, mapas y series temporales.`}
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
          valor={estadisticas.ubicaciones.total.toLocaleString()}
          subtitulo="Puntos de interes y medicion"
          icono={MapPin}
          color="cyan"
          cargando={estadisticas.ubicaciones.cargando}
        />
        <TarjetaEstadisticaDashboard
          titulo="Mediciones de aire"
          valor={estadisticas.calidadAire.total.toLocaleString()}
          subtitulo="Registros de calidad ambiental"
          icono={Wind}
          color="emerald"
          cargando={estadisticas.calidadAire.cargando}
        />
        <TarjetaEstadisticaDashboard
          titulo="Mediciones de ruido"
          valor={estadisticas.ruido.total.toLocaleString()}
          subtitulo="Registros de nivel acustico"
          icono={Volume2}
          color="purple"
          cargando={estadisticas.ruido.cargando}
        />
        <TarjetaEstadisticaDashboard
          titulo="Accidentes registrados"
          valor={estadisticas.accidentes.total.toLocaleString()}
          subtitulo="Personas afectadas en siniestros"
          icono={AlertTriangle}
          color="amber"
          cargando={estadisticas.accidentes.cargando}
        />
        <TarjetaEstadisticaDashboard
          titulo="Asignaciones de patinetes"
          valor={estadisticas.patinetes.total.toLocaleString()}
          subtitulo="Reparto por distrito y proveedor"
          icono={Zap}
          color="rose"
          cargando={estadisticas.patinetes.cargando}
        />
        <TarjetaEstadisticaDashboard
          titulo="Registros de bicicletas"
          valor={estadisticas.bicicletas.total.toLocaleString()}
          subtitulo="Disponibilidad y usos"
          icono={Bike}
          color="sky"
          cargando={estadisticas.bicicletas.cargando}
        />
        <TarjetaEstadisticaDashboard
          titulo="Filas del censo"
          valor={estadisticas.censo.total.toLocaleString()}
          subtitulo="Demografia por distrito y barrio"
          icono={Users}
          color="cyan"
          cargando={estadisticas.censo.cargando}
        />
        <TarjetaEstadisticaDashboard
          titulo="Multas de trafico"
          valor={estadisticas.multas.total.toLocaleString()}
          subtitulo="Infracciones registradas"
          icono={FileWarning}
          color="amber"
          cargando={estadisticas.multas.cargando}
        />
        <TarjetaEstadisticaDashboard
          titulo="Aforo de bicicletas"
          valor={estadisticas.aforoBicicletas.total.toLocaleString()}
          subtitulo="Conteo horario por estacion"
          icono={Activity}
          color="emerald"
          cargando={estadisticas.aforoBicicletas.cargando}
        />
      </div>

      {/* Modulos: header editorial con eyebrow + titulo + descriptor */}
      <section className="mb-14" aria-labelledby="dashboard-modulos-titulo">
        <div className="mb-8">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground mb-2">
            Catalogo / {MODULOS_ACCESO_RAPIDO.length} modulos
          </p>
          <h2 id="dashboard-modulos-titulo" className="font-display text-2xl md:text-3xl font-bold text-foreground tracking-tight">
            Modulos del sistema
          </h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-xl">
            Cada modulo expone sus propios filtros, agregados y visualizaciones.
            Los datos provienen del mismo modelo unificado.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {MODULOS_ACCESO_RAPIDO.map((modulo) => (
            <TarjetaAccesoRapido key={modulo.ruta} {...modulo} />
          ))}
        </div>
      </section>

      <EstadoSistema />
    </PageLayout>
  );
}

export default DashboardPage;
