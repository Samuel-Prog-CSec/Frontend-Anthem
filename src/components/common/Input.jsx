/**
 * Componente Input - "Civic Operations Console"
 *
 * Campo de entrada tecnico:
 * - Radius muy pequeno (rounded-sm: 2px). El input es una zona de captura.
 * - Borde fino + background inset (mas oscuro que el panel) para senalar
 *   "aqui se escribe" sin necesidad de outline pesado.
 * - Focus: solo cambia color del borde a signal, sin ring. Mas tecnico.
 * - startIcon opcional, ahora con tono mas discreto.
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
          'peer flex h-10 w-full rounded-sm border bg-[var(--surface-inset)]',
          'py-2 text-sm text-foreground placeholder:text-[var(--ink-muted)]',
          'transition-colors duration-150',
          'focus:outline-none',
          'disabled:cursor-not-allowed disabled:opacity-40',
          StartIcon ? 'pl-10 pr-3' : 'px-3',
          error
            ? 'border-[var(--alert)] focus:border-[var(--alert)]'
            : 'border-[var(--border-hairline)] hover:border-[var(--border-emphasis)] focus:border-[var(--signal)]',
          className
        )}
        ref={ref}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={errorId}
        {...props}
      />

      {StartIcon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ink-tertiary)] pointer-events-none transition-colors duration-150 peer-focus:text-[var(--signal)]">
          <StartIcon className="size-4" />
        </div>
      )}

      {error && (
        <p id={errorId} className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--alert)]" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}));

Input.displayName = 'Input';

export { Input };
