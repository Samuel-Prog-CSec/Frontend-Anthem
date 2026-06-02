/**
 * Componente Tooltip basado en Radix UI Tooltip.
 *
 * Burbuja informativa que aparece al pasar el raton o enfocar con teclado
 * sobre un elemento ancla. Respeta `prefers-reduced-motion` y se cierra
 * automaticamente al perder el foco.
 *
 * Uso (recordar envolver el subarbol en `TooltipProvider` cerca de la raiz):
 * <TooltipProvider>
 *   <Tooltip>
 *     <TooltipTrigger asChild><Button>Hover me</Button></TooltipTrigger>
 *     <TooltipContent>Texto informativo</TooltipContent>
 *   </Tooltip>
 * </TooltipProvider>
 */

import { forwardRef } from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { cn } from '../../utils';

const TooltipProvider = TooltipPrimitive.Provider;
const Tooltip = TooltipPrimitive.Root;
const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipContent = forwardRef(function TooltipContent({
  className,
  sideOffset = 4,
  ...props
}, ref) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        ref={ref}
        sideOffset={sideOffset}
        className={cn(
          'z-50 overflow-hidden rounded-md border border-[var(--border-emphasis)] bg-popover px-3 py-1.5 text-xs text-foreground',
          className
        )}
        {...props}
      />
    </TooltipPrimitive.Portal>
  );
});
TooltipContent.displayName = 'TooltipContent';

export { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent };
