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

// Prefijos de via reconocidos en el callejero. Necesarios para distinguir
// "075 AV CARDENAL HERRERA ORIA" (prefijo administrativo a limpiar) de
// "1 SUR F 40" (codigo de plaza de aparcamiento, conservar).
const PREFIJOS_VIA = /^(AV|AVD|AVDA|AVENIDA|CALLE|CL|CR|CTRA|CARRETERA|PASEO|PSEO|PS|PLAZA|PLZ|PZ|RONDA|RDA|GLORIETA|GTA|CAMINO|CMNO|TRAVESIA|TRAV|BULEVAR|BV)\.?\b/i;

/**
 * Limpia el formato administrativo del campo lugar de una multa.
 *
 * Los CSV traen muchas multas con un prefijo numerico de 1-3 digitos
 * que NO forma parte del nombre de la via (ej: "075 AV CARDENAL HERRERA
 * ORIA 8" -> "AV CARDENAL HERRERA ORIA 8"). Otros valores son codigos
 * legitimos de plazas/zonas SER ("1 SUR F 40") que conservamos.
 *
 * Heuristica: si tras el prefijo numerico viene un prefijo de via
 * reconocido, lo recortamos; en cualquier otro caso devolvemos el valor
 * original. Asi evitamos romper codigos zonales.
 *
 * @param {string|null|undefined} lugar - Texto crudo del CSV
 * @returns {string} Lugar legible para mostrar al usuario
 */
export function formatearLugar(lugar) {
  if (!lugar || typeof lugar !== 'string') return '-';
  const trimmed = lugar.trim();
  if (!trimmed) return '-';
  const match = trimmed.match(/^(\d{1,3})\s+(.+)$/);
  if (!match) return trimmed;
  const resto = match[2];
  return PREFIJOS_VIA.test(resto) ? resto : trimmed;
}
