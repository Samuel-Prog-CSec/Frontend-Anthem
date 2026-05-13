/**
 * Componente Popover basado en Radix UI Popover.
 *
 * Contenedor flotante posicionado contra un elemento ancla. Util para
 * filtros avanzados, leyendas de mapas, selectores de fecha custom, etc.
 *
 * Uso:
 * <Popover>
 *   <PopoverTrigger asChild><Button>Filtros</Button></PopoverTrigger>
 *   <PopoverContent>
 *     <p>Contenido del popover</p>
 *   </PopoverContent>
 * </Popover>
 */

import { forwardRef } from 'react';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { cn } from '../../utils';

const Popover = PopoverPrimitive.Root;
const PopoverTrigger = PopoverPrimitive.Trigger;
const PopoverAnchor = PopoverPrimitive.Anchor;

const PopoverContent = forwardRef(function PopoverContent({
  className,
  align = 'center',
  sideOffset = 4,
  ...props
}, ref) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        ref={ref}
        align={align}
        sideOffset={sideOffset}
        className={cn(
          'z-50 w-72 rounded-md border border-border bg-card p-4 text-foreground shadow-md outline-none',
          'data-[state=open]:animate-in data-[state=closed]:animate-out',
          'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
          'data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2',
          'data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2',
          className
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  );
});
PopoverContent.displayName = 'PopoverContent';

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor };
