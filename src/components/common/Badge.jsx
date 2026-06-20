/**
 * Componente Badge
 *
 * Etiqueta o insignia para mostrar estado o categoria.
 * Basado en patrones de Shadcn/ui.
 *
 * Documentacion de referencia:
 * - Shadcn/ui Badge: https://ui.shadcn.com/docs/components/badge
 */

import { memo } from 'react';
import { cn } from '../../utils';
import { badgeVariants } from './badgeVariants';

// Variantes de estado que anaden un punto (canal de forma ademas del color)
// para no depender solo del color (WCAG 1.4.1).
const VARIANTES_CON_PUNTO = new Set(['success', 'warning', 'destructive', 'info', 'dominio']);

/**
 * Etiqueta de estado
 * @param {Object} props - Props del componente
 * @param {string} [props.className] - Clases adicionales
 * @param {string} [props.variant] - Variante de color
 */
const Badge = memo(function Badge({ className, variant, children, ...props }) {
  const conPunto = VARIANTES_CON_PUNTO.has(variant);
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      {conPunto && (
        <span className="size-1.5 shrink-0 rounded-full bg-current" aria-hidden="true" />
      )}
      {children}
    </span>
  );
});

export { Badge };
