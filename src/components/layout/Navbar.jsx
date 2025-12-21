/**
 * Componente Navbar
 * 
 * Barra de navegacion superior del dashboard con diseno futurista.
 * Incluye logo, menu de navegacion y acciones de usuario.
 */

import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User, LogOut, MapPin, Wind, Volume2, LayoutDashboard, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../common';
import { useAuth } from '../../context';
import { ROUTES } from '../../constants';
import { cn } from '../../utils';

const navigationItems = [
  { path: ROUTES.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
  { path: ROUTES.LOCATIONS, label: 'Ubicaciones', icon: MapPin },
  { path: ROUTES.AIR_QUALITY, label: 'Calidad del Aire', icon: Wind },
  { path: ROUTES.NOISE_MONITORING, label: 'Ruido', icon: Volume2 }
];

/**
 * Barra de navegacion principal
 */
function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      {/* Fondo con blur y gradiente */}
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={ROUTES.DASHBOARD} className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-cyan-500/20 transition-transform group-hover:scale-105">
              <span className="text-white font-bold text-xl">A</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">Anthem City</h1>
              <p className="text-xs text-slate-500">Smart Dashboard</p>
            </div>
          </Link>

          {/* Navegacion Desktop */}
          <div className="hidden md:flex items-center">
            <div className="flex items-center bg-slate-800/50 rounded-2xl p-1.5 border border-slate-700/50">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200',
                      isActive
                        ? 'bg-gradient-to-r from-cyan-600/80 to-emerald-600/80 text-white shadow-lg shadow-cyan-500/20'
                        : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Acciones de usuario */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="hidden sm:flex items-center gap-3">
                {/* Usuario */}
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/50 border border-slate-700/50">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-slate-300">{user?.username || 'Usuario'}</span>
                </div>
                
                {/* Boton logout */}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleLogout} 
                  title="Cerrar sesion"
                  className="text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Link to={ROUTES.LOGIN}>
                <Button variant="primary" size="sm">
                  Iniciar Sesion
                </Button>
              </Link>
            )}

            {/* Menu movil */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Menu movil expandido */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 animate-fade-in">
            <div className="flex flex-col gap-2 bg-slate-800/50 rounded-2xl p-2 border border-slate-700/50">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
                      isActive
                        ? 'bg-gradient-to-r from-cyan-600/80 to-emerald-600/80 text-white'
                        : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                );
              })}
              
              {isAuthenticated && (
                <>
                  <div className="h-px bg-slate-700/50 my-2" />
                  <div className="flex items-center gap-3 px-4 py-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-slate-300">{user?.username || 'Usuario'}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut className="h-5 w-5" />
                    Cerrar Sesion
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export { Navbar };
