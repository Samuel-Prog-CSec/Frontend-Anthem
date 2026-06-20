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
 *   - Cuando el usuario VACIA el filtro local (opcion "Todos" o boton "Limpiar"),
 *     se limpia tambien el global (y su chip), para que ambos queden coherentes.
 *     El vaciado del mount NO cuenta (guard `prevLocal`): solo una transicion
 *     real "valor -> vacio" dispara la limpieza global.
 *   - Cuando se limpia el global desde el chip del navbar, se suelta el local
 *     (sin que el efecto local->global lo vuelva a re-aplicar: guard `limpiando`).
 *
 * @param {string} distritoLocal - Valor actual del filtro de distrito en la pagina.
 * @param {Function} aplicarDistritoLocal - Setter del filtro local. Recibe el distrito.
 * @returns {string|null} El distrito global actual (por si la pagina quiere mostrarlo).
 */

import { useEffect, useRef } from 'react';
import { useFiltroGeo } from './useFiltroGeo';

export function useSincronizarFiltroGeo(distritoLocal, aplicarDistritoLocal) {
  const { distrito: distritoGlobal, aplicarDistrito, limpiarFiltro } = useFiltroGeo();
  const adoptedRef = useRef(false);
  const prevGlobalRef = useRef(distritoGlobal);
  const prevLocalRef = useRef(distritoLocal);
  const limpiandoRef = useRef(false);

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

  // Propagar limpieza global -> local. Si el usuario limpia el filtro global
  // (chip "Quitar filtro geografico" -> limpiarFiltro), la pagina debe soltar
  // tambien su filtro local; sin esto, el efecto local->global de abajo volveria
  // a aplicar al instante el distrito que la pagina aun conserva (p.ej. en la URL
  // `?distrito=`), dejando el filtro "pegado" e imposible de quitar.
  // DEBE declararse antes que el efecto local->global para que `limpiandoRef`
  // ya este puesto cuando aquel se evalua en el mismo commit (evita la carrera).
  useEffect(() => {
    const prevGlobal = prevGlobalRef.current;
    prevGlobalRef.current = distritoGlobal;
    if (prevGlobal && !distritoGlobal) {
      limpiandoRef.current = true;
      if (distritoLocal && typeof aplicarDistritoLocal === 'function') {
        aplicarDistritoLocal('');
      }
    }
  }, [distritoGlobal, distritoLocal, aplicarDistritoLocal]);

  // Sincronizar local <-> global:
  //  - local pasa a un valor no vacio -> aplicarlo al global.
  //  - local pasa de un valor a vacio por accion del usuario (Select "Todos" o
  //    boton "Limpiar") -> limpiar tambien el global (y su chip).
  // Se omite una vez tras una limpieza global (limpiandoRef) para no re-disparar
  // sobre el local que se esta soltando; el flag se resetea cuando local ya esta
  // vacio. `prevLocal` evita falsos positivos en el mount (el local arranca vacio
  // sin que sea una limpieza del usuario).
  useEffect(() => {
    const prevLocal = prevLocalRef.current;
    prevLocalRef.current = distritoLocal;

    if (limpiandoRef.current) {
      if (!distritoLocal) { limpiandoRef.current = false; }
      return;
    }
    if (distritoLocal) {
      if (distritoLocal !== distritoGlobal) { aplicarDistrito(distritoLocal); }
    } else if (prevLocal && distritoGlobal) {
      limpiarFiltro();
    }
  }, [distritoLocal, distritoGlobal, aplicarDistrito, limpiarFiltro]);

  return distritoGlobal;
}
