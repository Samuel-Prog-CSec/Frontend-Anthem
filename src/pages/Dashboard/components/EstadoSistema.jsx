/**
 * Componente EstadoSistema
 *
 * Franja "Acerca de los datos": metadata CIVICA del conjunto (cobertura,
 * ambito, areas y naturaleza), no el stack tecnico del backend (que era
 * decoracion de implementacion). Sin glassmorphism ni eyebrow.
 */

import { CalendarRange, Map, Layers3, Database } from 'lucide-react';
import { DATE_CONFIG } from '../../../constants';

const ITEMS_META = [
  {
    id: 'cobertura',
    icono: CalendarRange,
    etiqueta: 'Cobertura',
    valor: `${DATE_CONFIG.DATASET_YEAR}`,
    descripcion: 'De enero a diciembre, doce meses completos'
  },
  {
    id: 'ambito',
    icono: Map,
    etiqueta: 'Ámbito',
    valor: '21 distritos',
    descripcion: 'Madrid, sobre un único modelo georreferenciado'
  },
  {
    id: 'areas',
    icono: Layers3,
    etiqueta: 'Áreas de datos',
    valor: '12 dominios',
    descripcion: 'Aire, ruido, movilidad, seguridad vial, residuos y censo'
  },
  {
    id: 'naturaleza',
    icono: Database,
    etiqueta: 'Naturaleza',
    valor: 'Datos simulados',
    descripcion: 'Conjunto sintético con fines de análisis y demostración'
  }
];

export function EstadoSistema() {
  return (
    <section
      className="rounded-xl border border-border bg-card"
      aria-labelledby="dashboard-estado-titulo"
    >
      <header className="border-b border-border px-6 py-5">
        <h2 id="dashboard-estado-titulo" className="font-display text-lg font-semibold text-foreground">
          Acerca de los datos
        </h2>
      </header>

      <div className="grid grid-cols-1 divide-y divide-border sm:grid-cols-2 sm:divide-y-0 sm:divide-x lg:grid-cols-4">
        {ITEMS_META.map((item) => {
          const Icono = item.icono;
          return (
            <article key={item.id} className="px-6 py-5">
              <div className="mb-3 flex items-center gap-2">
                <Icono className="size-4 text-dominio" aria-hidden="true" />
                <p className="text-xs font-medium text-muted-foreground">{item.etiqueta}</p>
              </div>
              <p className="mb-1 font-display text-base font-semibold text-foreground">
                {item.valor}
              </p>
              <p className="text-xs leading-relaxed text-muted-foreground">
                {item.descripcion}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
