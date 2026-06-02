/**
 * Componente BannerCabecera
 *
 * Hero editorial del dashboard. Sustituye al banner generico "Bienvenido a +
 * gradient text + sparkles + SVG pattern" (patron tipico de plantillas IA)
 * por un bloque con voz: titulo declarativo, parrafo de contexto y una
 * columna lateral de metricas estructurales del dataset.
 *
 * Estructura:
 *   - Eyebrow mono uppercase como marcador editorial.
 *   - Titulo display con una palabra resaltada (mismo color del foreground,
 *     pero font-weight 800 + underline accent) en lugar de gradient text.
 *   - Sidebar: 4 metricas "duras" (escala) en grid 2x2.
 *
 * Las cifras de la sidebar son estructurales del dataset (no requieren
 * peticiones extra) -- el dashboard ya tiene 3 hooks live para totales por
 * subsistema. Aqui se busca dar contexto narrativo, no duplicar metricas.
 */

import { DATE_CONFIG } from '../../../constants';

const METRICAS_ESCALA = [
  { valor: '14', etiqueta: 'modulos monitorizados' },
  { valor: '21', etiqueta: 'distritos cubiertos' },
  { valor: '12', etiqueta: 'meses de datos' },
  { valor: '~24M', etiqueta: 'registros analizados' }
];

export function BannerCabecera() {
  return (
    <section
      className="relative mb-12 overflow-hidden rounded-xl border border-border bg-card"
      aria-labelledby="banner-dashboard-titulo"
    >
      {/* Acento vertical izquierdo (signal vial) - reemplaza el SVG pattern decorativo */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/40" />

      <div className="grid gap-10 px-8 py-10 md:px-12 md:py-14 lg:grid-cols-[1.5fr_1fr] lg:gap-16">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-primary mb-5">
            Anthem City / Vista general
          </p>

          <h2
            id="banner-dashboard-titulo"
            className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-[1.1] mb-6"
          >
            El pulso de la ciudad,
            <br />
            <span className="relative inline-block">
              <span className="relative z-10">visualizado en datos</span>
              <span
                className="absolute bottom-1 left-0 right-0 h-3 bg-primary/20 -skew-x-6"
                aria-hidden="true"
              />
            </span>
            .
          </h2>

          <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-xl">
            Plataforma integral de monitorizacion urbana para Anthem City
            <span className="text-foreground font-medium"> {DATE_CONFIG.DATASET_YEAR}</span>.
            Calidad del aire, ruido, movilidad, censo, accidentalidad y mas, sobre un
            unico modelo de datos.
          </p>
        </div>

        {/* Columna derecha: grid 2x2 de metricas duras del dataset.
            Tabular-nums + font-display para que los digitos esten alineados. */}
        <div className="relative">
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl bg-border/40">
            {METRICAS_ESCALA.map((metrica) => (
              <div
                key={metrica.etiqueta}
                className="bg-card/80 px-5 py-6"
              >
                <p className="stat-number text-3xl md:text-4xl text-foreground mb-1">
                  {metrica.valor}
                </p>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground leading-snug">
                  {metrica.etiqueta}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
