/**
 * Componente Navbar
 *
 * Barra de navegacion superior. Diseño basado en 3 columnas con grid:
 *
 *   [ Logo (left) ] [ Nav icons (center) ] [ Auth + filter (right) ]
 *
 * Cada columna se autoabsorbe (min-w-0) para no empujar a las otras y
 * evitar el bug previo donde 14 items con label desbordaban el viewport
 * y se superponian al logo (x=348 < x=298 del primer item) y al boton de
 * cerrar sesion (x=1520 ~ x=1558 de BI).
 *
 * Reglas firmes:
 *   - La navegacion central es SIEMPRE icon-only en desktop (md+). El
 *     label se expone via `aria-label` y `title` (tooltip nativo). Es la
 *     unica forma estable de meter 14 items sin chocar.
 *   - El indicador de pagina activa es un punto cyan bajo el icono, no un
 *     underline largo (mas robusto frente a anchuras variables del item).
 *   - En mobile, el Sheet (Radix Dialog) sigue mostrando labels completos.
 */

import { Link, useLocation } from 'react-router-dom';
import {
  Menu, X, User, LogOut, MapPin, Wind, Volume2, LayoutDashboard,
  AlertTriangle, Zap, Bike, Users, FileWarning, Activity, Footprints,
  Recycle, TrafficCone, Filter, Sparkles
} from 'lucide-react';
import { useState } from 'react';
import { Button, Sheet, SheetContent, SheetTitle } from '../common';
import { useAuth, useFiltroGeo } from '../../context';
import { ROUTES } from '../../constants';
import { cn } from '../../utils';

