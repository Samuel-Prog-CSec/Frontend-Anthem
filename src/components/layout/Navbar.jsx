/**
 * Componente Navbar
 *
 * Barra de navegacion superior del dashboard. En mobile despliega un Sheet
 * (basado en Radix UI Dialog) con focus trap, ESC handling y bloqueo de
 * scroll automaticos. La logica manual previa (useEffect para body overflow,
 * useEffect para ESC, backdrop button) queda absorbida por el primitive.
 */

import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User, LogOut, MapPin, Wind, Volume2, LayoutDashboard, AlertTriangle, Zap, Bike, Users, FileWarning, Activity, Recycle, TrafficCone, Filter, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { Button, Sheet, SheetContent, SheetTitle } from '../common';
import { useAuth, useFiltroGeo } from '../../context';
import { ROUTES } from '../../constants';
import { cn } from '../../utils';

const navigationItems = [
  { path: ROUTES.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
  { path: ROUTES.UBICACIONES, label: 'Ubicaciones', icon: MapPin },
  { path: ROUTES.CALIDAD_AIRE, label: 'Calidad del Aire', icon: Wind },
  { path: ROUTES.RUIDO, label: 'Ruido', icon: Volume2 },
  { path: ROUTES.ACCIDENTES, label: 'Accidentes', icon: AlertTriangle },
  { path: ROUTES.PATINETES, label: 'Patinetes', icon: Zap },
  { path: ROUTES.BICICLETAS, label: 'Bicicletas', icon: Bike },
  { path: ROUTES.CENSO, label: 'Censo', icon: Users },
  { path: ROUTES.MULTAS, label: 'Multas', icon: FileWarning },
  { path: ROUTES.AFORO_BICICLETAS, label: 'Aforo Bicis', icon: Activity },
  { path: ROUTES.CONTENEDORES, label: 'Contenedores', icon: Recycle },
  { path: ROUTES.TRAFICO, label: 'Trafico', icon: TrafficCone },
  { path: ROUTES.CORRELACIONES, label: 'Analisis BI', icon: Sparkles }
];

/**
 * Chip que muestra el filtro geografico global activo (BI cross-project).
 * Se renderiza solo cuando hay filtro y permite limpiarlo de un click.
 */
function ChipFiltroGeo() {
  const { distrito, barrio, tieneFiltro, limpiarFiltro } = useFiltroGeo();
  if (!tieneFiltro) {return null;}

  return (
    <div
      className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-xs font-medium text-primary"
      title="Filtro geografico activo en todo el dashboard"
    >
      <Filter className="size-3.5" aria-hidden="true" />
      <span className="max-w-[180px] truncate">
        {distrito}
        {barrio ? ` / ${barrio}` : ''}
      </span>
      <button
        type="button"
        onClick={limpiarFiltro}
        aria-label="Limpiar filtro geografico"
        className="ml-1 hover:text-foreground transition-colors rounded-full hover:bg-primary/20 p-0.5"
      >
        <X className="size-3" aria-hidden="true" />
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
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="absolute inset-0 bg-background/80 backdrop-blur-xl border-b border-border/60" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to={ROUTES.DASHBOARD} className="flex items-center gap-3 group">
              <div className="size-10 rounded-xl bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-cyan-500/20 transition-transform group-hover:scale-105">
                <span className="text-white font-bold text-xl">A</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">Anthem City</h1>
                <p className="text-xs text-muted-foreground">Smart Dashboard</p>
              </div>
            </Link>

            <div className="hidden md:flex items-center">
              <div className="flex items-center bg-card/50 rounded-2xl p-1.5 border border-border/60">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      aria-current={isActive ? 'page' : undefined}
                      className={cn(
                        'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200',
                        isActive
                          ? 'bg-gradient-to-r from-cyan-600/80 to-emerald-600/80 text-white shadow-lg shadow-cyan-500/20'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                      )}
                    >
                      <Icon className="size-4" aria-hidden="true" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {isAuthenticated && <ChipFiltroGeo />}
              {isAuthenticated ? (
                <div className="hidden sm:flex items-center gap-3">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-card/50 border border-border/60">
                    <div className="size-7 rounded-lg bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center">
                      <User className="size-4 text-white" aria-hidden="true" />
                    </div>
                    <span className="text-sm font-medium text-foreground">{user?.username || 'Usuario'}</span>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleLogout}
                    title="Cerrar sesion"
                    aria-label="Cerrar sesion"
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  >
                    <LogOut className="size-4" aria-hidden="true" />
                  </Button>
                </div>
              ) : (
                <Link to={ROUTES.LOGIN}>
                  <Button variant="primary" size="sm">
                    Iniciar Sesion
                  </Button>
                </Link>
              )}

              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
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

      {/* Sheet (slide-down) para menu de navegacion mobile.
          Radix gestiona focus trap, ESC handling, aria-modal y bloqueo de scroll. */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent
          side="top"
          className="md:hidden mt-16 max-h-[calc(100vh-4rem)] overflow-y-auto rounded-b-2xl"
        >
          <SheetTitle className="sr-only">Menu de navegacion</SheetTitle>
          <nav aria-label="Navegacion principal mobile" className="flex flex-col gap-1 p-2">
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
                    'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
                    isActive
                      ? 'bg-gradient-to-r from-cyan-600/80 to-emerald-600/80 text-white'
                      : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
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
                  <div className="size-8 rounded-lg bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center">
                    <User className="size-4 text-white" aria-hidden="true" />
                  </div>
                  <span className="text-sm font-medium text-foreground">{user?.username || 'Usuario'}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    cerrarMenu();
                    handleLogout();
                  }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <LogOut className="size-5" aria-hidden="true" />
                  Cerrar Sesion
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
