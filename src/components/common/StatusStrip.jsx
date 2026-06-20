/**
 * StatusStrip - elemento signature de la "Civic Operations Console".
 *
 * Banda monoespacial densa con coordenadas, timestamp, status indicator
 * y filtro geografico activo. Inspirado en barras de estado de consolas
 * tecnicas (Bloomberg terminal, panel de control de trafico).
 *
 * Uso tipico:
 *   <PageLayout title="..." description="...">
 *     <StatusStrip area="Aire" extra="93 estaciones / 12 magnitudes" />
 *     ... resto del contenido ...
 *   </PageLayout>
 *
 * O en su variante "footer de pagina" al final del contenido.
 */

import { memo, useEffect, useState } from 'react';
import { useFiltroGeo } from '../../context';

const COORDS_MADRID = '40.4168°N // 03.7038°W';

function formatearHora(date) {
  return date.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: 'UTC',
    hour12: false
  });
}

/**
 * Banda de status compacta para integrar en PageLayout o paginas concretas.
 *
 * @param {object} props
 * @param {string} [props.area]   - Modulo o sector ("Aire", "Multas", etc.)
 * @param {string} [props.extra]  - Texto auxiliar (ej. "93 estaciones / 12 magnitudes")
 * @param {'ok'|'caution'|'alert'} [props.estado='ok'] - Indicador de estado
 */
const StatusStrip = memo(function StatusStrip({ area, extra, estado = 'ok' }) {
  const filtroGeo = useFiltroGeo();
  const [hora, setHora] = useState(() => formatearHora(new Date()));

  useEffect(() => {
    // Actualizar reloj cada minuto. No usamos cada segundo para no causar
    // re-renders innecesarios; la sensacion de "live" se mantiene.
    const id = setInterval(() => setHora(formatearHora(new Date())), 60000);
    return () => clearInterval(id);
  }, []);

  const colorEstado =
    estado === 'alert' ? 'bg-[var(--alert)]'
      : estado === 'caution' ? 'bg-[var(--caution)]'
        : 'bg-[var(--ok)]';

  const filtroActivo = filtroGeo.tieneFiltro
    ? `${filtroGeo.distrito}${filtroGeo.barrio ? ` / ${filtroGeo.barrio}` : ''}`.toUpperCase()
    : null;

  return (
    <div
      className="flex flex-wrap items-center gap-x-6 gap-y-2 border-y border-[var(--border-hairline)] py-2.5 px-1 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--ink-tertiary)]"
      aria-label="Estado del sistema"
    >
      <span className="flex items-center gap-2">
        <span
          className={`size-1.5 rounded-full ${colorEstado} animate-pulse`}
          aria-hidden="true"
        />
        <span className="text-foreground">{area || 'Anthem // CTC'}</span>
      </span>

      <span aria-label="Hora UTC">{hora} UTC</span>

      <span aria-label="Coordenadas Madrid">{COORDS_MADRID}</span>

      {extra && <span className="text-[var(--ink-secondary)]">{extra}</span>}

      {filtroActivo && (
        <span className="ml-auto text-[var(--signal)]">
          FILTRO ↳ {filtroActivo}
        </span>
      )}
    </div>
  );
});

export { StatusStrip };
