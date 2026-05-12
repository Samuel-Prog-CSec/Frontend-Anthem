/**
 * Componente Button
 *
 * Boton reutilizable con multiples variantes y tamanos.
 * Basado en patrones de Shadcn/ui.
 *
 * Documentacion de referencia:
 * - Shadcn/ui Button: https://ui.shadcn.com/docs/components/button
 * - class-variance-authority: https://cva.style/docs
 */

import { forwardRef, memo } from 'react';
import { cn } from '../../utils';
import { buttonVariants } from './buttonVariants';

/**
 * Boton con variantes de estilo
 * @param {Object} props - Props del componente
 * @param {string} [props.className] - Clases adicionales
 * @param {string} [props.variant] - Variante: 'default', 'primary', 'destructive', 'outline', 'secondary', 'ghost', 'link'
 * @param {string} [props.size] - Tamano: 'default', 'sm', 'lg', 'icon'
 * @param {boolean} [props.isLoading] - Muestra estado de carga
 */
const Button = memo(forwardRef(({
  className,
  variant,
  size,
  isLoading = false,
  children,
  disabled,
  ...props
}, ref) => {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      {...props}
    >
      {isLoading ? (
        <>
          <svg
            className="animate-spin size-4"
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
          <span>Procesando...</span>
        </>
      ) : children}
    </button>
  );
}));

Button.displayName = 'Button';

export { Button };
