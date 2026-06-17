/**
 * MapaNodosCorrelaciones
 *
 * Visualiza las correlaciones como un grafo: cada dominio es un nodo y cada
 * cruce disponible es una arista clicable que abre su pagina. Sustituye a la
 * rejilla de tarjetas identicas del hub BI por una viz de RELACION.
 *
 * El grafo (SVG) se muestra en pantallas medianas y grandes; debajo siempre
 * hay una lista accesible de los cruces (movil + lectores de pantalla).
 */

import { useNavigate, Link } from 'react-router-dom';
import { Wind, TrafficCone, FileWarning, AlertTriangle, Users, Recycle, Volume2, ArrowRight } from 'lucide-react';
import { ROUTES } from '../../constants';

// Nodos: dominio + color + posicion en el lienzo 820x440.
const NODOS = {
  aire:         { label: 'Aire',         icon: Wind,          color: '#2ba39b', x: 150, y: 110 },
  trafico:      { label: 'Tráfico',      icon: TrafficCone,   color: '#d9b23f', x: 330, y: 110 },
  multas:       { label: 'Multas',       icon: FileWarning,   color: '#ce4733', x: 500, y: 110 },
  accidentes:   { label: 'Accidentes',   icon: AlertTriangle, color: '#d9533f', x: 680, y: 110 },
  censo:        { label: 'Censo',        icon: Users,         color: '#5168b0', x: 415, y: 300 },
  contenedores: { label: 'Contenedores', icon: Recycle,       color: '#3fa277', x: 200, y: 355 },
  ruido:        { label: 'Ruido',        icon: Volume2,       color: '#8a5bc2', x: 630, y: 355 }
};

const ARISTAS = [
  { a: 'aire', b: 'trafico', ruta: ROUTES.CORRELACION_AIRE_TRAFICO, titulo: 'Calidad del aire y tráfico', cta: 'Ver aire y tráfico', descripcion: '¿Cómo influye la intensidad del tráfico en los contaminantes (NO2, PM10) por distrito?' },
  { a: 'multas', b: 'accidentes', ruta: ROUTES.CORRELACION_MULTAS_ACCIDENTES, titulo: 'Multas y accidentes', cta: 'Ver multas y accidentes', descripcion: '¿Zonas con más multas, tienden a tener más o menos accidentes?' },
  { a: 'censo', b: 'contenedores', ruta: ROUTES.CORRELACION_CENSO_CONTENEDORES, titulo: 'Censo y contenedores', cta: 'Ver censo y contenedores', descripcion: 'Cobertura de contenedores por cada 1.000 habitantes; distritos infra o sobre-cubiertos.' },
  { a: 'censo', b: 'ruido', ruta: ROUTES.CORRELACION_RUIDO_CENSO, titulo: 'Ruido y censo', cta: 'Ver ruido y censo', descripcion: 'Población expuesta a ruido por encima de los límites diurnos por distrito.' }
];

function Nodo({ nodo }) {
  const Icono = nodo.icon;
  return (
    <g transform={`translate(${nodo.x}, ${nodo.y})`}>
      <circle r="28" fill="var(--surface-raised)" stroke={nodo.color} strokeWidth="2" />
      <g transform="translate(-11, -11)" style={{ color: nodo.color }}>
        <Icono width={22} height={22} stroke="currentColor" strokeWidth={1.8} />
      </g>
      <text
        y="48"
        textAnchor="middle"
        fill="var(--ink-secondary)"
        style={{ fontSize: '12px', fontWeight: 500 }}
      >
        {nodo.label}
      </text>
    </g>
  );
}

function MapaNodosCorrelaciones() {
  const navigate = useNavigate();

  return (
    <section aria-label="Mapa de correlaciones">
      {/* Grafo (md+) */}
      <div className="mb-6 hidden rounded-xl border border-border bg-card p-4 md:block">
        <svg viewBox="0 0 820 440" className="h-auto w-full" role="group" aria-label="Grafo de correlaciones entre áreas">
          {/* Aristas clicables */}
          {ARISTAS.map((arista) => {
            const na = NODOS[arista.a];
            const nb = NODOS[arista.b];
            const mx = (na.x + nb.x) / 2;
            const my = (na.y + nb.y) / 2;
            return (
              <g
                key={arista.ruta}
                className="group cursor-pointer"
                onClick={() => navigate(arista.ruta)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate(arista.ruta); } }}
                role="button"
                tabIndex={0}
                aria-label={arista.titulo}
              >
                {/* Zona de click ancha (invisible) */}
                <line x1={na.x} y1={na.y} x2={nb.x} y2={nb.y} stroke="transparent" strokeWidth="22" />
                {/* Linea visible */}
                <line
                  x1={na.x} y1={na.y} x2={nb.x} y2={nb.y}
                  stroke="var(--border-strong)"
                  strokeWidth="2"
                  className="transition-[stroke] group-hover:stroke-[var(--marca)] group-focus:stroke-[var(--marca)]"
                />
                {/* Pildora central con el cruce */}
                <g transform={`translate(${mx}, ${my})`}>
                  <rect
                    x="-16" y="-11" width="32" height="22" rx="11"
                    fill="var(--surface)"
                    stroke="var(--border-strong)"
                    className="transition-[stroke] group-hover:stroke-[var(--marca)] group-focus:stroke-[var(--marca)]"
                  />
                  <g transform="translate(-7, -7)" className="text-muted-foreground transition-colors group-hover:text-[var(--marca)] group-focus:text-[var(--marca)]">
                    <ArrowRight width={14} height={14} stroke="currentColor" />
                  </g>
                </g>
              </g>
            );
          })}

          {/* Nodos por encima de las aristas */}
          {Object.entries(NODOS).map(([id, nodo]) => (
            <Nodo key={id} nodo={nodo} />
          ))}
        </svg>
      </div>

      {/* Lista accesible de cruces (siempre visible) */}
      <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {ARISTAS.map((arista) => {
          const IconoA = NODOS[arista.a].icon;
          const IconoB = NODOS[arista.b].icon;
          return (
            <li key={arista.ruta}>
              <Link
                to={arista.ruta}
                className="hover-lift group flex h-full flex-col rounded-xl border border-border bg-card p-5 hover:border-[var(--border-emphasis)]"
              >
                <div className="mb-3 flex items-center gap-2">
                  <span className="flex size-9 items-center justify-center rounded-lg border border-border" style={{ color: NODOS[arista.a].color }}>
                    <IconoA className="size-4" aria-hidden="true" />
                  </span>
                  <span className="text-sm text-muted-foreground" aria-hidden="true">y</span>
                  <span className="flex size-9 items-center justify-center rounded-lg border border-border" style={{ color: NODOS[arista.b].color }}>
                    <IconoB className="size-4" aria-hidden="true" />
                  </span>
                </div>
                <h3 className="mb-1 font-display text-lg font-semibold text-foreground">{arista.titulo}</h3>
                <p className="mb-4 text-sm leading-relaxed text-muted-foreground">{arista.descripcion}</p>
                <span className="mt-auto inline-flex items-center gap-1 text-sm font-medium text-[var(--marca)]">
                  {arista.cta}
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export default MapaNodosCorrelaciones;
