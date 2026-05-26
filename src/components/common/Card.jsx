/**
 * Componente Card
 *
 * Contenedor de tarjeta con estilo futurista para el dashboard.
 * Basado en patrones de Shadcn/ui.
 *
 * Documentacion de referencia:
 * - Shadcn/ui Card: https://ui.shadcn.com/docs/components/card
 *
 * Todos los subcomponentes estan envueltos en `memo` porque suelen recibir
 * props estables (className, hijos jsx) y se renderizan en cantidad: una
 * pagina del dashboard puede contener decenas de Card. Sin memo, cualquier
 * cambio de estado en el padre provoca re-render en cascada.
 */

import { forwardRef, memo } from 'react';
import { cn } from '../../utils';

/**
 * Contenedor principal de la tarjeta
 */
const Card = memo(forwardRef(({ className, hover = false, glow = false, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      // Anti AI-slop: rounded-xl en lugar de 2xl (menos "marshmallow"),
      // shadow sutil en lugar de shadow-xl agresivo, sin translate-y en
      // hover por defecto (la accion solo ocurre cuando hover=true).
      'rounded-xl border border-border/60 bg-card/60 text-card-foreground backdrop-blur-sm shadow-sm',
      'transition-colors duration-200',
      hover && 'hover:border-border hover:bg-card/80',
      glow && 'hover:shadow-primary/10',
      className
    )}
    {...props}
  />
)));
Card.displayName = 'Card';

/**
 * Cabecera de la tarjeta
 */
const CardHeader = memo(forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col gap-2 p-6 pb-4', className)}
    {...props}
  />
)));
CardHeader.displayName = 'CardHeader';

/**
 * Titulo de la tarjeta.
 *
 * Por defecto se renderiza como `<h3>` para preservar el comportamiento
 * historico, pero acepta `as="h2"` (u otro nivel) cuando el CardTitle
 * funciona como heading principal de una pagina. Esto evita saltos en
 * la jerarquia de encabezados (h1 -> h3) que rompen accesibilidad
 * (WCAG 1.3.1 - estructura semantica).
 *
 * @example
 *   <CardTitle as="h2">Aforo de peatones</CardTitle>
 */
const CardTitle = memo(forwardRef(({ as = 'h3', className, ...props }, ref) => {
  // ESLint con JSX no siempre detecta el uso de una variable destructurada
  // como tag dinamico (`<Component .../>`). Asignar a una variable local con
  // mayuscula sortea la regla sin necesidad de disable-comment.
  const Heading = as;
  return (
    <Heading
      ref={ref}
      className={cn(
        'font-display text-lg font-bold leading-tight tracking-tight text-foreground',
        className
      )}
      {...props}
    />
  );
}));
CardTitle.displayName = 'CardTitle';

/**
 * Descripcion de la tarjeta
 */
const CardDescription = memo(forwardRef(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-muted-foreground leading-relaxed', className)}
    {...props}
  />
)));
CardDescription.displayName = 'CardDescription';

/**
 * Contenido principal de la tarjeta
 */
const CardContent = memo(forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
)));
CardContent.displayName = 'CardContent';

/**
 * Pie de la tarjeta
 */
const CardFooter = memo(forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center p-6 pt-4', className)}
    {...props}
  />
)));
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
