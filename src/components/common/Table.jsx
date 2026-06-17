/**
 * Componente DataTable
 *
 * Tabla de datos con estilo futurista.
 * Soporta ordenamiento, paginacion y estados de carga.
 */

import { memo } from 'react';
import { cn } from '../../utils';

/**
 * Contenedor de tabla
 * Pasa rowCount o colCount para emitir aria-rowcount/aria-colcount cuando aplique
 */
const Table = memo(function Table({ className, rowCount, colCount, label, ...props }) {
  return (
    <div className="w-full overflow-auto">
      <table
        className={cn('w-full caption-bottom text-sm', className)}
        aria-rowcount={rowCount}
        aria-colcount={colCount}
        aria-label={label}
        {...props}
      />
    </div>
  );
});

/**
 * Cabecera de tabla
 */
const TableHeader = memo(function TableHeader({ className, ...props }) {
  return (
    <thead className={cn('border-b border-border', className)} {...props} />
  );
});

/**
 * Cuerpo de tabla
 */
const TableBody = memo(function TableBody({ className, ...props }) {
  return (
    <tbody className={cn('[&_tr:last-child]:border-0', className)} {...props} />
  );
});

/**
 * Pie de tabla
 */
const TableFooter = memo(function TableFooter({ className, ...props }) {
  return (
    <tfoot
      className={cn(
        'border-t border-border bg-muted/40 font-medium',
        className
      )}
      {...props}
    />
  );
});

/**
 * Fila de tabla
 *
 * Si recibe `onClick`, se vuelve operable por teclado (focusable + Enter/Espacio)
 * y muestra un ring de foco. Resuelve el problema de accesibilidad de las filas
 * clicables (drill-down) que antes solo respondian al raton (WCAG 2.1.1).
 */
const TableRow = memo(function TableRow({ className, onClick, onKeyDown, ...props }) {
  const interactiva = typeof onClick === 'function';

  const manejarTecla = interactiva
    ? (e) => {
        if (onKeyDown) { onKeyDown(e); }
        if (e.defaultPrevented) { return; }
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(e);
        }
      }
    : onKeyDown;

  return (
    <tr
      className={cn(
        'border-b border-border/60 transition-colors hover:bg-muted/30',
        interactiva &&
          'cursor-pointer focus-visible:outline-none focus-visible:bg-[var(--surface-hover)] focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-[var(--marca)]',
        className
      )}
      onClick={onClick}
      onKeyDown={manejarTecla}
      tabIndex={interactiva ? 0 : undefined}
      {...props}
    />
  );
});

/**
 * Celda de cabecera
 * Acepta sortDirection ('asc'|'desc'|'none') para emitir aria-sort
 */
const TableHead = memo(function TableHead({ className, sortDirection, ...props }) {
  return (
    <th
      scope="col"
      className={cn(
        'h-12 px-4 text-left align-middle font-medium text-muted-foreground',
        '[&:has([role=checkbox])]:pr-0',
        className
      )}
      aria-sort={sortDirection}
      {...props}
    />
  );
});

/**
 * Celda de datos
 */
const TableCell = memo(function TableCell({ className, ...props }) {
  return (
    <td
      className={cn(
        'p-4 align-middle text-foreground [&:has([role=checkbox])]:pr-0',
        className
      )}
      {...props}
    />
  );
});

/**
 * Caption de tabla
 */
const TableCaption = memo(function TableCaption({ className, ...props }) {
  return (
    <caption
      className={cn('mt-4 text-sm text-muted-foreground', className)}
      {...props}
    />
  );
});

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption
};
