/**
 * ThemeToggle - alterna entre tema oscuro ("plano nocturno") y claro
 * ("blanco tecnico"). Accesible: label y title dinamicos.
 */

import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context';
import { cn } from '../../utils';

/**
 * @param {Object} props
 * @param {string} [props.className]
 */
export function ThemeToggle({ className }) {
  const { esOscuro, alternarTema } = useTheme();
  const etiqueta = esOscuro ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro';

  return (
    <button
      type="button"
      onClick={alternarTema}
      className={cn(
        'inline-flex size-9 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground',
        className
      )}
      aria-label={etiqueta}
      title={etiqueta}
    >
      {esOscuro
        ? <Sun className="size-4" aria-hidden="true" />
        : <Moon className="size-4" aria-hidden="true" />}
    </button>
  );
}
