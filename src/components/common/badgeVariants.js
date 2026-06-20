/**
 * Variantes de Badge (CVA)
 *
 * Aislado del componente Badge.jsx para que ese archivo solo exporte
 * componentes (requisito de react-refresh para HMR fiable).
 *
 * Direccion "Atlas Civico":
 * - Sans, sentence case (no mono-uppercase: eso era la marca del tell).
 * - Fondo tenue del color + borde sutil + texto del color: doble canal.
 * - Las variantes de ESTADO ademas llevan un punto (forma) via Badge.jsx,
 *   para no depender solo del color (WCAG 1.4.1).
 */

import { cva } from 'class-variance-authority';

export const badgeVariants = cva(
  [
    'inline-flex items-center gap-1.5',
    'px-2 py-0.5 rounded-md',
    'text-xs font-medium leading-tight',
    'border'
  ].join(' '),
  {
    variants: {
      variant: {
        default: 'bg-secondary text-secondary-foreground border-transparent',
        signal: 'bg-primary text-primary-foreground border-transparent',
        secondary: 'bg-muted text-muted-foreground border-transparent',
        dominio: 'bg-dominio-soft text-dominio border-dominio/25',
        success: 'bg-success/12 text-success border-success/25',
        warning: 'bg-warning/12 text-warning border-warning/25',
        destructive: 'bg-destructive/12 text-destructive border-destructive/25',
        info: 'bg-info/12 text-info border-info/25',
        // Variante legacy mantenida por compat.
        purple: 'bg-info/12 text-info border-info/25'
      }
    },
    defaultVariants: {
      variant: 'default'
    }
  }
);
