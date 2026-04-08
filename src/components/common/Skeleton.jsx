/**
 * Skeleton
 *
 * Componente de loading placeholder que reemplaza spinners
 * con un efecto de pulso mas profesional.
 */

import { cn } from '../../utils';

/**
 * Componente base de skeleton con animacion pulse
 */
function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-slate-700/50', className)}
      {...props}
    />
  );
}

/**
 * Skeleton para filas de tabla
 * @param {Object} props
 * @param {number} [props.rows=5] - Numero de filas skeleton
 * @param {number} [props.columns=5] - Numero de columnas por fila
 */
function TableSkeleton({ rows = 5, columns = 5 }) {
  return (
    <div className="space-y-3 py-4">
      {/* Header skeleton */}
      <div className="flex gap-4 pb-3 border-b border-slate-700/50">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={`header-${i}`} className="h-4 flex-1" />
        ))}
      </div>

      {/* Row skeletons */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={`row-${rowIndex}`} className="flex gap-4 py-2">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton
              key={`cell-${rowIndex}-${colIndex}`}
              className={cn('h-4 flex-1', colIndex === 0 && 'max-w-[120px]')}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton para tarjetas de estadisticas
 * @param {Object} props
 * @param {number} [props.count=4] - Numero de tarjetas skeleton
 */
const GRID_COLS = {
  2: 'grid-cols-2 md:grid-cols-2',
  3: 'grid-cols-2 md:grid-cols-3',
  4: 'grid-cols-2 md:grid-cols-4',
  5: 'grid-cols-2 md:grid-cols-5',
  6: 'grid-cols-2 md:grid-cols-6'
};

function StatsSkeleton({ count = 4 }) {
  return (
    <div className={cn('grid gap-4', GRID_COLS[count] || GRID_COLS[4])}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={`stat-${i}`} className="p-4 rounded-lg border border-slate-700/50 bg-slate-800/50">
          <Skeleton className="h-3 w-20 mb-3" />
          <Skeleton className="h-7 w-16 mb-2" />
          <Skeleton className="h-3 w-24" />
        </div>
      ))}
    </div>
  );
}

export { Skeleton, TableSkeleton, StatsSkeleton };
