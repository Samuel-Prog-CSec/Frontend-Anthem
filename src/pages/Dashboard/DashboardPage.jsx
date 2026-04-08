/**
 * Pagina de Dashboard
 * 
 * Vista principal del dashboard de Smart City.
 * Muestra un resumen de todas las metricas principales con diseno futurista.
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Wind, Volume2, ArrowRight, Activity, TrendingUp, Sparkles, ChevronRight, Cpu, Database, Zap } from 'lucide-react';
import { PageLayout } from '../../components/layout';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, Button } from '../../components/common';
import { obtenerUbicaciones } from '../../api/servicioUbicaciones';
import { obtenerDatosCalidadAire } from '../../api/servicioCalidadAire';
import { obtenerDatosRuido } from '../../api/servicioRuido';
import { ROUTES, DATE_CONFIG } from '../../constants';
import { cn } from '../../utils';

/**
 * Componente StatCard mejorado para el dashboard
 */
function DashboardStatCard({ title, value, subtitle, icon: Icon, color = 'cyan', loading }) {
  const colorClasses = {
    cyan: {
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/30',
      icon: 'text-cyan-400',
      glow: 'shadow-cyan-500/10'
    },
    emerald: {
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/30',
      icon: 'text-emerald-400',
      glow: 'shadow-emerald-500/10'
    },
    purple: {
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/30',
      icon: 'text-purple-400',
      glow: 'shadow-purple-500/10'
    }
  };

  const colors = colorClasses[color];

  return (
    <div className={cn(
      'relative group p-6 rounded-2xl border transition-all duration-300',
      'bg-slate-800/40 backdrop-blur-xl',
      colors.border,
      'hover:scale-[1.02] hover:shadow-xl',
      colors.glow
    )}>
      {/* Icono */}
      <div className={cn(
        'w-14 h-14 rounded-xl flex items-center justify-center mb-4',
        colors.bg
      )}>
        <Icon className={cn('w-7 h-7', colors.icon)} />
      </div>

      {/* Valor */}
      <div className="mb-1">
        {loading ? (
          <div className="h-10 w-24 bg-slate-700/50 animate-pulse rounded-lg" />
        ) : (
          <span className="text-4xl font-bold text-white tracking-tight">{value}</span>
        )}
      </div>

      {/* Titulo y subtitulo */}
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="text-sm text-slate-400">{subtitle}</p>

      {/* Indicador de actividad */}
      <div className="absolute top-4 right-4 flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-xs text-slate-500">Activo</span>
      </div>
    </div>
  );
}

/**
 * Card de acceso rapido mejorado
 */
function QuickAccessCard({ title, description, icon: Icon, color, to }) {
  const colorClasses = {
    cyan: {
      iconBg: 'bg-gradient-to-br from-cyan-500/20 to-cyan-600/10',
      iconColor: 'text-cyan-400',
      hoverBorder: 'group-hover:border-cyan-500/50',
      arrow: 'group-hover:text-cyan-400'
    },
    emerald: {
      iconBg: 'bg-gradient-to-br from-emerald-500/20 to-emerald-600/10',
      iconColor: 'text-emerald-400',
      hoverBorder: 'group-hover:border-emerald-500/50',
      arrow: 'group-hover:text-emerald-400'
    },
    purple: {
      iconBg: 'bg-gradient-to-br from-purple-500/20 to-purple-600/10',
      iconColor: 'text-purple-400',
      hoverBorder: 'group-hover:border-purple-500/50',
      arrow: 'group-hover:text-purple-400'
    }
  };

  const colors = colorClasses[color];

  return (
    <Link to={to} className="block group">
      <div className={cn(
        'relative h-full p-6 rounded-2xl border border-slate-700/50 bg-slate-800/40 backdrop-blur-xl',
        'transition-all duration-300',
        'hover:bg-slate-800/60 hover:shadow-xl hover:-translate-y-1',
        colors.hoverBorder
      )}>
        {/* Header con icono y flecha */}
        <div className="flex items-start justify-between mb-4">
          <div className={cn('w-14 h-14 rounded-xl flex items-center justify-center', colors.iconBg)}>
            <Icon className={cn('w-7 h-7', colors.iconColor)} />
          </div>
          <ChevronRight className={cn(
            'w-5 h-5 text-slate-600 transition-all duration-300',
            'group-hover:translate-x-1',
            colors.arrow
          )} />
        </div>

        {/* Contenido */}
        <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
        <p className="text-sm text-slate-400 leading-relaxed">{description}</p>

        {/* Boton hover */}
        <div className="mt-4 pt-4 border-t border-slate-700/50 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className={cn('text-sm font-medium', colors.iconColor)}>
            Explorar datos
          </span>
        </div>
      </div>
    </Link>
  );
}

/**
 * Dashboard principal
 */
