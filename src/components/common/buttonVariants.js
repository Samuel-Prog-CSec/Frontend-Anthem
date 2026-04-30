/**
 * Variantes de Button (CVA)
 *
 * Aislado del componente Button.jsx para que ese archivo solo exporte
 * componentes (requisito de react-refresh para HMR fiable).
 */

import { cva } from 'class-variance-authority';

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-ring/40 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 hover:shadow-primary/30',
        primary: 'bg-gradient-to-r from-cyan-600 to-emerald-600 text-white hover:from-cyan-500 hover:to-emerald-500 shadow-lg shadow-cyan-500/20',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-lg shadow-destructive/20',
        outline: 'border-2 border-border bg-transparent text-foreground hover:bg-muted hover:border-muted-foreground/40',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'text-muted-foreground hover:bg-muted hover:text-foreground',
        link: 'text-primary underline-offset-4 hover:underline hover:text-primary/80'
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
