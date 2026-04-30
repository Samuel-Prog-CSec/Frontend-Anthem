/**
 * Componente Navbar
 *
 * Barra de navegacion superior del dashboard. En mobile despliega un drawer
 * con backdrop oscuro; se cierra automaticamente al cambiar de ruta para no
 * dejar el menu abierto cuando el usuario navega.
 */

import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User, LogOut, MapPin, Wind, Volume2, LayoutDashboard, AlertTriangle, Zap, Bike, Users, FileWarning, Activity } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '../common';
import { useAuth } from '../../context';
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
  { path: ROUTES.AFORO_BICICLETAS, label: 'Aforo Bicis', icon: Activity }
];

const MOBILE_MENU_ID = 'navbar-mobile-menu';

function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();

  // El cierre del menu mobile al navegar lo gestionan los onClick de los Links
  // del drawer, no useEffect. Asi evitamos setState dentro de effect (que React
  // Compiler senala como posible cascading render)

  // Bloquear scroll del body cuando el menu mobile esta abierto
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isMobileMenuOpen]);

  // Cerrar con Escape
  useEffect(() => {
    if (!isMobileMenuOpen) {return;}
    const handler = (e) => {
      if (e.key === 'Escape') {setIsMobileMenuOpen(false);}
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isMobileMenuOpen]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      window.location.href = '/login';
    }
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="absolute inset-0 bg-background/80 backdrop-blur-xl border-b border-border/60" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to={ROUTES.DASHBOARD} className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-cyan-500/20 transition-transform group-hover:scale-105">
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
                      <Icon className="h-4 w-4" aria-hidden="true" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <div className="hidden sm:flex items-center gap-3">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-card/50 border border-border/60">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center">
                      <User className="h-4 w-4 text-white" aria-hidden="true" />
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
                    <LogOut className="h-4 w-4" aria-hidden="true" />
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
                aria-controls={MOBILE_MENU_ID}
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <Menu className="h-5 w-5" aria-hidden="true" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Backdrop oscuro mobile - cerrar al click */}
      {isMobileMenuOpen && (
        <button
          type="button"
          aria-label="Cerrar menu de navegacion"
          className="md:hidden fixed inset-0 z-40 bg-background/80 backdrop-blur-sm animate-fade-in"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Drawer mobile (sheet pattern) */}
      <div
        id={MOBILE_MENU_ID}
        role="dialog"
        aria-modal="true"
        aria-label="Menu de navegacion"
        className={cn(
          'md:hidden fixed top-16 left-0 right-0 z-40 transition-transform duration-300 ease-out',
          isMobileMenuOpen ? 'translate-y-0' : '-translate-y-[120%] pointer-events-none'
        )}
      >
        <div className="mx-4 mt-2 mb-4 bg-card/95 backdrop-blur-xl rounded-2xl border border-border/60 shadow-2xl">
          <div className="flex flex-col gap-1 p-2 max-h-[calc(100vh-6rem)] overflow-y-auto">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
                    isActive
                      ? 'bg-gradient-to-r from-cyan-600/80 to-emerald-600/80 text-white'
                      : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                  )}
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                  {item.label}
                </Link>
              );
            })}

            {isAuthenticated && (
              <>
                <div className="h-px bg-border/60 my-2" />
                <div className="flex items-center gap-3 px-4 py-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center">
                    <User className="h-4 w-4 text-white" aria-hidden="true" />
                  </div>
                  <span className="text-sm font-medium text-foreground">{user?.username || 'Usuario'}</span>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <LogOut className="h-5 w-5" aria-hidden="true" />
                  Cerrar Sesion
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export { Navbar };
