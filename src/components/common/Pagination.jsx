/**
 * Componente Pagination
 * 
 * Control de paginacion para listas de datos.
 */

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Button } from './Button';
import { cn } from '../../utils';

/**
 * Control de paginacion
 * @param {Object} props - Props del componente
 * @param {number} props.currentPage - Pagina actual
 * @param {number} props.totalPages - Total de paginas
 * @param {number} props.totalItems - Total de items
 * @param {number} props.itemsPerPage - Items por pagina
 * @param {Function} props.onPageChange - Callback al cambiar pagina
 * @param {string} [props.className] - Clases adicionales
 */
function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  className
}) {
  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  // Calcular rango de items mostrados
  const startItem = totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className={cn(
      'flex items-center justify-between px-2 py-4',
      className
    )}>
      {/* Info de registros */}
      <div className="text-sm text-slate-400">
        {totalItems === 0
          ? 'No hay registros'
          : `Mostrando ${startItem} - ${endItem} de ${totalItems} registros`
        }
      </div>

      {/* Controles de navegacion */}
      <div className="flex items-center gap-1">
        {/* Primera pagina */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onPageChange(1)}
          disabled={!canGoPrevious}
          aria-label="Primera pagina"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>

        {/* Pagina anterior */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!canGoPrevious}
          aria-label="Pagina anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Indicador de pagina */}
        <span className="px-4 text-sm text-slate-300">
          Pagina {currentPage} de {totalPages}
        </span>

        {/* Pagina siguiente */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!canGoNext}
          aria-label="Pagina siguiente"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        {/* Ultima pagina */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onPageChange(totalPages)}
          disabled={!canGoNext}
          aria-label="Ultima pagina"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export { Pagination };
