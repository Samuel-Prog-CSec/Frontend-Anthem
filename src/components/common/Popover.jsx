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
          'z-50 w-72 rounded-md border border-[var(--border-emphasis)] bg-popover p-4 text-foreground outline-none',
          className
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  );
});
PopoverContent.displayName = 'PopoverContent';

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor };
