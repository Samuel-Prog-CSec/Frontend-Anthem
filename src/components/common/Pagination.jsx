/**
 * Componente Pagination
 *
 * Control de paginacion para listas de datos.
 */

import { memo } from 'react';
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
const Pagination = memo(function Pagination({
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
    <nav
      role="navigation"
      aria-label="Paginacion"
      className={cn(
        'flex items-center justify-between px-2 py-4',
        className
      )}
    >
      <div className="text-sm text-muted-foreground" aria-live="polite">
        {totalItems === 0
          ? 'No hay registros'
          : `Mostrando ${startItem} - ${endItem} de ${totalItems} registros`
        }
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onPageChange(1)}
          disabled={!canGoPrevious}
          aria-label="Primera pagina"
        >
          <ChevronsLeft className="size-4" aria-hidden="true" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!canGoPrevious}
          aria-label="Pagina anterior"
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
        </Button>

        <span className="px-4 text-sm text-foreground" aria-current="page">
          Pagina {currentPage} de {totalPages}
        </span>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!canGoNext}
          aria-label="Pagina siguiente"
        >
          <ChevronRight className="size-4" aria-hidden="true" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => onPageChange(totalPages)}
          disabled={!canGoNext}
          aria-label="Ultima pagina"
        >
          <ChevronsRight className="size-4" aria-hidden="true" />
        </Button>
      </div>
    </nav>
  );
});

export { Pagination };