function DashboardPage() {
  const [stats, setStats] = useState({
    locations: { total: 0, loading: true, error: null },
    airQuality: { total: 0, loading: true, error: null },
    noise: { total: 0, loading: true, error: null }
  });

  useEffect(() => {
    const fetchStats = async () => {
      // Cargar ubicaciones
      try {
        const locationsRes = await obtenerUbicaciones({ limit: 1 });
        setStats(prev => ({
          ...prev,
          locations: { 
            total: locationsRes.pagination?.totalDocuments || 0, 
            loading: false, 
            error: null 
          }
        }));
      } catch (err) {
        setStats(prev => ({
          ...prev,
          locations: { total: 0, loading: false, error: err.message }
        }));
      }

      // Cargar calidad del aire
      try {
        const airRes = await obtenerDatosCalidadAire({ limit: 1 });
        setStats(prev => ({
          ...prev,
          airQuality: { 
            total: airRes.pagination?.totalDocuments || 0, 
            loading: false, 
            error: null 
          }
        }));
      } catch (err) {
        setStats(prev => ({
          ...prev,
          airQuality: { total: 0, loading: false, error: err.message }
        }));
      }

      // Cargar ruido
      try {
        const noiseRes = await obtenerDatosRuido({ limit: 1 });
        setStats(prev => ({
          ...prev,
          noise: { 
            total: noiseRes.pagination?.totalDocuments || 0, 
            loading: false, 
            error: null 
          }
        }));
      } catch (err) {
        setStats(prev => ({
          ...prev,
          noise: { total: 0, loading: false, error: err.message }
        }));
      }
    };

    fetchStats();
  }, []);

  return (
    <PageLayout
      title="Dashboard"
      description={`Sistema de monitoreo urbano - Anthem City ${DATE_CONFIG.DATASET_YEAR}`}
    >
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl mb-8">
        {/* Fondo con gradiente y patron */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/30 via-slate-800/50 to-emerald-600/20" />
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2306b6d4' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        />

        {/* Contenido del hero */}
        <div className="relative px-8 py-12 md:px-12 md:py-16">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                <span className="text-sm font-medium text-cyan-400">Smart City Dashboard</span>
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                Bienvenido a<br />
                <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                  Anthem City
                </span>
              </h1>
              <p className="text-lg text-slate-300 leading-relaxed">
                Sistema de monitoreo integral para la ciudad inteligente del futuro. 
                Visualiza y analiza datos en tiempo real.
              </p>
            </div>

            {/* Estadistica destacada */}
            <div className="flex-shrink-0">
              <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
                <p className="text-sm text-slate-400 mb-1">Dataset del ano</p>
                <p className="text-5xl font-bold bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                  {DATE_CONFIG.DATASET_YEAR}
                </p>
                <p className="text-sm text-slate-500 mt-2">Datos completos de 12 meses</p>
              </div>
            </div>
          </div>
        </div>

        {/* Decoracion inferior */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
      </div>

      {/* Tarjetas de estadisticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <DashboardStatCard
          title="Ubicaciones"
          value={stats.locations.total.toLocaleString()}
          subtitle="Puntos de interes registrados"
          icon={MapPin}
          color="cyan"
          loading={stats.locations.loading}
        />
        <DashboardStatCard
          title="Mediciones de Aire"
          value={stats.airQuality.total.toLocaleString()}
          subtitle="Registros de calidad ambiental"
          icon={Wind}
          color="emerald"
          loading={stats.airQuality.loading}
        />
        <DashboardStatCard
          title="Mediciones de Ruido"
          value={stats.noise.total.toLocaleString()}
          subtitle="Registros de nivel acustico"
          icon={Volume2}
          color="purple"
          loading={stats.noise.loading}
        />
      </div>

      {/* Seccion de acceso rapido */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">Modulos del Sistema</h2>
            <p className="text-sm text-slate-400">Accede a las diferentes secciones del dashboard</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <QuickAccessCard
            title="Ubicaciones"
            description="Explora estaciones de medicion, rutas de transporte y zonas de interes de la ciudad"
            icon={MapPin}
            color="cyan"
            to={ROUTES.LOCATIONS}
          />
          <QuickAccessCard
            title="Calidad del Aire"
            description="Monitorea niveles de contaminantes como NO2, O3, PM10 y analiza tendencias"
            icon={Wind}
            color="emerald"
            to={ROUTES.AIR_QUALITY}
          />
          <QuickAccessCard
            title="Ruido Ambiental"
            description="Analiza niveles de ruido por zona y periodo del dia (diurno, vespertino, nocturno)"
            icon={Volume2}
            color="purple"
            to={ROUTES.NOISE_MONITORING}
          />
        </div>
      </div>

      {/* Estado del sistema */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
              <Activity className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <CardTitle>Estado del Sistema</CardTitle>
              <CardDescription>Monitoreo de servicios en tiempo real</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* API Status */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <Zap className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">API Backend</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs text-emerald-400">Operativo</span>
                </div>
              </div>
            </div>

            {/* Database */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <Database className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">Base de Datos</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs text-emerald-400">Conectada</span>
                </div>
              </div>
            </div>

            {/* Cache */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
              <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                <Cpu className="w-5 h-5 text-cyan-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">Sistema Cache</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs text-emerald-400">Activo</span>
                </div>
              </div>
            </div>

            {/* Data Status */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
              <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-cyan-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">Datos {DATE_CONFIG.DATASET_YEAR}</p>
                <p className="text-xs text-slate-400 mt-0.5">12 meses completos</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </PageLayout>
  );
}

export default DashboardPage;
