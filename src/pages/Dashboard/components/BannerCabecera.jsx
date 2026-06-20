/**
 * Componente BannerCabecera
 *
 * Hero del dashboard: una afirmacion clara sobre el alcance del atlas + cuatro
 * cifras estructurales HONESTAS del conjunto (sin metricas inventadas). El
 * fondo lleva la reticula de coordenadas como firma cartografica sutil.
 */

import { DATE_CONFIG } from '../../../constants';

// Cifras estructurales reales del conjunto (no requieren peticiones).
const METRICAS_ESCALA = [
  { valor: '21', etiqueta: 'distritos cubiertos' },
  { valor: '12', etiqueta: 'áreas de datos' },
  { valor: '12', etiqueta: 'meses completos' },
  { valor: `${DATE_CONFIG.DATASET_YEAR}`, etiqueta: 'horizonte temporal' }
];

export function BannerCabecera() {
  return (
    <section
      className="relative mb-12 overflow-hidden rounded-xl border border-border bg-card"
      aria-labelledby="banner-dashboard-titulo"
    >
      {/* Reticula de coordenadas: firma cartografica de "Atlas Civico" */}
      <div className="coord-grid pointer-events-none absolute inset-0 opacity-60" aria-hidden="true" />
      <div className="pointer-events-none absolute left-0 top-0 h-full w-1 bg-dominio/70" aria-hidden="true" />

      <div className="relative grid gap-10 px-8 py-10 md:px-12 md:py-14 lg:grid-cols-[1.5fr_1fr] lg:gap-16">
        <div>
          <h2
            id="banner-dashboard-titulo"
            className="mb-5 font-display text-3xl font-semibold leading-[1.08] text-foreground md:text-4xl lg:text-5xl"
          >
            Una ciudad,<br />doce capas de datos.
          </h2>

          <p className="max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
            Anthem reúne calidad del aire, ruido, movilidad, seguridad vial,
            residuos y demografía de los 21 distritos sobre un único modelo, con
            el año
            <span className="font-medium text-foreground"> {DATE_CONFIG.DATASET_YEAR}</span> como horizonte.
          </p>
        </div>

        <div className="relative self-center">
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border">
            {METRICAS_ESCALA.map((metrica) => (
              <div key={metrica.etiqueta} className="bg-card px-5 py-6">
                <p className="stat-hero mb-1.5 text-3xl text-foreground md:text-4xl">
                  {metrica.valor}
                </p>
                <p className="text-xs leading-snug text-muted-foreground">
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
