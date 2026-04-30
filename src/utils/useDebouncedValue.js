/**
 * Hook useDebouncedValue
 *
 * Retrasa la propagacion de un valor hasta que pasa un periodo sin cambios.
 * Util para inputs de busqueda: evita lanzar una request por cada tecla pulsada.
 *
 * @param {*} value - Valor que se quiere retrasar
 * @param {number} delay - Milisegundos a esperar (default 300)
 * @returns {*} Valor "estabilizado" tras el delay
 *
 * @example
 * const [busqueda, setBusqueda] = useState('');
 * const busquedaDebounced = useDebouncedValue(busqueda, 300);
 * // usar busquedaDebounced en queryKey de React Query
 */

import { useEffect, useState } from 'react';

export function useDebouncedValue(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const handle = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handle);
  }, [value, delay]);

  return debounced;
}
