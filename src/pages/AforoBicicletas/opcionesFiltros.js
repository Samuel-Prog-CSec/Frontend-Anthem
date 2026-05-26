/**
 * Opciones de selectores para los filtros de Aforo de Bicicletas.
 */

import { ETIQUETAS_FRANJAS_HORARIAS } from '../../constants';

export const opcionesFranjaHoraria = Object.entries(ETIQUETAS_FRANJAS_HORARIAS).map(
  ([value, label]) => ({ value, label })
);

export const opcionesMes = Array.from({ length: 12 }, (_, i) => ({
  value: String(i + 1),
  label: new Date(2051, i, 1).toLocaleString('es-ES', { month: 'long' })
}));
