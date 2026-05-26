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
      className="hidden xl:flex items-center gap-1.5 px-2 py-1 rounded-sm border border-[var(--signal)] bg-[var(--surface-raised)] text-[10px] font-mono uppercase tracking-[0.1em] text-[var(--signal)]"
      title="Filtro geografico activo en todo el dashboard"
    >
      <Filter className="size-3" aria-hidden="true" />
      <span className="max-w-[140px] truncate">
        {distrito}
        {barrio ? ` / ${barrio}` : ''}
      </span>
      <button
        type="button"
        onClick={limpiarFiltro}
        aria-label="Limpiar filtro geografico"
        className="ml-0.5 hover:text-foreground transition-colors p-0.5"
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
        <div className="absolute inset-0 bg-background border-b border-[var(--border-hairline)]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Grid 3 columnas evita el problema de flex-1 con contenido
              que desborda: cada columna ocupa solo lo que necesita y la
              central scrollea horizontalmente si fuese necesario. */}
          <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 h-16">

            {/* Columna 1: Wordmark mono - signature visual */}
            <Link
              to={ROUTES.DASHBOARD}
              className="flex items-center gap-2 group shrink-0"
              aria-label="Ir al dashboard de Anthem City"
            >
              <span
                className="size-1.5 rounded-full bg-[var(--signal)] group-hover:scale-110 transition-transform shrink-0"
                aria-hidden="true"
              />
              <span className="font-mono text-xs uppercase tracking-[0.18em] font-medium text-foreground">
                ANTHEM
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground hidden lg:inline">
                // CTC
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
                          'relative flex items-center justify-center size-9 rounded-sm transition-colors',
                          isActive
                            ? 'text-foreground'
                            : 'text-[var(--ink-tertiary)] hover:text-foreground'
                        )}
                      >
                        <Icon className="size-4" aria-hidden="true" />
                        {isActive && (
                          <span
                            className="absolute -bottom-2 left-1/2 -translate-x-1/2 h-px w-5 bg-[var(--signal)]"
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
                <div className="hidden sm:flex items-center gap-2">
                  <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-sm border border-[var(--border-hairline)]">
                    <User className="size-3 text-[var(--ink-tertiary)]" aria-hidden="true" />
                    <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-foreground truncate max-w-[100px]">
                      {user?.username || 'OPERADOR'}
                    </span>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleLogout}
                    title="Cerrar sesion"
                    aria-label="Cerrar sesion"
                    className="size-9 hover:text-[var(--alert)]"
                  >
                    <LogOut className="size-4" aria-hidden="true" />
                  </Button>
                </div>
              ) : (
                <Link to={ROUTES.LOGIN}>
                  <Button variant="default" size="sm">
                    Entrar a la consola
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
                    'flex items-center gap-3 px-4 py-3 rounded-sm text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-[var(--surface-raised)] text-foreground border-l-2 border-[var(--signal)]'
                      : 'text-muted-foreground hover:bg-[var(--surface-raised)] hover:text-foreground border-l-2 border-transparent'
                  )}
                >
                  <Icon className="size-5" aria-hidden="true" />
                  {item.label}
                </Link>
              );
            })}

            {isAuthenticated && (
              <>
                <div className="h-px bg-[var(--border-hairline)] my-2" />
                <div className="flex items-center gap-3 px-4 py-2">
                  <User className="size-4 text-[var(--ink-tertiary)]" aria-hidden="true" />
                  <span className="font-mono text-xs uppercase tracking-[0.1em] text-foreground">
                    {user?.username || 'OPERADOR'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    cerrarMenu();
                    handleLogout();
                  }}
                  className="flex items-center gap-3 px-4 py-3 rounded-sm text-sm font-medium text-[var(--alert)] hover:bg-[var(--surface-raised)] transition-colors"
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
