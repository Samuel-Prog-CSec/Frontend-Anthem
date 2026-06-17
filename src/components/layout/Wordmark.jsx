/**
 * Wordmark de Anthem
 *
 * Marca real (no texto mono triplicado). El glifo son curvas de nivel
 * concentricas con un punto: lenguaje cartografico de la identidad
 * "Atlas Civico". El color del glifo es la cobalto de marca.
 */

import { ROUTES } from '../../constants';
import { Link } from 'react-router-dom';
import { cn } from '../../utils';

/**
 * Glifo de marca: curvas de nivel (isolineas) con punto cota.
 */
export function MarcaGlifo({ className }) {
  return (
    <svg
      viewBox="0 0 28 28"
      className={cn('text-[var(--marca)]', className)}
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
    >
      <circle cx="14" cy="14" r="11.5" strokeWidth="1.4" opacity="0.35" />
      <circle cx="12.8" cy="15" r="7.4" strokeWidth="1.5" opacity="0.65" />
      <circle cx="12" cy="15.6" r="3.4" strokeWidth="1.7" />
      <circle cx="12" cy="15.6" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

/**
 * Wordmark completo (glifo + nombre). Enlaza al panel general.
 * @param {Object} props
 * @param {boolean} [props.conSubtitulo=false] - Muestra el subtitulo de marca
 * @param {string} [props.className]
 */
export function Wordmark({ conSubtitulo = false, className }) {
  return (
    <Link
      to={ROUTES.DASHBOARD}
      className={cn('group flex items-center gap-2.5', className)}
    >
      <MarcaGlifo className="size-7 shrink-0 transition-transform group-hover:scale-105" />
      <span className="flex flex-col leading-none">
        <span className="font-display text-lg font-semibold tracking-tight text-foreground">
          Anthem
        </span>
        {conSubtitulo && (
          <span className="mt-1 text-[10.5px] font-medium tracking-wide text-muted-foreground">
            Atlas urbano de Madrid
          </span>
        )}
      </span>
    </Link>
  );
}
