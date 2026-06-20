/**
 * Context de Filtro Geografico Global (BI cross-project).
 *
 * Permite que el usuario seleccione un distrito (y opcionalmente un barrio)
 * en cualquier modulo del dashboard y que ese filtro se preserve al navegar
 * a otro modulo. Los modulos individuales (Multas, Accidentes, Patinetes,
 * Contenedores, etc.) leen este filtro al montar y lo aplican como filtro
 * inicial; cualquier cambio en el filtro local de la pagina sincroniza
 * tambien el filtro global para que se mantenga al navegar.
 *
 * Persistencia: sessionStorage (scope por pestaña, no localStorage para
 * evitar persistir entre sesiones distintas).
 *
 * El hook `useFiltroGeo` vive en `useFiltroGeo.js` para HMR fiable.
 */

import { createContext, useState, useCallback, useEffect, useMemo } from 'react';

const STORAGE_KEY = 'anthem.filtroGeo';

/** Forma del estado: { distrito: string|null, barrio: string|null, codigoDistrito: number|null } */
const ESTADO_VACIO = Object.freeze({
  distrito: null,
  barrio: null,
  codigoDistrito: null
});

function leerStorage() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) {return ESTADO_VACIO;}
    const parsed = JSON.parse(raw);
    return {
      distrito: parsed.distrito || null,
      barrio: parsed.barrio || null,
      codigoDistrito: parsed.codigoDistrito || null
    };
  } catch {
    return ESTADO_VACIO;
  }
}

function escribirStorage(estado) {
  try {
    if (!estado.distrito && !estado.barrio) {
      sessionStorage.removeItem(STORAGE_KEY);
    } else {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(estado));
    }
  } catch {
    // sessionStorage puede fallar en modo incognito; degradamos silenciosamente
  }
}

const FiltroGeoContext = createContext(null);

export function FiltroGeoProvider({ children }) {
  const [filtro, setFiltro] = useState(() => leerStorage());

  // Sincronizar a sessionStorage en cada cambio
  useEffect(() => {
    escribirStorage(filtro);
  }, [filtro]);

  const aplicarDistrito = useCallback((distrito, codigoDistrito = null) => {
    setFiltro(prev => {
      // Si el distrito cambia, resetear barrio
      if (prev.distrito !== distrito) {
        return { distrito: distrito || null, barrio: null, codigoDistrito: codigoDistrito || null };
      }
      return { ...prev, codigoDistrito: codigoDistrito || prev.codigoDistrito };
    });
  }, []);

  const aplicarBarrio = useCallback((barrio) => {
    setFiltro(prev => ({ ...prev, barrio: barrio || null }));
  }, []);

  const aplicarFiltroCompleto = useCallback((nuevo) => {
    setFiltro({
      distrito: nuevo?.distrito || null,
      barrio: nuevo?.barrio || null,
      codigoDistrito: nuevo?.codigoDistrito || null
    });
  }, []);

  const limpiarFiltro = useCallback(() => {
    setFiltro(ESTADO_VACIO);
  }, []);

  const value = useMemo(() => ({
    distrito: filtro.distrito,
    barrio: filtro.barrio,
    codigoDistrito: filtro.codigoDistrito,
    tieneFiltro: Boolean(filtro.distrito || filtro.barrio),
    aplicarDistrito,
    aplicarBarrio,
    aplicarFiltroCompleto,
    limpiarFiltro
  }), [filtro, aplicarDistrito, aplicarBarrio, aplicarFiltroCompleto, limpiarFiltro]);

  return (
    <FiltroGeoContext.Provider value={value}>
      {children}
    </FiltroGeoContext.Provider>
  );
}

export default FiltroGeoContext;
