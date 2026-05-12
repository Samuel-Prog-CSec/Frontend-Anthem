/**
 * Hook useSincronizarFiltroGeo
 *
 * Sincroniza el filtro de distrito local de una pagina con el filtro
 * geografico global del dashboard (FiltroGeoContext). Se usa en cada
 * pagina que tiene un filtro de distrito propio (Multas, Accidentes,
 * Patinetes, Contenedores, etc.) para que el distrito seleccionado se
 * preserve al navegar entre modulos.
 *
 * Comportamiento:
 *   - En mount: si hay filtro global y no hay filtro local, adopta el global.
 *   - Cuando el filtro local cambia a un valor no vacio: sincroniza al global.
 *   - El filtro local en blanco NO limpia el global (el usuario puede limpiar
 *     globalmente desde el chip del navbar; eso evita perder el filtro al
 *     limpiar inputs locales por error).
 *
 * @param {string} distritoLocal - Valor actual del filtro de distrito en la pagina.
 * @param {Function} aplicarDistritoLocal - Setter del filtro local. Recibe el distrito.
 * @returns {string|null} El distrito global actual (por si la pagina quiere mostrarlo).
 */

import { useEffect, useRef } from 'react';
import { useFiltroGeo } from './useFiltroGeo';

export function useSincronizarFiltroGeo(distritoLocal, aplicarDistritoLocal) {
  const { distrito: distritoGlobal, aplicarDistrito } = useFiltroGeo();
  const adoptedRef = useRef(false);

  // Adoptar filtro global al montar (una sola vez)
  useEffect(() => {
    if (adoptedRef.current) {return;}
    adoptedRef.current = true;
    if (distritoGlobal && !distritoLocal && typeof aplicarDistritoLocal === 'function') {
      aplicarDistritoLocal(distritoGlobal);
    }
    // Solo en mount; no queremos re-adoptar si el global cambia despues
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sincronizar local -> global cuando local cambia a valor no vacio
  useEffect(() => {
    if (distritoLocal && distritoLocal !== distritoGlobal) {
      aplicarDistrito(distritoLocal);
    }
  }, [distritoLocal, distritoGlobal, aplicarDistrito]);

  return distritoGlobal;
}
