/**
 * Componente Spinner / Loading
 *
 * Indicador de carga animado.
 */

import { memo } from 'react';
import { cn } from '../../utils';

/**
 * Spinner de carga
 * @param {Object} props - Props del componente
 * @param {string} [props.size] - Tamano: 'sm', 'md', 'lg'
 * @param {string} [props.className] - Clases adicionales
 */
const Spinner = memo(function Spinner({ size = 'md', className }) {
  const sizeClasses = {
    sm: 'size-4',
    md: 'size-8',
    lg: 'size-12'
  };

  return (
    <svg
      className={cn('animate-spin text-primary', sizeClasses[size], className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      role="status"
      aria-label="Cargando"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
});

/**
 * Contenedor de carga con mensaje
 * @param {Object} props - Props del componente
 * @param {string} [props.message] - Mensaje de carga
 */
const LoadingState = memo(function LoadingState({ message = 'Cargando...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-4" role="status" aria-live="polite">
      <Spinner size="lg" />
      <p className="text-muted-foreground text-sm">{message}</p>
    </div>
  );
});

export { Spinner, LoadingState };
