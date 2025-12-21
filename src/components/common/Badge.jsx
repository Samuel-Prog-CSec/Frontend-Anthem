/**
 * Componente Badge
 * 
 * Etiqueta o insignia para mostrar estado o categoria.
 * Basado en patrones de Shadcn/ui.
 * 
 * Documentacion de referencia:
 * - Shadcn/ui Badge: https://ui.shadcn.com/docs/components/badge
 */

import { cva } from 'class-variance-authority';
import { cn } from '../../utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-cyan-600/20 text-cyan-400 border border-cyan-600/30',
        secondary: 'bg-slate-600/20 text-slate-300 border border-slate-600/30',
        success: 'bg-emerald-600/20 text-emerald-400 border border-emerald-600/30',
        warning: 'bg-amber-600/20 text-amber-400 border border-amber-600/30',
        destructive: 'bg-red-600/20 text-red-400 border border-red-600/30',
        info: 'bg-blue-600/20 text-blue-400 border border-blue-600/30',
        purple: 'bg-purple-600/20 text-purple-400 border border-purple-600/30'
      }
    },
    defaultVariants: {
      variant: 'default'
    }
  }
);

/**
 * Etiqueta de estado
 * @param {Object} props - Props del componente
 * @param {string} [props.className] - Clases adicionales
 * @param {string} [props.variant] - Variante de color
 */
function Badge({ className, variant, ...props }) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
