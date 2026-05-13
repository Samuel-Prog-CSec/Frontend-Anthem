/**
 * Componente Select (Radix UI)
 *
 * Selector desplegable accesible basado en Radix UI Select. Reemplaza al
 * `<select>` HTML nativo manteniendo la misma API publica (props `options`,
 * `placeholder`, `value`, `onChange`, `className`, `disabled`) para no
 * romper los consumidores existentes en paginas y componentes.
 *
 * Ventajas vs select nativo:
 * - Estilado custom completo (no esta limitado a la UI del navegador)
 * - Keyboard navigation con tipeo rapido
 * - Soporte tactil mobile mejorado
 * - Aria-* correctos por defecto
 * - Animaciones suaves
 *
 * Documentacion de referencia:
 * - Radix UI Select: https://www.radix-ui.com/primitives/docs/components/select
 * - Shadcn/ui Select: https://ui.shadcn.com/docs/components/select
 */

import { forwardRef, memo } from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '../../utils';

/**
 * Select compatible con la API previa (`options = [{value, label}]`).
 * Internamente envuelve Radix.Select.Root y compone Trigger + Content + Items.
 */
const Select = memo(forwardRef(function Select({
  className,
  options = [],
  placeholder = 'Seleccionar...',
  value,
  onChange,
  disabled,
  name,
  id,
  ariaLabel,
  ...rest
}, ref) {
  // Radix usa `onValueChange` (callback con string), nosotros exponemos `onChange`
  // que recibe un evento sintetico-like para compatibilidad con consumidores.
  const handleValueChange = (nextValue) => {
    if (typeof onChange !== 'function') {
      return;
    }
    // Emular forma minima de evento para no romper handlers existentes
    onChange({ target: { name: name || id, value: nextValue } });
  };

  return (
    <SelectPrimitive.Root
      value={value === undefined || value === null ? '' : String(value)}
      onValueChange={handleValueChange}
      disabled={disabled}
      {...rest}
    >
      <SelectPrimitive.Trigger
        ref={ref}
        id={id}
        name={name}
        aria-label={ariaLabel}
        className={cn(
          'flex h-10 w-full items-center justify-between rounded-md border border-border bg-input/60 px-3 py-2 text-sm text-foreground',
          'placeholder:text-muted-foreground',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'hover:border-muted-foreground/40 transition-colors',
          'data-[placeholder]:text-muted-foreground',
          className
        )}
      >
        <SelectPrimitive.Value placeholder={placeholder} />
        <SelectPrimitive.Icon asChild>
          <ChevronDown className="size-4 text-muted-foreground" aria-hidden="true" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>

      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          className={cn(
            'relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border border-border bg-card text-foreground shadow-md',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
            'data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2'
          )}
          position="popper"
          sideOffset={4}
        >
          <SelectPrimitive.ScrollUpButton className="flex cursor-default items-center justify-center py-1 text-muted-foreground">
            <ChevronUp className="size-4" aria-hidden="true" />
          </SelectPrimitive.ScrollUpButton>

          <SelectPrimitive.Viewport className="p-1 max-h-[var(--radix-select-content-available-height)]">
            {options.map((option) => (
              <SelectPrimitive.Item
                key={option.value ?? '__empty__'}
                value={option.value === undefined || option.value === null ? '' : String(option.value)}
                className={cn(
                  'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none',
                  'focus:bg-muted focus:text-foreground',
                  'data-[disabled]:pointer-events-none data-[disabled]:opacity-50'
                )}
                disabled={option.disabled}
              >
                <span className="absolute left-2 flex size-4 items-center justify-center">
                  <SelectPrimitive.ItemIndicator>
                    <Check className="size-4 text-primary" aria-hidden="true" />
                  </SelectPrimitive.ItemIndicator>
                </span>
                <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>

          <SelectPrimitive.ScrollDownButton className="flex cursor-default items-center justify-center py-1 text-muted-foreground">
            <ChevronDown className="size-4" aria-hidden="true" />
          </SelectPrimitive.ScrollDownButton>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}));

Select.displayName = 'Select';

export { Select };
