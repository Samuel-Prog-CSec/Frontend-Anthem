/**
 * PageLayout - shell de la aplicacion "Atlas Civico"
 *
 * Sidebar agrupada por familia (desktop) + drawer (movil), area principal con
 * cabecera limpia y footer sobrio. Cada pagina declara su `dominio` (o se
 * infiere de la ruta) para tenir el acento via el token --dominio.
 *
 * Cambios frente al shell anterior ("Civic Operations Console"):
 *   - Fuera el grain feTurbulence, la regla de ticks, el eyebrow universal y
 *     el StatusStrip de reloj/coordenadas falsas.
 *   - Navbar de 14 iconos sin label -> sidebar con icono + texto.
 *   - Cabecera: titulo (que nombra la cosa) + bajada con dato + hairline de
 *     acento del dominio. El filtro geografico activo se muestra como chip
 *     real y retirable.
 *
 * Compat: se siguen aceptando props antiguas (eyebrow, statusArea, ...) para
 * no romper las 16 paginas; las relativas al StatusStrip ya no se renderizan.
 */

import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, Filter, X } from 'lucide-react';
import { Sheet, SheetContent, SheetTitle, SheetDescription } from '../common';
import { useFiltroGeo } from '../../context';
import { BarraLateral, SidebarContenido } from './Sidebar';
import { Wordmark } from './Wordmark';
import { ThemeToggle } from './ThemeToggle';
import { dominioDeRuta } from './navegacion';
import { formatearNombreDistritoTitulo, aTituloCase } from '../../utils';

/**
 * Chip del filtro geografico global. Solo se renderiza si hay filtro activo.
 * Tinte segun el dominio de la pagina.
 */
function ChipFiltroGeo() {
  const { distrito, barrio, tieneFiltro, limpiarFiltro } = useFiltroGeo();
  if (!tieneFiltro) { return null; }

  return (
    <div className="mb-6 flex items-center gap-2">
      <span className="text-xs text-muted-foreground">Filtro geográfico</span>
      <span className="inline-flex items-center gap-1.5 rounded-full border border-dominio/40 bg-dominio-soft px-2.5 py-1 text-xs font-medium text-foreground">
        <Filter className="size-3 text-dominio" aria-hidden="true" />
        <span className="max-w-[200px] truncate">
          {formatearNombreDistritoTitulo(distrito)}{barrio ? ` / ${aTituloCase(barrio)}` : ''}
        </span>
        <button
          type="button"
          onClick={limpiarFiltro}
          aria-label="Quitar filtro geográfico"
          className="-mr-1 ml-0.5 rounded-full p-0.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <X className="size-3" aria-hidden="true" />
        </button>
      </span>
    </div>
  );
}

/**
 * Layout base de pagina
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {string} [props.title]
 * @param {string} [props.description]
 * @param {React.ReactNode} [props.actions]
 * @param {'movilidad'|'ambiente'|'ruido'|'seguridad'|'demografia'|'bi'} [props.dominio]
 *        Dominio para el token de color. Si se omite, se infiere de la ruta.
 */
function PageLayout({ children, title, description, actions, dominio }) {
  const { pathname } = useLocation();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const dominioEfectivo = dominio || dominioDeRuta(pathname);

  // Titulo del documento por ruta (pestana / marcador / historial), en vez del
  // generico estatico. El titulo de cada pagina nombra la cosa: "Censo - Anthem".
  useEffect(() => {
    document.title = title ? `${title} · Anthem` : 'Anthem · Atlas urbano de Madrid';
    return () => { document.title = 'Anthem · Atlas urbano de Madrid'; };
  }, [title]);

  return (
    <div
      data-dominio={dominioEfectivo}
      className="min-h-screen bg-background text-foreground"
    >
      <a
        href="#contenido-principal"
        className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:outline-none"
      >
        Saltar al contenido principal
      </a>

      <BarraLateral />

      {/* Barra superior solo en movil (en desktop la sidebar la sustituye) */}
      <div className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur lg:hidden">
        <button
          type="button"
          onClick={() => setMenuAbierto(true)}
          aria-label="Abrir navegación"
          className="-ml-1 inline-flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <Menu className="size-5" aria-hidden="true" />
        </button>
        <Wordmark />
        <ThemeToggle />
      </div>

      <div className="lg:pl-[248px]">
        <main
          id="contenido-principal"
          tabIndex="-1"
          className="flex min-h-[calc(100vh-3.5rem)] flex-col lg:min-h-screen"
        >
          <div className="mx-auto w-full max-w-[1400px] flex-1 animate-fade-up px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
            <ChipFiltroGeo />

            {(title || actions) && (
              <header className="mb-8 lg:mb-10">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div className="min-w-0 space-y-2.5">
                    {title && (
                      <h1 className="font-display text-[2rem] font-semibold leading-[1.05] tracking-tight text-foreground sm:text-4xl lg:text-[2.75rem]">
                        {title}
                      </h1>
                    )}
                    {description && (
                      <p className="max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
                        {description}
                      </p>
                    )}
                  </div>
                  {actions && (
                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                      {actions}
                    </div>
                  )}
                </div>

                {/* Hairline de acento del dominio (firma sobria, sustituye los tick-marks) */}
                <div
                  className="mt-6 h-px w-full"
                  style={{ background: 'linear-gradient(to right, var(--dominio) 0%, var(--border) 30%, var(--border) 100%)' }}
                  aria-hidden="true"
                />
              </header>
            )}

            {children}
          </div>

          <footer className="border-t border-border">
            <div className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 lg:px-10">
              <p className="text-xs text-muted-foreground">
                Anthem, atlas urbano de Madrid. Datos simulados del año 2051.
              </p>
            </div>
          </footer>
        </main>
      </div>

      <Sheet open={menuAbierto} onOpenChange={setMenuAbierto}>
        <SheetContent side="left" className="w-[280px] p-0 lg:hidden">
          <SheetTitle className="sr-only">Navegación principal</SheetTitle>
          <SheetDescription className="sr-only">
            Menú de navegación entre las áreas del atlas urbano.
          </SheetDescription>
          <SidebarContenido onNavegar={() => setMenuAbierto(false)} />
        </SheetContent>
      </Sheet>
    </div>
  );
}

export { PageLayout };
