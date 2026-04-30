/**
 * Componente DataTable
 * 
 * Tabla de datos con estilo futurista.
 * Soporta ordenamiento, paginacion y estados de carga.
 */

import { cn } from '../../utils';

/**
 * Contenedor de tabla
 * Pasa rowCount o colCount para emitir aria-rowcount/aria-colcount cuando aplique
 */
function Table({ className, rowCount, colCount, label, ...props }) {
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
}

/**
 * Cabecera de tabla
 */
function TableHeader({ className, ...props }) {
  return (
    <thead className={cn('border-b border-border', className)} {...props} />
  );
}

/**
 * Cuerpo de tabla
 */
function TableBody({ className, ...props }) {
  return (
    <tbody className={cn('[&_tr:last-child]:border-0', className)} {...props} />
  );
}

/**
 * Pie de tabla
 */
function TableFooter({ className, ...props }) {
  return (
    <tfoot
      className={cn(
        'border-t border-border bg-muted/40 font-medium',
        className
      )}
      {...props}
    />
  );
}

/**
 * Fila de tabla
 */
function TableRow({ className, ...props }) {
  return (
    <tr
      className={cn(
        'border-b border-border/60 transition-colors hover:bg-muted/30',
        className
      )}
      {...props}
    />
  );
}

/**
 * Celda de cabecera
 * Acepta sortDirection ('asc'|'desc'|'none') para emitir aria-sort
 */
function TableHead({ className, sortDirection, ...props }) {
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
}

/**
 * Celda de datos
 */
function TableCell({ className, ...props }) {
  return (
    <td
      className={cn(
        'p-4 align-middle text-foreground [&:has([role=checkbox])]:pr-0',
        className
      )}
      {...props}
    />
  );
}

/**
 * Caption de tabla
 */
function TableCaption({ className, ...props }) {
  return (
    <caption
      className={cn('mt-4 text-sm text-muted-foreground', className)}
      {...props}
    />
  );
}

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
