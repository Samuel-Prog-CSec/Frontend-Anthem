/**
 * Componente Input
 * 
 * Campo de entrada de texto con estilo consistente.
 * Basado en patrones de Shadcn/ui.
 * 
 * Documentacion de referencia:
 * - Shadcn/ui Input: https://ui.shadcn.com/docs/components/input
 */

import { forwardRef } from 'react';
import { cn } from '../../utils';

/**
 * Campo de entrada de texto
 * @param {Object} props - Props del componente
 * @param {string} [props.className] - Clases adicionales
 * @param {string} [props.type] - Tipo de input
 * @param {string} [props.error] - Mensaje de error
 * @param {React.ComponentType} [props.startIcon] - Icono al inicio del input
 */
const Input = forwardRef(({ className, type = 'text', error, startIcon: StartIcon, ...props }, ref) => {
  return (
    <div className="w-full relative">
      <input
        type={type}
        className={cn(
          'peer flex h-12 w-full rounded-xl border bg-slate-800/60 py-2.5 text-base text-white',
          'placeholder:text-slate-500 transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-offset-0',
          'disabled:cursor-not-allowed disabled:opacity-50',
          StartIcon ? 'pl-14 pr-4' : 'px-4',
          error
            ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20'
            : 'border-slate-700/50 hover:border-slate-600 focus:border-cyan-500 focus:ring-cyan-500/20',
          className
        )}
        ref={ref}
        {...props}
      />
      
      {StartIcon && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none transition-colors duration-200 peer-focus:text-cyan-400">
          <StartIcon className="h-5 w-5" />
        </div>
      )}

      {error && (
        <p className="mt-1.5 text-xs text-red-400">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export { Input };
