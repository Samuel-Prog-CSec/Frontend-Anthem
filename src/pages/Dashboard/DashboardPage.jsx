/**
 * Pagina de Dashboard
 *
 * Vista principal del dashboard de Smart City. Compone secciones independientes
 * (BannerCabecera, estadisticas, accesos rapidos, estado del sistema). La carga
 * de metricas vive en useEstadisticasDashboard: 3 requests paralelas con AbortController.
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
  EstadoSistema
} from './components';

const MODULOS_ACCESO_RAPIDO = [
  { titulo: 'Ubicaciones', descripcion: 'Estaciones de medicion, rutas de transporte y zonas de interes', icono: MapPin, color: 'cyan', ruta: ROUTES.UBICACIONES },
  { titulo: 'Calidad del Aire', descripcion: 'Niveles de contaminantes (NO2, O3, PM10) y tendencias', icono: Wind, color: 'emerald', ruta: ROUTES.CALIDAD_AIRE },
  { titulo: 'Ruido Ambiental', descripcion: 'Niveles de ruido por zona y periodo (diurno, vespertino, nocturno)', icono: Volume2, color: 'purple', ruta: ROUTES.RUIDO },
  { titulo: 'Accidentes', descripcion: 'Datos de accidentalidad por distrito, tipo y gravedad', icono: AlertTriangle, color: 'amber', ruta: ROUTES.ACCIDENTES },
  { titulo: 'Patinetes', descripcion: 'Asignacion de patinetes por distrito, proveedor y densidad', icono: Zap, color: 'rose', ruta: ROUTES.PATINETES },
  { titulo: 'Bicicletas', descripcion: 'Disponibilidad de bicicletas, usos diarios y suscripciones', icono: Bike, color: 'sky', ruta: ROUTES.BICICLETAS },
  { titulo: 'Censo', descripcion: 'Datos demograficos por distrito, barrio y grupo de edad', icono: Users, color: 'cyan', ruta: ROUTES.CENSO },
  { titulo: 'Multas', descripcion: 'Infracciones de trafico, importes, calificaciones y ubicaciones', icono: FileWarning, color: 'amber', ruta: ROUTES.MULTAS },
  { titulo: 'Aforo Bicicletas', descripcion: 'Conteo horario de trafico ciclista por estacion', icono: Activity, color: 'emerald', ruta: ROUTES.AFORO_BICICLETAS }
];

function DashboardPage() {
  const estadisticas = useEstadisticasDashboard();

  return (
    <PageLayout
      title="Dashboard"
      description={`Sistema de monitoreo urbano - Anthem City ${DATE_CONFIG.DATASET_YEAR}`}
    >
      <BannerCabecera />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <TarjetaEstadisticaDashboard
          titulo="Ubicaciones"
          valor={estadisticas.ubicaciones.total.toLocaleString()}
          subtitulo="Puntos de interes registrados"
          icono={MapPin}
          color="cyan"
          cargando={estadisticas.ubicaciones.cargando}
        />
        <TarjetaEstadisticaDashboard
          titulo="Mediciones de Aire"
          valor={estadisticas.calidadAire.total.toLocaleString()}
          subtitulo="Registros de calidad ambiental"
          icono={Wind}
          color="emerald"
          cargando={estadisticas.calidadAire.cargando}
        />
        <TarjetaEstadisticaDashboard
          titulo="Mediciones de Ruido"
          valor={estadisticas.ruido.total.toLocaleString()}
          subtitulo="Registros de nivel acustico"
          icono={Volume2}
          color="purple"
          cargando={estadisticas.ruido.cargando}
        />
      </div>

      <div className="mb-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-foreground">Modulos del Sistema</h2>
            <p className="text-sm text-muted-foreground">Accede a las diferentes secciones del dashboard</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MODULOS_ACCESO_RAPIDO.map((modulo) => (
            <TarjetaAccesoRapido key={modulo.ruta} {...modulo} />
          ))}
        </div>
      </div>

      <EstadoSistema />
    </PageLayout>
  );
}

export default DashboardPage;
