/**
 * Variantes de Badge (CVA)
 *
 * Aislado del componente Badge.jsx para que ese archivo solo exporte
 * componentes (requisito de react-refresh para HMR fiable).
 *
 * Direccion estetica "Civic Operations Console":
 * - Mono uppercase tracking-wide: lectura tipo etiqueta de operacion.
 * - Sin fondo translucido + borde; superficie opaca + borde fino.
 * - Radius cero o muy pequeno: la etiqueta es marca, no pildora.
 */

import { cva } from 'class-variance-authority';

export const badgeVariants = cva(
  [
    'inline-flex items-center gap-1.5',
    'px-2 py-0.5 rounded-sm',
    'font-mono text-[10px] font-medium uppercase tracking-[0.1em]',
    'border'
  ].join(' '),
  {
    variants: {
      variant: {
        default: 'bg-transparent text-foreground border-[var(--border-emphasis)]',
        signal: 'bg-primary text-primary-foreground border-primary',
        secondary: 'bg-[var(--surface-raised)] text-muted-foreground border-[var(--border-hairline)]',
        success: 'bg-transparent text-[var(--ok)] border-[var(--ok)]',
        warning: 'bg-transparent text-[var(--caution)] border-[var(--caution)]',
        destructive: 'bg-transparent text-[var(--alert)] border-[var(--alert)]',
        info: 'bg-transparent text-[var(--info)] border-[var(--info)]',
        // Variante legacy mantenida por compat. Reemplazada por signal.
        purple: 'bg-transparent text-[var(--info)] border-[var(--info)]'
      }
    },
    defaultVariants: {
      variant: 'default'
    }
  }
);
