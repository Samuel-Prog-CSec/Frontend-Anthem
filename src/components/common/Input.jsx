/**
 * Componente Input
 *
 * Campo de entrada con background inset (mas oscuro que el panel) para senalar
 * "aqui se escribe", borde fino y anillo de foco visible (2px) en color de
 * marca. startIcon opcional con tono discreto.
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
          'peer flex h-10 w-full rounded-md border bg-[var(--surface-inset)]',
          'py-2 text-sm text-foreground placeholder:text-[var(--ink-muted)]',
          'transition-colors duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--marca)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface)]',
          'disabled:cursor-not-allowed disabled:opacity-40',
          StartIcon ? 'pl-10 pr-3' : 'px-3',
          error
            ? 'border-[var(--alert)]'
            : 'border-[var(--border)] hover:border-[var(--border-emphasis)]',
          className
        )}
        ref={ref}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={errorId}
        {...props}
      />

      {StartIcon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ink-tertiary)] pointer-events-none transition-colors duration-150 peer-focus:text-[var(--marca)]">
          <StartIcon className="size-4" />
        </div>
      )}

      {error && (
        <p id={errorId} className="mt-1.5 text-xs text-[var(--alert)]" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}));

Input.displayName = 'Input';

export { Input };
