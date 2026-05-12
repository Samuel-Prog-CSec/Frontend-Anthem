/**
 * Componente Input
 *
 * Campo de entrada de texto con estilo consistente.
 * Basado en patrones de Shadcn/ui.
 *
 * Documentacion de referencia:
 * - Shadcn/ui Input: https://ui.shadcn.com/docs/components/input
 */

import { forwardRef, memo } from 'react';
import { cn } from '../../utils';

/**
 * Campo de entrada de texto
 * @param {Object} props - Props del componente
 * @param {string} [props.className] - Clases adicionales
 * @param {string} [props.type] - Tipo de input
 * @param {string} [props.error] - Mensaje de error
 * @param {React.ComponentType} [props.startIcon] - Icono al inicio del input
 */
const Input = memo(forwardRef(({ className, type = 'text', error, startIcon: StartIcon, id, ...props }, ref) => {
  const errorId = error && id ? `${id}-error` : undefined;
  return (
    <div className="w-full relative">
      <input
        id={id}
        type={type}
        className={cn(
          'peer flex h-12 w-full rounded-xl border bg-input/60 py-2.5 text-base text-foreground',
          'placeholder:text-muted-foreground transition-all duration-200',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-0',
          'disabled:cursor-not-allowed disabled:opacity-50',
          StartIcon ? 'pl-14 pr-4' : 'px-4',
          error
            ? 'border-destructive/60 focus-visible:border-destructive focus-visible:ring-destructive/30'
            : 'border-border/60 hover:border-border focus-visible:border-primary focus-visible:ring-ring/30',
          className
        )}
        ref={ref}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={errorId}
        {...props}
      />

      {StartIcon && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none transition-colors duration-200 peer-focus:text-primary">
          <StartIcon className="size-5" />
        </div>
      )}

      {error && (
        <p id={errorId} className="mt-1.5 text-xs text-destructive" role="alert">{error}</p>
      )}
    </div>
  );
}));

Input.displayName = 'Input';

export { Input };
