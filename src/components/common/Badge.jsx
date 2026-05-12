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

/**
 * Etiqueta de estado
 * @param {Object} props - Props del componente
 * @param {string} [props.className] - Clases adicionales
 * @param {string} [props.variant] - Variante de color
 */
const Badge = memo(function Badge({ className, variant, ...props }) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
});

export { Badge };
