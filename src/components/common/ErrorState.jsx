/**
 * Componente ErrorState
 *
 * Estado de error con mensaje y opcion de reintentar.
 */

import { memo } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './Button';
import { cn } from '../../utils';

/**
 * Estado de error con opcion de reintento
 * @param {Object} props - Props del componente
 * @param {string} [props.title] - Titulo del error
 * @param {string} [props.message] - Mensaje de error
 * @param {Function} [props.onRetry] - Funcion para reintentar
 * @param {string} [props.className] - Clases adicionales
 */
const ErrorState = memo(function ErrorState({
  title = 'Error',
  message = 'Ha ocurrido un error al cargar los datos.',
  onRetry,
  className
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 px-4 text-center',
        className
      )}
      role="alert"
    >
      <div className="rounded-full bg-destructive/20 p-4 mb-4">
        <AlertCircle className="size-8 text-destructive" aria-hidden="true" />
      </div>
      <h3 className="text-lg font-medium text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-4">{message}</p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          <RefreshCw className="size-4 mr-2" aria-hidden="true" />
          Reintentar
        </Button>
      )}
    </div>
  );
});

export { ErrorState };