const navigationItems = [
  { path: ROUTES.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
  { path: ROUTES.UBICACIONES, label: 'Ubicaciones', icon: MapPin },
  { path: ROUTES.CALIDAD_AIRE, label: 'Calidad del aire', icon: Wind },
  { path: ROUTES.RUIDO, label: 'Ruido ambiental', icon: Volume2 },
  { path: ROUTES.ACCIDENTES, label: 'Accidentes', icon: AlertTriangle },
  { path: ROUTES.PATINETES, label: 'Patinetes', icon: Zap },
  { path: ROUTES.BICICLETAS, label: 'Bicicletas', icon: Bike },
  { path: ROUTES.CENSO, label: 'Censo', icon: Users },
  { path: ROUTES.MULTAS, label: 'Multas', icon: FileWarning },
  { path: ROUTES.AFORO_BICICLETAS, label: 'Aforo de bicicletas', icon: Activity },
  { path: ROUTES.AFORO_PEATONES, label: 'Aforo de peatones', icon: Footprints },
  { path: ROUTES.CONTENEDORES, label: 'Contenedores', icon: Recycle },
  { path: ROUTES.TRAFICO, label: 'Trafico', icon: TrafficCone },
  { path: ROUTES.CORRELACIONES, label: 'Analisis BI', icon: Sparkles }
];

/**
 * Chip de filtro geografico global. Solo se renderiza si hay filtro activo.
 */
function ChipFiltroGeo() {
  const { distrito, barrio, tieneFiltro, limpiarFiltro } = useFiltroGeo();
  if (!tieneFiltro) {return null;}

  return (
    <div
      className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-medium text-cyan-300"
      title="Filtro geografico activo en todo el dashboard"
    >
      <Filter className="size-3" aria-hidden="true" />
      <span className="max-w-[120px] truncate">
        {distrito}
        {barrio ? ` / ${barrio}` : ''}
      </span>
      <button
        type="button"
        onClick={limpiarFiltro}
        aria-label="Limpiar filtro geografico"
        className="ml-0.5 hover:text-foreground transition-colors rounded-full hover:bg-cyan-500/20 p-0.5"
      >
        <X className="size-2.5" aria-hidden="true" />
      </button>
    </div>
  );
}

function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      window.location.href = '/login';
    }
  };

  const cerrarMenu = () => setIsMobileMenuOpen(false);

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50"
        aria-label="Navegacion principal"
      >
        <div className="absolute inset-0 bg-background/85 backdrop-blur-xl border-b border-border/60" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Grid 3 columnas evita el problema de flex-1 con contenido
              que desborda: cada columna ocupa solo lo que necesita y la
              central scrollea horizontalmente si fuese necesario. */}
          <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 h-16">

            {/* Columna 1: Logo */}
            <Link
              to={ROUTES.DASHBOARD}
              className="flex items-center gap-2 group shrink-0"
              aria-label="Ir al dashboard de Anthem City"
            >
              <span
                className="size-2 rounded-full bg-cyan-400 group-hover:bg-cyan-300 transition-colors shrink-0"
                aria-hidden="true"
              />
              <span className="font-display text-base font-bold text-foreground tracking-tight">
                Anthem
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground hidden lg:inline">
                /city
              </span>
            </Link>

            {/* Columna 2: Navegacion central icon-only.
                min-w-0 permite que el contenedor se encoja por debajo del
                ancho natural de sus hijos; overflow-x-auto lo hace
                scrolleable si las 14 iconos no cupiesen.
                scrollbar-thin via CSS escondemos la barra fea. */}
            <div className="hidden md:flex justify-center min-w-0">
              <ul className="flex items-center gap-0.5 overflow-x-auto no-scrollbar">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;

                  return (
                    <li key={item.path} className="shrink-0">
                      <Link
                        to={item.path}
                        aria-current={isActive ? 'page' : undefined}
                        aria-label={item.label}
                        title={item.label}
                        className={cn(
                          'relative flex items-center justify-center size-9 rounded-md transition-colors',
                          isActive
                            ? 'text-cyan-300 bg-cyan-500/10'
                            : 'text-muted-foreground hover:text-foreground hover:bg-card/60'
                        )}
                      >
                        <Icon className="size-4" aria-hidden="true" />
                        {isActive && (
                          <span
                            className="absolute -bottom-1 left-1/2 -translate-x-1/2 size-1 rounded-full bg-cyan-400"
                            aria-hidden="true"
                          />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Columna 3: chip filtro + usuario + logout (desktop) o burger (mobile) */}
            <div className="flex items-center gap-2 shrink-0 justify-self-end">
              {isAuthenticated && <ChipFiltroGeo />}

              {isAuthenticated ? (
                <div className="hidden sm:flex items-center gap-1.5">
                  <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-card/50 border border-border/60">
                    <div
                      className="size-5 rounded bg-cyan-500/15 flex items-center justify-center shrink-0"
                      aria-hidden="true"
                    >
                      <User className="size-3 text-cyan-400" />
                    </div>
                    <span className="text-xs font-medium text-foreground truncate max-w-[100px]">
                      {user?.username || 'Usuario'}
                    </span>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleLogout}
                    title="Cerrar sesion"
                    aria-label="Cerrar sesion"
                    className="size-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  >
                    <LogOut className="size-4" aria-hidden="true" />
                  </Button>
                </div>
              ) : (
                <Link to={ROUTES.LOGIN}>
                  <Button variant="primary" size="sm">
                    Iniciar sesion
                  </Button>
                </Link>
              )}

              <Button
                variant="ghost"
                size="icon"
                className="md:hidden size-9"
                onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                aria-label={isMobileMenuOpen ? 'Cerrar menu de navegacion' : 'Abrir menu de navegacion'}
                aria-expanded={isMobileMenuOpen}
              >
                {isMobileMenuOpen ? (
                  <X className="size-5" aria-hidden="true" />
                ) : (
                  <Menu className="size-5" aria-hidden="true" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Sheet (slide-down) mobile. Radix gestiona focus trap, ESC, aria-modal,
          y bloqueo de scroll del body. */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent
          side="top"
          className="md:hidden mt-16 max-h-[calc(100vh-4rem)] overflow-y-auto rounded-b-2xl"
        >
          <SheetTitle className="sr-only">Menu de navegacion</SheetTitle>
          <nav aria-label="Navegacion principal mobile" className="flex flex-col gap-0.5 p-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={cerrarMenu}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-cyan-500/10 text-cyan-300 border-l-2 border-cyan-400'
                      : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground border-l-2 border-transparent'
                  )}
                >
                  <Icon className="size-5" aria-hidden="true" />
                  {item.label}
                </Link>
              );
            })}

            {isAuthenticated && (
              <>
                <div className="h-px bg-border/60 my-2" />
                <div className="flex items-center gap-3 px-4 py-2">
                  <div className="size-8 rounded-md bg-cyan-500/15 flex items-center justify-center">
                    <User className="size-4 text-cyan-400" aria-hidden="true" />
                  </div>
                  <span className="text-sm font-medium text-foreground">{user?.username || 'Usuario'}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    cerrarMenu();
                    handleLogout();
                  }}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
                  aria-label="Cerrar sesion"
                >
                  <LogOut className="size-5" aria-hidden="true" />
                  Cerrar sesion
                </button>
              </>
            )}
          </nav>
        </SheetContent>
      </Sheet>
    </>
  );
}

export { Navbar };
