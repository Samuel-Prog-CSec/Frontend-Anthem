/**
 * Opciones de selectores para los filtros de Censo.
 */

import { ETIQUETAS_GRUPOS_EDAD } from '../../constants';

export const opcionesGrupoEdad = Object.entries(ETIQUETAS_GRUPOS_EDAD).map(
  ([value, label]) => ({ value, label })
);

export const opcionesMes = Array.from({ length: 12 }, (_, i) => ({
  value: String(i + 1),
  label: new Date(2051, i, 1).toLocaleString('es-ES', { month: 'long' })
}));
