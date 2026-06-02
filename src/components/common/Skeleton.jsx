/**
 * Skeleton
 *
 * Componente de loading placeholder que reemplaza spinners
 * con un efecto de pulso mas profesional.
 */

import { memo } from 'react';
import { cn } from '../../utils';

/**
 * Componente base de skeleton con animacion pulse
 */
const Skeleton = memo(function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-muted/60', className)}
      aria-hidden="true"
      {...props}
    />
  );
});

/**
 * Skeleton para filas de tabla
 * @param {Object} props
 * @param {number} [props.rows=5] - Numero de filas skeleton
 * @param {number} [props.columns=5] - Numero de columnas por fila
 */
const TableSkeleton = memo(function TableSkeleton({ rows = 5, columns = 5 }) {
  return (
    <div className="flex flex-col gap-3 py-4" role="status" aria-live="polite" aria-label="Cargando tabla">
      <div className="flex gap-4 pb-3 border-b border-border/60">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={`header-${i}`} className="h-4 flex-1" />
        ))}
      </div>

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
});

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

const StatsSkeleton = memo(function StatsSkeleton({ count = 4 }) {
  return (
    <div
      className={cn('grid gap-4', GRID_COLS[count] || GRID_COLS[4])}
      role="status"
      aria-live="polite"
      aria-label="Cargando estadisticas"
    >
      {Array.from({ length: count }).map((_, i) => (
        <div key={`stat-${i}`} className="p-4 rounded-lg border border-border bg-card">
          <Skeleton className="h-3 w-20 mb-3" />
          <Skeleton className="h-7 w-16 mb-2" />
          <Skeleton className="h-3 w-24" />
        </div>
      ))}
    </div>
  );
});

/**
 * Skeleton para una tarjeta generica (titulo + descripcion + cuerpo)
 * @param {Object} props
 * @param {number} [props.lines=3] - lineas de texto en el cuerpo
 */
const CardSkeleton = memo(function CardSkeleton({ lines = 3 }) {
  return (
    <div
      className="p-6 rounded-lg border border-border bg-card"
      role="status"
      aria-live="polite"
      aria-label="Cargando contenido"
    >
      <Skeleton className="h-5 w-1/3 mb-3" />
      <Skeleton className="h-3 w-2/3 mb-6" />
      <div className="flex flex-col gap-2">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton key={i} className={cn('h-3', i === lines - 1 ? 'w-2/3' : 'w-full')} />
        ))}
      </div>
    </div>
  );
});

// Alturas pseudoaleatorias estables para barras de chart skeleton.
// No se usa Math.random durante render (efecto secundario impuro)
const ALTURAS_BARRAS_CHART = [42, 78, 55, 88, 36, 72, 60, 48];

/**
 * Skeleton para grafica/chart con eje y leyendas
 */
const ChartSkeleton = memo(function ChartSkeleton({ height = 320 }) {
  return (
    <div
      className="p-6 rounded-lg border border-border bg-card"
      style={{ minHeight: height }}
      role="status"
      aria-live="polite"
      aria-label="Cargando grafica"
    >
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-5 w-1/4" />
        <Skeleton className="h-3 w-1/6" />
      </div>
      <div className="flex items-end gap-2 h-48">
        {ALTURAS_BARRAS_CHART.map((altura, i) => (
          <Skeleton
            key={i}
            className="flex-1"
            style={{ height: `${altura}%` }}
          />
        ))}
      </div>
      <div className="flex items-center justify-center gap-4 mt-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <Skeleton className="size-3 rounded-full" />
            <Skeleton className="h-3 w-12" />
          </div>
        ))}
      </div>
    </div>
  );
});

export { Skeleton, TableSkeleton, StatsSkeleton, CardSkeleton, ChartSkeleton };
