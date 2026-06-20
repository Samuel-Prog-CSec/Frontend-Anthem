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

// Valor centinela para la opcion "limpiar". Radix no admite un Item con
// value="" (lo reserva para "sin seleccion"), asi que usamos este centinela y
// al elegirlo emitimos '' al consumidor para deseleccionar el filtro.
const VALOR_LIMPIAR = '__limpiar__';

/**
 * Select compatible con la API previa (`options = [{value, label}]`).
 * Internamente envuelve Radix.Select.Root y compone Trigger + Content + Items.
 *
 * `opcionLimpiar` (string opcional): si se pasa y hay un valor seleccionado,
 * muestra una opcion al inicio del desplegable (p.ej. "Todos los distritos")
 * que deselecciona el filtro (emite onChange con value '').
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
  opcionLimpiar,
  ...rest
}, ref) {
  // Radix usa `onValueChange` (callback con string), nosotros exponemos `onChange`
  // que recibe un evento sintetico-like para compatibilidad con consumidores.
  const handleValueChange = (nextValue) => {
    if (typeof onChange !== 'function') {
      return;
    }
    // La opcion "limpiar" deselecciona el filtro (emite cadena vacia).
    const valorReal = nextValue === VALOR_LIMPIAR ? '' : nextValue;
    // Emular forma minima de evento para no romper handlers existentes
    onChange({ target: { name: name || id, value: valorReal } });
  };

  const valorActual = value === undefined || value === null ? '' : String(value);
  const mostrarLimpiar = Boolean(opcionLimpiar) && valorActual !== '';

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
          // Alineado con Input: superficie inset solida, foco con ring de marca,
          // hover a borde de enfasis.
          'flex h-10 w-full items-center justify-between rounded-md border border-[var(--border)] bg-[var(--surface-inset)] px-3 py-2 text-sm text-foreground',
          'placeholder:text-muted-foreground transition-colors duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--marca)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'hover:border-[var(--border-emphasis)]',
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
            // borders-only: borde de enfasis en vez de sombra; superficie popover.
            'relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border border-[var(--border-emphasis)] bg-popover text-foreground'
          )}
          position="popper"
          sideOffset={4}
        >
          <SelectPrimitive.ScrollUpButton className="flex cursor-default items-center justify-center py-1 text-muted-foreground">
            <ChevronUp className="size-4" aria-hidden="true" />
          </SelectPrimitive.ScrollUpButton>

          <SelectPrimitive.Viewport className="p-1 max-h-[var(--radix-select-content-available-height)]">
            {mostrarLimpiar && (
              <SelectPrimitive.Item
                value={VALOR_LIMPIAR}
                className={cn(
                  'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm italic text-muted-foreground outline-none',
                  'focus:bg-[var(--surface-hover)] focus:text-foreground data-[highlighted]:bg-[var(--surface-hover)]'
                )}
              >
                <SelectPrimitive.ItemText>{opcionLimpiar}</SelectPrimitive.ItemText>
              </SelectPrimitive.Item>
            )}
            {options.map((option) => (
              <SelectPrimitive.Item
                key={option.value ?? '__empty__'}
                value={option.value === undefined || option.value === null ? '' : String(option.value)}
                className={cn(
                  'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none',
                  'focus:bg-[var(--surface-hover)] focus:text-foreground data-[highlighted]:bg-[var(--surface-hover)]',
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
