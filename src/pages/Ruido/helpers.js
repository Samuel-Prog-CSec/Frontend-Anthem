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
 * Obtiene el color del badge segun el nivel de ruido Y el periodo.
 *
 * El limite normativo depende del periodo (el nocturno es mas estricto: ~55 dB
 * frente a ~65 dB diurno). Antes el badge usaba umbrales fijos 55/65 sin mirar
 * el periodo, de modo que un nivel nocturno de 60 dB (que SI excede el limite de
 * noche) se pintaba amarillo en vez de rojo. Se delega en `excedeLimite` para
 * no duplicar los limites.
 *
 * @param {number} value - Valor en dB
 * @param {string} [period] - 'diurno' | 'vespertino' | 'nocturno' (omitir para
 *   indicadores 24h como Laeq24, que usan el limite general).
 * @returns {string} Variante del badge
 */
export function obtenerVarianteBadgeRuido(value, period) {
  if (value == null) return 'secondary';
  if (excedeLimite(value, period)) return 'destructive';
  const limite = {
    diurno: NOISE_LIMITS.DIURNO,
    vespertino: NOISE_LIMITS.VESPERTINO,
    nocturno: NOISE_LIMITS.NOCTURNO
  }[period] ?? NOISE_LIMITS.DIURNO;
  // Aviso (amarillo) en los ultimos 5 dB antes del limite del periodo.
  if (value > limite - 5) return 'warning';
  return 'success';
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
