/**
 * Variantes de Badge (CVA)
 *
 * Aislado del componente Badge.jsx para que ese archivo solo exporte
 * componentes (requisito de react-refresh para HMR fiable).
 */

import { cva } from 'class-variance-authority';

export const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-primary/15 text-primary border border-primary/30',
        secondary: 'bg-secondary/60 text-muted-foreground border border-border/60',
        success: 'bg-success/15 text-success border border-success/30',
        warning: 'bg-warning/15 text-warning border border-warning/30',
        destructive: 'bg-destructive/15 text-destructive border border-destructive/30',
        info: 'bg-info/15 text-info border border-info/30',
        purple: 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
      }
    },
    defaultVariants: {
      variant: 'default'
    }
  }
);
