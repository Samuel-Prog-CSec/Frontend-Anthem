/**
 * Sidebar - navegacion principal de Anthem
 *
 * Sustituye la barra superior de 14 iconos identicos sin etiqueta por una
 * navegacion lateral con icono + texto, agrupada por familia. El item activo
 * se marca con barra de acento del color de su dominio (no solo color: tambien
 * peso y fondo), resolviendo descubribilidad y WCAG 1.4.1.
 *
 * `SidebarContenido` es reutilizable: la usa la aside fija de desktop
 * (`BarraLateral`) y el drawer movil (Sheet) que monta PageLayout.
 */

import { Link, useLocation } from 'react-router-dom';
import { User, LogOut } from 'lucide-react';
import { useAuth } from '../../context';
import { cn } from '../../utils';
import { Wordmark } from './Wordmark';
import { ThemeToggle } from './ThemeToggle';
import { GRUPOS_NAVEGACION, dominioDeRuta } from './navegacion';

function esRutaActiva(pathname, ruta) {
  return pathname === ruta || pathname.startsWith(`${ruta}/`);
}

/**
 * Contenido completo de la sidebar (marca + grupos + pie de usuario).
 * @param {Object} props
 * @param {() => void} [props.onNavegar] - Se invoca al pulsar un item (cierra el drawer movil)
 */
export function SidebarContenido({ onNavegar }) {
  const { pathname } = useLocation();
  const { user, logout, isAuthenticated } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      window.location.href = '/login';
    }
  };

  return (
    <div className="flex h-full flex-col bg-background">
      <div className="flex h-16 shrink-0 items-center border-b border-border px-5">
        <Wordmark conSubtitulo />
      </div>

      <nav
        className="no-scrollbar flex-1 overflow-y-auto px-3 py-3"
        aria-label="Navegacion principal"
      >
        {GRUPOS_NAVEGACION.map((grupo) => (
          <div key={grupo.id} className="mb-1.5">
            <p className="px-3 pb-1.5 pt-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              {grupo.label}
            </p>
            <ul className="space-y-0.5">
              {grupo.items.map((item) => {
                const activo = esRutaActiva(pathname, item.path);
                const Icon = item.icon;
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      onClick={onNavegar}
                      data-dominio={activo ? dominioDeRuta(item.path) || grupo.dominio || undefined : undefined}
                      aria-current={activo ? 'page' : undefined}
                      className={cn(
                        'relative flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                        activo
                          ? 'bg-accent font-medium text-foreground'
                          : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                      )}
                    >
                      {activo && (
                        <span
                          className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-dominio"
                          aria-hidden="true"
                        />
                      )}
                      <Icon
                        className={cn('size-[18px] shrink-0', activo && 'text-dominio')}
                        aria-hidden="true"
                      />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="shrink-0 space-y-2 border-t border-border p-3">
        {isAuthenticated && (
          <div className="flex items-center gap-2.5 px-1 py-1">
            <span
              className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent text-muted-foreground"
              aria-hidden="true"
            >
              <User className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">
                {user?.username || 'Invitado'}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {user?.email || 'Sesion activa'}
              </p>
            </div>
          </div>
        )}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {isAuthenticated && (
            <button
              type="button"
              onClick={handleLogout}
              className="flex flex-1 items-center justify-center gap-2 rounded-md border border-border px-3 py-2 text-sm text-muted-foreground transition-colors hover:border-[var(--alert)] hover:text-[var(--alert)]"
            >
              <LogOut className="size-4" aria-hidden="true" />
              Cerrar sesión
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Aside fija de desktop (lg+). En movil se usa el drawer de PageLayout.
 */
export function BarraLateral() {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[248px] border-r border-border lg:block">
      <SidebarContenido />
    </aside>
  );
}
