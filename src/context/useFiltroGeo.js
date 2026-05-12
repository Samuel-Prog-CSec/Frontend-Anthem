/**
 * Hook useFiltroGeo
 *
 * Acceso al filtro geografico global (distrito/barrio activo en el
 * dashboard). Aislado del FiltroGeoContext.jsx para HMR fiable.
 */

import { useContext } from 'react';
import FiltroGeoContext from './FiltroGeoContext';

/**
 * @returns {Object} {
 *   distrito, barrio, codigoDistrito, tieneFiltro,
 *   aplicarDistrito, aplicarBarrio, aplicarFiltroCompleto, limpiarFiltro
 * }
 */
export function useFiltroGeo() {
  const context = useContext(FiltroGeoContext);
  if (!context) {
    throw new Error('useFiltroGeo debe usarse dentro de un FiltroGeoProvider');
  }
  return context;
}
