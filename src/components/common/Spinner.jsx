/**
 * Componente Spinner / Loading
 * 
 * Indicador de carga animado.
 */

import { cn } from '../../utils';

/**
 * Spinner de carga
 * @param {Object} props - Props del componente
 * @param {string} [props.size] - Tamano: 'sm', 'md', 'lg'
 * @param {string} [props.className] - Clases adicionales
 */
function Spinner({ size = 'md', className }) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  return (
    <svg
      className={cn('animate-spin text-cyan-500', sizeClasses[size], className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
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
}

/**
 * Contenedor de carga con mensaje
 * @param {Object} props - Props del componente
 * @param {string} [props.message] - Mensaje de carga
 */
function LoadingState({ message = 'Cargando...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-4">
      <Spinner size="lg" />
      <p className="text-slate-400 text-sm">{message}</p>
    </div>
  );
}

export { Spinner, LoadingState };
