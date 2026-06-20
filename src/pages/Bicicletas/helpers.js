/**
 * Helpers de Bicicletas
 */

/**
 * Determina la variante del Badge segun la tasa de ocupacion del servicio.
 *
 * @param {number} value - Tasa de ocupacion en porcentaje (0-100)
 * @returns {string} variante del Badge
 */
export function obtenerBadgeOcupacion(value) {
  if (value == null) return 'secondary';
  if (value < 30) return 'success';
  if (value < 60) return 'info';
  if (value < 80) return 'warning';
  return 'destructive';
}
