/**
 * Componente Pagination
 *
 * Control de paginacion para listas de datos. Soporta dos modos:
 *
 * 1. **Offset (por defecto):** paginador numerico clasico con primera, anterior,
 *    "Pagina X de Y", siguiente, ultima. Activado pasando `currentPage` +
 *    `totalPages` + `totalItems` + `itemsPerPage` + `onPageChange`.
 *
 * 2. **Cursor:** boton "Cargar mas" para datasets con paginacion por cursor
 *    (`hasNextPage`, `nextCursor`). Activado pasando `mode="cursor"` +
 *    `hasNextPage` + `onLoadMore` (callback que recibe `nextCursor`).
 */

import { memo } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Loader2 } from 'lucide-react';
import { Button } from './Button';
import { cn } from '../../utils';

/**
 * Control de paginacion en modo cursor (boton "Cargar mas").
 */
function PaginationCursor({
  hasNextPage,
  nextCursor,
  onLoadMore,
  isLoadingMore = false,
  itemsLoaded,
  className
}) {
  const handleClick = () => {
    if (typeof onLoadMore === 'function' && hasNextPage) {
      onLoadMore(nextCursor);
    }
  };

  return (
    <nav
      role="navigation"
      aria-label="Paginacion"
      className={cn('flex items-center justify-between px-2 py-4', className)}
    >
      <div className="text-sm text-muted-foreground" aria-live="polite">
        {itemsLoaded != null
          ? `Mostrando ${itemsLoaded} registros`
          : 'Cargando...'}
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={handleClick}
        disabled={!hasNextPage || isLoadingMore}
        aria-label="Cargar mas registros"
      >
        {isLoadingMore && (
          <Loader2 className="size-4 mr-2 animate-spin" aria-hidden="true" />
        )}
        {hasNextPage ? 'Cargar mas' : 'No hay mas registros'}
      </Button>
    </nav>
  );
}

/**
 * Control de paginacion (offset o cursor segun la prop `mode`).
 *
 * @param {Object} props
 * @param {'offset'|'cursor'} [props.mode='offset'] - Modo de paginacion
 * @param {number} [props.currentPage] - (offset) Pagina actual
 * @param {number} [props.totalPages] - (offset) Total de paginas
 * @param {number} [props.totalItems] - (offset) Total de items
 * @param {number} [props.itemsPerPage] - (offset) Items por pagina
 * @param {Function} [props.onPageChange] - (offset) Callback al cambiar pagina
 * @param {boolean} [props.hasNextPage] - (cursor) Si hay siguiente pagina
 * @param {string} [props.nextCursor] - (cursor) Cursor para la siguiente pagina
 * @param {Function} [props.onLoadMore] - (cursor) Callback al pedir mas
 * @param {boolean} [props.isLoadingMore] - (cursor) Indicador de carga
 * @param {number} [props.itemsLoaded] - (cursor) Numero de registros cargados
 * @param {string} [props.className] - Clases adicionales
 */
const Pagination = memo(function Pagination(props) {
  const {
    mode = 'offset',
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    onPageChange,
    hasNextPage,
    nextCursor,
    onLoadMore,
    isLoadingMore = false,
    itemsLoaded,
    className
  } = props;

  if (mode === 'cursor') {
    return (
      <PaginationCursor
        hasNextPage={hasNextPage}
        nextCursor={nextCursor}
        onLoadMore={onLoadMore}
        isLoadingMore={isLoadingMore}
        itemsLoaded={itemsLoaded}
        className={className}
      />
    );
  }

  // Modo offset (default, comportamiento previo)
  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  const startItem = totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <nav
      role="navigation"
      aria-label="Paginacion"
      className={cn('flex items-center justify-between px-2 py-4', className)}
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
