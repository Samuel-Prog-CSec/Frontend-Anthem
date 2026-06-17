/**
 * Componente Button
 *
 * Boton reutilizable con multiples variantes y tamanos.
 * Basado en patrones de Shadcn/ui.
 *
 * Soporta `asChild`: cuando es `true`, en vez de renderizar un `<button>`
 * propio, se clona el hijo y se le inyectan las props (className, ref,
 * eventos). Esto permite usar el estilo de Button sobre un `<Link>`,
 * `<a>` u otro elemento sin anidar `<button>` dentro y sin que React
 * tire el warning "asChild prop on a DOM element" — antes el componente
 * pasaba `asChild` al `<button>` HTML directamente.
 *
 * Documentacion de referencia:
 * - Shadcn/ui Button: https://ui.shadcn.com/docs/components/button
 * - Radix Slot: https://www.radix-ui.com/primitives/docs/utilities/slot
 * - class-variance-authority: https://cva.style/docs
 */

import { forwardRef, memo } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '../../utils';
import { buttonVariants } from './buttonVariants';

/**
 * Boton con variantes de estilo
 * @param {Object} props - Props del componente
 * @param {string} [props.className] - Clases adicionales
 * @param {string} [props.variant] - Variante: 'default', 'primary', 'destructive', 'outline', 'secondary', 'ghost', 'link'
 * @param {string} [props.size] - Tamano: 'default', 'sm', 'lg', 'icon'
 * @param {boolean} [props.isLoading] - Muestra estado de carga
 * @param {boolean} [props.asChild] - Si true, clona el hijo y le aplica los estilos del Button en vez de renderizar un <button>
 */
const Button = memo(forwardRef(({
  className,
  variant,
  size,
  isLoading = false,
  asChild = false,
  children,
  disabled,
  ...props
}, ref) => {
  const Comp = asChild ? Slot : 'button';

  // En modo asChild no podemos pasar `disabled` (no es atributo HTML
  // valido en un <a>/<Link>) ni el spinner de carga: el caller decide la
  // semantica de su elemento clonado.
  if (asChild) {
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        {children}
      </Comp>
    );
  }

  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      disabled={disabled || isLoading}
      aria-busy={isLoading ? 'true' : undefined}
      {...props}
    >
      {isLoading ? (
        <>
          <svg
            className="motion-safe:animate-spin size-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Procesando...</span>
        </>
      ) : children}
    </button>
  );
}));

Button.displayName = 'Button';

export { Button };
