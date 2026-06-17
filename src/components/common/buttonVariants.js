/**
 * Variantes de Button (CVA)
 *
 * Aislado del componente Button.jsx para que ese archivo solo exporte
 * componentes (requisito de react-refresh para HMR fiable).
 *
 * Identidad "Atlas Civico": sin gradients ni glows. `primary` usa la cobalto
 * de marca con texto claro. Feedback tactil: brillo sutil en hover + leve
 * scale al pulsar (respeta prefers-reduced-motion). Radius pequeno (4px).
 */

import { cva } from 'class-variance-authority';

export const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 whitespace-nowrap',
    'rounded text-sm font-medium tracking-tight',
    'border border-transparent',
    'transition-[color,background-color,border-color,box-shadow,transform] duration-150',
    'active:scale-[0.97] motion-reduce:active:scale-100',
    'focus:outline-none focus-visible:outline focus-visible:outline-1',
    'focus-visible:outline-offset-2 focus-visible:outline-primary',
    'disabled:pointer-events-none disabled:opacity-40'
  ].join(' '),
  {
    variants: {
      variant: {
        // Solido cobalto de marca. CTA primario.
        default: 'bg-primary text-primary-foreground hover:brightness-110',
        // Alias historico: mismo estilo que default. Mantenido por compat.
        primary: 'bg-primary text-primary-foreground hover:brightness-110',
        // Borde fino, texto ink, hover llena la superficie.
        outline: 'border-[var(--border-emphasis)] text-foreground hover:bg-[var(--surface-raised)] hover:border-[var(--border-strong)]',
        // Discreto, sin borde. Util en toolbars.
        ghost: 'text-muted-foreground hover:bg-[var(--surface-raised)] hover:text-foreground',
        // Texto solo, util en links inline.
        link: 'text-foreground underline-offset-4 hover:underline hover:text-primary',
        // Destructiva: rojo desaturado, no escarlata.
        destructive: 'bg-destructive text-destructive-foreground hover:opacity-90',
        // Secundario: superficie elevada con borde sutil.
        secondary: 'bg-secondary text-secondary-foreground border-[var(--border-hairline)] hover:bg-[var(--surface-hover)]'
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-11 px-6 text-base',
        icon: 'size-9'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
  }
);
