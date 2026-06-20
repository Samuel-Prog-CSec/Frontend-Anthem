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
  description,
  message,
  icon = Inbox,
  action,
  className
}) {
  const IconoComponente = icon;
  // `message` es un alias historico de `description`: varias paginas pasan
  // message= y antes se ignoraba silenciosamente. Se acepta para no perder
  // el texto especifico del estado vacio.
  const textoDescripcion = description ?? message ?? 'No se encontraron resultados para mostrar.';
  return (
    <div className={cn(
      'flex flex-col items-center justify-center py-12 px-4 text-center',
      className
    )}>
      <div className="mb-4 rounded-xl border border-dashed border-border bg-muted/40 p-4">
        <IconoComponente className="size-8 text-muted-foreground" aria-hidden="true" />
      </div>
      <h3 className="text-lg font-medium text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-4">{textoDescripcion}</p>
      {action}
    </div>
  );
});

export { EmptyState };
