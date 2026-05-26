/**
 * Helpers de Multas
 *
 * Funciones puras compartidas por los sub-componentes. Sin React, sin
 * efectos secundarios, faciles de probar.
 */

import { CALIFICACIONES_MULTA } from '../../constants';

/**
 * Devuelve la variante del Badge segun la calificacion de una multa.
 *
 * @param {string} calificacion - CALIFICACIONES_MULTA.LEVE | GRAVE | MUY_GRAVE
 * @returns {string} variante semantica para el componente Badge
 */
export function obtenerVarianteBadgeCalificacion(calificacion) {
  switch (calificacion) {
    case CALIFICACIONES_MULTA.LEVE: return 'info';
    case CALIFICACIONES_MULTA.GRAVE: return 'warning';
    case CALIFICACIONES_MULTA.MUY_GRAVE: return 'destructive';
    default: return 'secondary';
  }
}

/**
 * Formatea un importe en euros con separadores de miles europeos.
 *
 * @param {number} valor - Valor numerico en euros
 * @returns {string} valor formateado o '-' si null/undefined/NaN
 */
export function formatearImporte(valor) {
  if (valor === null || valor === undefined || isNaN(valor)) return '-';
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(valor);
}
