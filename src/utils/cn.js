/**
 * Utilidad para combinar clases CSS con soporte de Tailwind
 * 
 * Combina clsx para condicionales y tailwind-merge para resolver conflictos
 * Fuente: Patron comun de Shadcn/ui
 * Documentacion: https://ui.shadcn.com/docs/installation/manual
 */

import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combina clases CSS resolviendo conflictos de Tailwind
 * @param {...(string|Object|Array)} inputs - Clases CSS a combinar
 * @returns {string} Clases CSS combinadas y optimizadas
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
