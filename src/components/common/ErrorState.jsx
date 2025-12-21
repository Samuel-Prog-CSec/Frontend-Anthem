/**
 * Componente ErrorState
 * 
 * Estado de error con mensaje y opcion de reintentar.
 */

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
function ErrorState({ 
  title = 'Error', 
  message = 'Ha ocurrido un error al cargar los datos.',
  onRetry,
  className 
}) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center py-12 px-4 text-center',
      className
    )}>
      <div className="rounded-full bg-red-900/30 p-4 mb-4">
        <AlertCircle className="h-8 w-8 text-red-400" />
      </div>
      <h3 className="text-lg font-medium text-white mb-1">{title}</h3>
      <p className="text-sm text-slate-400 max-w-sm mb-4">{message}</p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Reintentar
        </Button>
      )}
    </div>
  );
}

export { ErrorState };
