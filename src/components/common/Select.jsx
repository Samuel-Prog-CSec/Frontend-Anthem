/**
 * Componente Select
 * 
 * Selector desplegable con estilo consistente.
 * Basado en patrones de Shadcn/ui.
 * 
 * Documentacion de referencia:
 * - Shadcn/ui Select: https://ui.shadcn.com/docs/components/select
 */

import { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../utils';

/**
 * Selector nativo estilizado
 * @param {Object} props - Props del componente
 * @param {string} [props.className] - Clases adicionales
 * @param {Array} props.options - Opciones del selector [{value, label}]
 * @param {string} [props.placeholder] - Texto de placeholder
 */
const Select = forwardRef(({ 
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
          'flex h-10 w-full appearance-none rounded-md border border-slate-600 bg-slate-900/50 px-3 py-2 pr-10 text-sm text-white',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'hover:border-slate-500 transition-colors',
          className
        )}
        {...props}
      >
        <option value="" className="bg-slate-900 text-slate-400">
          {placeholder}
        </option>
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            className="bg-slate-900 text-white"
          >
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
    </div>
  );
});

Select.displayName = 'Select';

export { Select };
