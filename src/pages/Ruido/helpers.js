/**
 * Helpers compartidos por la pagina de Ruido y sus subcomponentes.
 */

import { NOISE_LIMITS } from '../../constants';

/**
 * Determina si el nivel de ruido excede el limite normativo
 * @param {number} value - Valor en dB
 * @param {string} period - Periodo: 'diurno', 'vespertino', 'nocturno'
 * @returns {boolean} true si excede el limite
 */
export function excedeLimite(value, period) {
  if (value == null) return false;

  const limits = {
    diurno: NOISE_LIMITS.DIURNO,
    vespertino: NOISE_LIMITS.VESPERTINO,
    nocturno: NOISE_LIMITS.NOCTURNO
  };

  return value > (limits[period] || 65);
}

/**
 * Obtiene el color del badge segun el nivel de ruido
 * @param {number} value - Valor en dB
 * @returns {string} Variante del badge
 */
export function obtenerVarianteBadgeRuido(value) {
  if (value == null) return 'secondary';
  if (value <= 55) return 'success';
  if (value <= 65) return 'warning';
  return 'destructive';
}

// Meses para selector
export const opcionesMes = [
  { value: '1', label: 'Enero' },
  { value: '2', label: 'Febrero' },
  { value: '3', label: 'Marzo' },
  { value: '4', label: 'Abril' },
  { value: '5', label: 'Mayo' },
  { value: '6', label: 'Junio' },
  { value: '7', label: 'Julio' },
  { value: '8', label: 'Agosto' },
  { value: '9', label: 'Septiembre' },
  { value: '10', label: 'Octubre' },
  { value: '11', label: 'Noviembre' },
  { value: '12', label: 'Diciembre' }
];
