/**
 * Componente EmptyState
 *
 * Estado vacio para cuando no hay datos que mostrar.
 */

import { memo } from 'react';
import { Inbox } from 'lucide-react';
import { cn } from '../../utils';

/**
 * Estado vacio con icono y mensaje
 * @param {Object} props - Props del componente
 * @param {string} [props.title] - Titulo del estado vacio
 * @param {string} [props.description] - Descripcion adicional
 * @param {React.ReactNode} [props.icon] - Icono personalizado
 * @param {React.ReactNode} [props.action] - Accion opcional (boton)
 * @param {string} [props.className] - Clases adicionales
 */
const EmptyState = memo(function EmptyState({
  title = 'No hay datos',
  description = 'No se encontraron resultados para mostrar.',
  icon = Inbox,
  action,
  className
}) {
  const IconoComponente = icon;
  return (
    <div className={cn(
      'flex flex-col items-center justify-center py-12 px-4 text-center',
      className
    )}>
      <div className="rounded-full bg-muted p-4 mb-4">
        <IconoComponente className="size-8 text-muted-foreground" aria-hidden="true" />
      </div>
      <h3 className="text-lg font-medium text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-4">{description}</p>
      {action}
    </div>
  );
});

export { EmptyState };
