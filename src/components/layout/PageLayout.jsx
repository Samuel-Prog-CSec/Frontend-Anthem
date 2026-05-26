/**
 * Componente PageLayout
 *
 * Layout base editorial para todas las paginas del dashboard. Compone
 * Navbar fija, area principal con tipografia jerarquizada y un footer
 * minimalista.
 *
 * Decisiones de diseno (refactor anti AI-slop):
 *   - Fondo: sutil ruido + un unico glow ambiente alineado al hero, en
 *     lugar de dos blobs simetricos cyan/emerald (patron tipico de
 *     plantillas IA).
 *   - Header: eyebrow + titulo display + descripcion separados por un
 *     hairline horizontal, escapando del "stack de h1 + p" generico.
 *   - Ritmo vertical: py-10/14 segun breakpoint, mas aire del default
 *     py-8 que sentia "encajonado".
 */

import { Navbar } from './Navbar';

/**
 * Layout base de pagina
 * @param {Object} props - Props del componente
 * @param {React.ReactNode} props.children - Contenido de la pagina
 * @param {string} [props.title] - Titulo de la pagina
 * @param {string} [props.description] - Descripcion de la pagina
 * @param {string} [props.eyebrow] - Texto pequeno sobre el titulo (ej. "Modulo / Submodulo")
 * @param {React.ReactNode} [props.actions] - Acciones de cabecera (botones, filtros)
 */
function PageLayout({ children, title, description, eyebrow, actions }) {
  return (
    <div className="relative min-h-screen bg-background">
      {/* Skip-link para accesibilidad de teclado (WCAG 2.4.1) */}
      <a
        href="#contenido-principal"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded-md focus:shadow-lg"
      >
        Saltar al contenido principal
      </a>

      {/* Fondo: ruido sutil + un unico glow ambiente alto a la izquierda.
          El ruido se monta como mascara SVG inline para evitar peticion HTTP
          y se aplica con opacidad baja para que no compita con el contenido. */}
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")"
          }}
        />
        <div className="absolute -top-32 -left-24 size-[480px] rounded-full bg-cyan-500/[0.06] blur-[120px]" />
        <div className="absolute bottom-0 right-1/3 size-[420px] rounded-full bg-violet-500/[0.04] blur-[120px]" />
      </div>

      <Navbar />

      <main id="contenido-principal" className="relative z-10 pt-16" tabIndex="-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
          {(title || actions) && (
            <header className="mb-10 lg:mb-12">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                <div className="space-y-3">
                  {eyebrow && (
                    <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                      {eyebrow}
                    </p>
                  )}
                  {title && (
                    <h1 className="font-display text-3xl sm:text-4xl lg:text-[2.75rem] font-bold text-foreground tracking-tight leading-[1.05]">
                      {title}
                    </h1>
                  )}
                  {description && (
                    <p className="text-base text-muted-foreground max-w-2xl leading-relaxed">
                      {description}
                    </p>
                  )}
                </div>
                {actions && (
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {actions}
                  </div>
                )}
              </div>

              {/* Hairline horizontal para anclar el header. Marca el limite
                  entre cabecera y contenido sin recurrir a un titulo gigante
                  ni a un fondo coloreado. */}
              <div className="mt-8 h-px w-full bg-gradient-to-r from-border via-border/40 to-transparent" />
            </header>
          )}

          {/* Sin animacion de entrada a nivel de contenedor.
              Cualquier `animate-fade-in` / `animate-slide-up` aqui se
              re-disparaba en cada re-render de PageLayout (filtros, paginacion,
              data async), provocando el bug "elementos bajan, fondo negro"
              reportado por QA: el usuario percibia que la pagina no scrollea
              porque la primera interaccion coincidia con una nueva entrada
              animada de los hijos. Se elimina por completo. */}
          <div>
            {children}
          </div>
        </div>
      </main>

      <footer className="relative z-10 border-t border-border/40 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Anthem City Dashboard 2051
            </p>
            <p className="text-xs text-muted-foreground">
              Smart City Monitoring System - Proyecto Universitario
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export { PageLayout };
