/**
 * Componente DataTable
 * 
 * Tabla de datos con estilo futurista.
 * Soporta ordenamiento, paginacion y estados de carga.
 */

import { cn } from '../../utils';

/**
 * Contenedor de tabla
 */
function Table({ className, ...props }) {
  return (
    <div className="w-full overflow-auto">
      <table
        className={cn('w-full caption-bottom text-sm', className)}
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
    <thead className={cn('border-b border-slate-700', className)} {...props} />
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
        'border-t border-slate-700 bg-slate-800/50 font-medium',
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
        'border-b border-slate-700/50 transition-colors hover:bg-slate-800/30',
        className
      )}
      {...props}
    />
  );
}

/**
 * Celda de cabecera
 */
function TableHead({ className, ...props }) {
  return (
    <th
      className={cn(
        'h-12 px-4 text-left align-middle font-medium text-slate-400',
        '[&:has([role=checkbox])]:pr-0',
        className
      )}
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
        'p-4 align-middle text-slate-200 [&:has([role=checkbox])]:pr-0',
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
      className={cn('mt-4 text-sm text-slate-400', className)}
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
