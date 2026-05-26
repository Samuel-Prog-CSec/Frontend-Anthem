/**
 * Componente PageLayout
 *
 * Layout base "Civic Operations Console". Compone Navbar fija, area
 * principal con jerarquia editorial y un footer monoespacial.
 *
 * Decisiones (Fase 4 - reset bold):
 *   - Fondo: solo el color ink solido + sutil ruido SVG. Eliminados los
 *     blobs decorativos cyan/violet que evocaban template de SaaS.
 *   - Header: eyebrow mono + display serif italic + lead + actions.
 *     Hairline con tick marks como signature (regla metrica de plano
 *     tecnico).
 *   - Footer: wordmark mono + identificadores tecnicos (fecha, version).
 */

import { Navbar } from './Navbar';
import { StatusStrip } from '../common/StatusStrip';

/**
 * Layout base de pagina
 * @param {Object} props - Props del componente
 * @param {React.ReactNode} props.children - Contenido de la pagina
 * @param {string} [props.title] - Titulo de la pagina
 * @param {string} [props.description] - Descripcion de la pagina
 * @param {string} [props.eyebrow] - Texto pequeno sobre el titulo (ej. "Modulo / Submodulo")
 * @param {React.ReactNode} [props.actions] - Acciones de cabecera (botones, filtros)
 * @param {string} [props.statusArea] - Texto del area mostrado en StatusStrip (ej. "Aire")
 * @param {string} [props.statusExtra] - Texto auxiliar para StatusStrip
 * @param {'ok'|'caution'|'alert'} [props.statusEstado='ok'] - Indicador del StatusStrip
 * @param {boolean} [props.hideStatusStrip=false] - Ocultar el StatusStrip integrado
 */
function PageLayout({
  children,
  title,
  description,
  eyebrow,
  actions,
  statusArea,
  statusExtra,
  statusEstado = 'ok',
  hideStatusStrip = false
}) {
  return (
    <div className="relative min-h-screen bg-background">
      {/* Skip-link para accesibilidad de teclado (WCAG 2.4.1) */}
      <a
        href="#contenido-principal"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded focus:outline-none"
      >
        Saltar al contenido principal
      </a>

      {/* Fondo: solo grano sutil para romper la planitud. Sin blobs
          decorativos. La textura es papel/asfalto, no nube. */}
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")"
          }}
        />
      </div>

      <Navbar />

      <main id="contenido-principal" className="relative z-10 pt-16" tabIndex="-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
          {(title || actions) && (
            <header className="mb-10 lg:mb-12">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                <div className="space-y-3">
                  {eyebrow && (
                    <p className="eyebrow">
                      {eyebrow}
                    </p>
                  )}
                  {title && (
                    <h1 className="font-display italic text-4xl sm:text-5xl lg:text-6xl text-foreground tracking-tight leading-[1]">
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
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {actions}
                  </div>
                )}
              </div>

              {/* Hairline con tick marks como signature: regla metrica de
                  un plano tecnico. Marca el limite entre cabecera y
                  contenido. */}
              <div className="mt-8 tick-marks" />
            </header>
          )}

          {/* StatusStrip integrado por defecto: signature de la consola.
              Las paginas pueden ocultarlo con hideStatusStrip=true cuando
              estorbe en layouts compactos. */}
          {!hideStatusStrip && (
            <div className="mb-8">
              <StatusStrip area={statusArea || title} extra={statusExtra} estado={statusEstado} />
            </div>
          )}

          {/* Sin animacion de entrada a nivel de contenedor (bug historico
              de "elementos bajan en fondo negro" tras re-render). */}
          <div>
            {children}
          </div>
        </div>
      </main>

      <footer className="relative z-10 border-t border-[var(--border-hairline)] mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              ANTHEM // CTC // SISTEMA DE OPERACIONES URBANAS
            </p>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--ink-tertiary)]">
              2051 / v0.1 / PROYECTO UNIVERSITARIO
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export { PageLayout };
