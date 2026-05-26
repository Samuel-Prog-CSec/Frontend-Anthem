/**
 * Componente EstadoSistema
 *
 * Footer informativo del dashboard. Sustituye al panel previo de "4
 * servicios todos en Operativo + pulse verde" (decoracion sin estado real)
 * por una franja editorial con metadata del proyecto: stack, version,
 * actualizacion y enlace al dataset.
 *
 * Cuando el backend exponga un endpoint /system/health real, esta tarjeta
 * sera el lugar natural para mostrar latencia y cache hit ratio reales.
 */

import { GitBranch, Database, Server, Calendar } from 'lucide-react';
import { DATE_CONFIG } from '../../../constants';

const ITEMS_META = [
  {
    id: 'dataset',
    icono: Calendar,
    etiqueta: 'Cobertura',
    valor: `${DATE_CONFIG.DATASET_YEAR}`,
    descripcion: 'Enero - Diciembre, 12 meses completos'
  },
  {
    id: 'stack',
    icono: Server,
    etiqueta: 'Backend',
    valor: 'Express 5 + Mongoose 9',
    descripcion: 'Node 22, cache multinivel, ETags'
  },
  {
    id: 'bd',
    icono: Database,
    etiqueta: 'Persistencia',
    valor: 'MongoDB 8',
    descripcion: '14 colecciones, indices 2dsphere'
  },
  {
    id: 'version',
    icono: GitBranch,
    etiqueta: 'Frontend',
    valor: 'React 19 + Vite 7',
    descripcion: 'Tailwind v4, React Query v5, Leaflet'
  }
];

export function EstadoSistema() {
  return (
    <section
      className="rounded-xl border border-border/60 bg-card/30 backdrop-blur-sm"
      aria-labelledby="dashboard-estado-titulo"
    >
      <header className="px-6 py-5 border-b border-border/50">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground mb-1">
          Acerca del sistema
        </p>
        <h2 id="dashboard-estado-titulo" className="font-display text-lg text-foreground font-bold">
          Stack tecnico y cobertura
        </h2>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-border/40">
        {ITEMS_META.map((item) => {
          const Icono = item.icono;
          return (
            <article key={item.id} className="px-6 py-5">
              <div className="flex items-center gap-2 mb-3">
                <Icono className="size-3.5 text-muted-foreground" aria-hidden="true" />
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  {item.etiqueta}
                </p>
              </div>
              <p className="font-display text-base font-bold text-foreground mb-1">
                {item.valor}
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {item.descripcion}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
