/**
 * Variantes de Button (CVA)
 *
 * Aislado del componente Button.jsx para que ese archivo solo exporte
 * componentes (requisito de react-refresh para HMR fiable).
 *
 * Direccion estetica "Civic Operations Console":
 * - Sin gradients. Botones solidos o con borde, sin glows.
 * - Radius pequeno (4px). El boton es una herramienta, no marshmallow.
 * - `primary` usa el color signal (amarillo de senaletica vial) con texto
 *   ink, parsimonioso pero inequivoco. Hover solo cambia border/bg, no
 *   intenta levantar la pieza con shadow.
 */

import { cva } from 'class-variance-authority';

export const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 whitespace-nowrap',
    'rounded text-sm font-medium tracking-tight',
    'border border-transparent',
    'transition-colors duration-150',
    'focus:outline-none focus-visible:outline focus-visible:outline-1',
    'focus-visible:outline-offset-2 focus-visible:outline-primary',
    'disabled:pointer-events-none disabled:opacity-40'
  ].join(' '),
  {
    variants: {
      variant: {
        // Solido signal yellow sobre ink. CTA primario.
        default: 'bg-primary text-primary-foreground hover:bg-[var(--signal-bright)]',
        // Alias historico: ahora apunta al mismo estilo que default (sin
        // gradient cyan/emerald). Mantenido por compat con consumidores.
        primary: 'bg-primary text-primary-foreground hover:bg-[var(--signal-bright)]',
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
