/**
 * Opciones de selectores para los filtros de Multas.
 * Separadas en .js para cumplir `react-refresh/only-export-components`.
 */

import { ETIQUETAS_CALIFICACION_MULTA, TIPOS_DENUNCIANTE } from '../../constants';

export const opcionesCalificacion = Object.entries(ETIQUETAS_CALIFICACION_MULTA).map(
  ([value, label]) => ({ value, label })
);

export const opcionesDenunciante = Object.entries(TIPOS_DENUNCIANTE).map(
  ([, value]) => ({ value, label: value })
);

export const opcionesMes = Array.from({ length: 12 }, (_, i) => ({
  value: String(i + 1),
  label: new Date(2051, i, 1).toLocaleString('es-ES', { month: 'long' })
}));

export const opcionesDescuento = [
  { value: 'true', label: 'Con descuento' },
  { value: 'false', label: 'Sin descuento' }
];
