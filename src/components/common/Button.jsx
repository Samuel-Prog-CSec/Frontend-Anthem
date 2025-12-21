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

import { forwardRef } from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../utils';

const buttonVariants = cva(
  // Clases base
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
  {
    variants: {
      variant: {
        default: 'bg-cyan-600 text-white hover:bg-cyan-500 focus:ring-cyan-500/30 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30',
        primary: 'bg-gradient-to-r from-cyan-600 to-emerald-600 text-white hover:from-cyan-500 hover:to-emerald-500 focus:ring-cyan-500/30 shadow-lg shadow-cyan-500/20',
        destructive: 'bg-red-600 text-white hover:bg-red-500 focus:ring-red-500/30 shadow-lg shadow-red-500/20',
        outline: 'border-2 border-slate-600 bg-transparent text-slate-200 hover:bg-slate-800 hover:border-slate-500 hover:text-white focus:ring-slate-500/30',
        secondary: 'bg-slate-700 text-slate-200 hover:bg-slate-600 focus:ring-slate-500/30',
        ghost: 'text-slate-300 hover:bg-slate-800/80 hover:text-white focus:ring-slate-500/30',
        link: 'text-cyan-400 underline-offset-4 hover:underline hover:text-cyan-300'
      },
      size: {
        default: 'h-11 px-5 py-2.5',
        sm: 'h-9 rounded-lg px-4 text-xs',
        lg: 'h-13 rounded-xl px-8 text-base',
        icon: 'h-11 w-11 rounded-xl'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
  }
);

/**
 * Boton con variantes de estilo
 * @param {Object} props - Props del componente
 * @param {string} [props.className] - Clases adicionales
 * @param {string} [props.variant] - Variante: 'default', 'primary', 'destructive', 'outline', 'secondary', 'ghost', 'link'
 * @param {string} [props.size] - Tamano: 'default', 'sm', 'lg', 'icon'
 * @param {boolean} [props.isLoading] - Muestra estado de carga
 */
const Button = forwardRef(({ 
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
      {...props}
    >
      {isLoading ? (
        <>
          <svg 
            className="animate-spin h-4 w-4" 
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
});

Button.displayName = 'Button';

export { Button, buttonVariants };
