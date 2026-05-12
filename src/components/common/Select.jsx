/**
 * Componente Select
 *
 * Selector desplegable con estilo consistente.
 * Basado en patrones de Shadcn/ui.
 *
 * Documentacion de referencia:
 * - Shadcn/ui Select: https://ui.shadcn.com/docs/components/select
 */

import { forwardRef, memo } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../utils';

/**
 * Selector nativo estilizado
 * @param {Object} props - Props del componente
 * @param {string} [props.className] - Clases adicionales
 * @param {Array} props.options - Opciones del selector [{value, label}]
 * @param {string} [props.placeholder] - Texto de placeholder
 */
const Select = memo(forwardRef(({
  className,
  options = [],
  placeholder = 'Seleccionar...',
  ...props
}, ref) => {
  return (
    <div className="relative w-full">
      <select
        ref={ref}
        className={cn(
          'flex h-10 w-full appearance-none rounded-md border border-border bg-input/60 px-3 py-2 pr-10 text-sm text-foreground',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'hover:border-muted-foreground/40 transition-colors',
          className
        )}
        {...props}
      >
        <option value="" className="bg-card text-muted-foreground">
          {placeholder}
        </option>
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            className="bg-card text-foreground"
          >
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
    </div>
  );
}));

Select.displayName = 'Select';

export { Select };
