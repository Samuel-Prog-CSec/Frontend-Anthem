/**
 * Helpers de Censo
 *
 * Funciones puras compartidas entre los sub-componentes.
 */

import { GRUPOS_EDAD_CENSO } from '../../constants';

/**
 * Variante semantica del Badge segun el grupo de edad.
 */
export function obtenerVarianteBadgeEdad(grupoEdad) {
  switch (grupoEdad) {
    case GRUPOS_EDAD_CENSO.INFANTIL: return 'info';
    case GRUPOS_EDAD_CENSO.JUVENIL: return 'signal';
    case GRUPOS_EDAD_CENSO.ADULTO_JOVEN: return 'success';
    case GRUPOS_EDAD_CENSO.ADULTO: return 'secondary';
    case GRUPOS_EDAD_CENSO.MAYOR: return 'warning';
    case GRUPOS_EDAD_CENSO.ANCIANO: return 'destructive';
    default: return 'secondary';
  }
}

/**
 * Formatea un porcentaje con decimales configurables.
 */
export function formatearPorcentaje(valor, decimales = 1) {
  if (valor === null || valor === undefined || isNaN(valor)) return '-';
  return `${Number(valor).toFixed(decimales)}%`;
}
