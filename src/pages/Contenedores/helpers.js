/**
 * Helpers locales de la pagina Contenedores.
 *
 * Convierte enums de constants/index.js en options para Select y devuelve
 * etiquetas/colores legibles para charts y badges.
 */

import {
  CONTAINER_TYPES,
  CONTAINER_TYPE_LABELS,
  CONTAINER_TYPE_COLORS,
  CONTAINER_LOTES
} from '../../constants';

/**
 * Options para el select de tipo de contenedor.
 * value === API enum value (ej. 'PAPEL-CARTON').
 */
export const opcionesTipoContenedor = Object.values(CONTAINER_TYPES).map(value => ({
  value,
  label: CONTAINER_TYPE_LABELS[value] || value
}));

/**
 * Options para el select de lote.
 */
export const opcionesLote = CONTAINER_LOTES.map(lote => ({
  value: String(lote),
  label: `Lote ${lote}`
}));

/**
 * Devuelve la etiqueta legible de un tipo de contenedor.
 */
export function etiquetaTipoContenedor(tipo) {
  if (!tipo) {return '-';}
  return CONTAINER_TYPE_LABELS[tipo] || tipo;
}

/**
 * Devuelve el color hex asociado al tipo de contenedor segun el estandar
 * municipal. Util para charts y markers.
 */
export function colorTipoContenedor(tipo) {
  if (!tipo) {return '#64748b';}
  return CONTAINER_TYPE_COLORS[tipo] || '#64748b';
}

/**
 * Variant del Badge segun el tipo de contenedor.
 * Aprovecha las variantes existentes (success, warning, info, etc.).
 */
export function varianteBadgePorTipo(tipo) {
  switch (tipo) {
    case 'ORGANICA': return 'warning';
    case 'VIDRIO': return 'success';
    case 'ENVASES': return 'warning';
    case 'PAPEL-CARTON': return 'info';
    case 'RESTO': return 'secondary';
    default: return 'default';
  }
}
