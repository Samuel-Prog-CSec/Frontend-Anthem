/**
 * Helpers de AforoBicicletas
 */

import { FRANJAS_HORARIAS } from '../../constants';

/**
 * Variante semantica del Badge segun la franja horaria del aforo.
 */
export function obtenerVarianteBadgeFranja(franja) {
  switch (franja) {
    case FRANJAS_HORARIAS.MADRUGADA: return 'secondary';
    case FRANJAS_HORARIAS.MAÑANA: return 'info';
    case FRANJAS_HORARIAS.MEDIODIA: return 'success';
    case FRANJAS_HORARIAS.TARDE: return 'warning';
    case FRANJAS_HORARIAS.NOCHE: return 'purple';
    default: return 'secondary';
  }
}

/**
 * Convierte una franja horaria al rango [horaMin, horaMax] usado por la
 * API de aforo (compatible con MADRUGADA/MAÑANA/MEDIODIA/TARDE/NOCHE).
 */
export function rangoHorarioDeFranja(franjaHoraria) {
  const rangos = {
    MADRUGADA: { min: 0, max: 5 },
    MAÑANA: { min: 6, max: 11 },
    MEDIODIA: { min: 12, max: 14 },
    TARDE: { min: 15, max: 20 },
    NOCHE: { min: 21, max: 23 }
  };
  return rangos[franjaHoraria] || null;
}
