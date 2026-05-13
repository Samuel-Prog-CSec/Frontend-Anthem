/**
 * Componente PageLayout
 * 
 * Layout base para todas las paginas del dashboard.
 * Incluye Navbar y contenedor principal con diseno futurista.
 */

import { Navbar } from './Navbar';

/**
 * Layout base de pagina
 * @param {Object} props - Props del componente
 * @param {React.ReactNode} props.children - Contenido de la pagina
 * @param {string} [props.title] - Titulo de la pagina
 * @param {string} [props.description] - Descripcion de la pagina
 * @param {React.ReactNode} [props.actions] - Acciones de cabecera
 */
function PageLayout({ children, title, description, actions }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background">
      {/* Skip-link para accesibilidad de teclado (WCAG 2.4.1) */}
      <a
        href="#contenido-principal"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded-md focus:shadow-lg"
      >
        Saltar al contenido principal
      </a>

      {/* Efectos de fondo sutiles */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-0 left-1/4 size-96 bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 size-96 bg-emerald-500/5 rounded-full blur-3xl" />
      </div>

      <Navbar />

      {/* Contenido principal con padding para navbar fija */}
      <main id="contenido-principal" className="relative pt-16" tabIndex="-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Cabecera de pagina */}
          {(title || actions) && (
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
              <div className="space-y-1">
                {title && (
                  <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                    {title}
                  </h1>
                )}
                {description && (
                  <p className="text-muted-foreground text-base">
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
          )}

          {/* Contenido de la pagina con entrada escalonada para los bloques
              de primer nivel (cards, graficos, tablas). El stagger se cancela
              automaticamente si el usuario prefiere reduced-motion (regla
              global en index.css). */}
          <div className="animate-fade-in stagger-children">
            {children}
          </div>
        </div>
      </main>

      {/* Footer minimalista */}
      <footer className="relative border-t border-border/50 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              Anthem City Dashboard 2051 - Proyecto Universitario
            </p>
            <p className="text-sm text-muted-foreground">
              Smart City Monitoring System
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export { PageLayout };
