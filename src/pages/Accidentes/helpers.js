/**
 * Helpers compartidos por la pagina de Accidentes y sus subcomponentes.
 */

import { formatearEtiquetaEnum } from '../../utils';

/**
 * Obtiene la variante del badge segun la gravedad
 * @param {string} gravedad - Nivel de gravedad
 * @returns {string} Variante del badge
 */
export function obtenerVarianteBadgeGravedad(gravedad) {
  if (!gravedad) return 'secondary';
  const upper = gravedad.toUpperCase();
  if (upper === 'LEVE') return 'success';
  if (upper === 'GRAVE') return 'warning';
  if (upper === 'MORTAL') return 'destructive';
  return 'secondary';
}

// Lesividad por persona afectada (campo `tipoLesion`): el dato trae el enum
// crudo del DGT (SE_DESCONOCE, FALLECIDO_24_HORAS, INGRESO_*, ASISTENCIA_*...),
// no LEVE/GRAVE/MORTAL. Mapeamos a etiqueta legible y a una severidad para el
// badge en vez de mostrar el enum o un badge siempre vacio.
const ETIQUETAS_TIPO_LESION = {
  SE_DESCONOCE: 'Se desconoce',
  SIN_ASISTENCIA_SANITARIA: 'Sin asistencia',
  'ASISTENCIA_SANITARIA_SÓLO_EN_EL_LUGAR_DEL_ACCIDENTE': 'Asistencia en el lugar',
  ASISTENCIA_SANITARIA_INMEDIATA_EN_CENTRO_DE_SALUD_O_MUTUA: 'Asistencia inmediata',
  ASISTENCIA_SANITARIA_AMBULATORIA_CON_POSTERIORIDAD: 'Ambulatoria posterior',
  'ATENCIÓN_EN_URGENCIAS_SIN_POSTERIOR_INGRESO': 'Urgencias sin ingreso',
  INGRESO_INFERIOR_O_IGUAL_A_24_HORAS: 'Ingreso ≤ 24h',
  INGRESO_SUPERIOR_A_24_HORAS: 'Ingreso > 24h',
  FALLECIDO_24_HORAS: 'Fallecido (24h)'
};

export function etiquetaTipoLesion(tipoLesion) {
  if (!tipoLesion) return '-';
  return ETIQUETAS_TIPO_LESION[tipoLesion] || tipoLesion.replace(/_/g, ' ').toLowerCase();
}

export function obtenerVarianteBadgeLesion(tipoLesion) {
  if (!tipoLesion) return 'secondary';
  if (tipoLesion === 'FALLECIDO_24_HORAS') return 'destructive';
  if (tipoLesion === 'INGRESO_SUPERIOR_A_24_HORAS' || tipoLesion === 'INGRESO_INFERIOR_O_IGUAL_A_24_HORAS') return 'warning';
  if (tipoLesion === 'SE_DESCONOCE' || tipoLesion === 'SIN_ASISTENCIA_SANITARIA') return 'secondary';
  return 'success';
}

/**
 * Obtiene la variante del badge segun resultado de alcohol
 * @param {string} value - Valor del test de alcohol ('S', 'N', etc.)
 * @returns {{ variant: string, label: string }}
 */
export function obtenerBadgeAlcohol(value) {
  if (value === 'S') return { variant: 'destructive', label: 'Positivo' };
  if (value === 'N') return { variant: 'success', label: 'Negativo' };
  return { variant: 'secondary', label: 'N/D' };
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

// Tipos de accidente para selector
export const opcionesTipoAccidente = [
  { value: 'ALCANCE', label: 'Alcance' },
  { value: 'ATROPELLO_A_PERSONA', label: 'Atropello a persona' },
  { value: 'CAÍDA', label: 'Caida' },
  { value: 'CHOQUE_CONTRA_OBSTÁCULO_FIJO', label: 'Choque contra obstaculo fijo' },
  { value: 'COLISIÓN_FRONTAL', label: 'Colision frontal' },
  { value: 'COLISIÓN_FRONTO-LATERAL', label: 'Colision fronto-lateral' },
  { value: 'COLISIÓN_LATERAL', label: 'Colision lateral' },
  { value: 'COLISIÓN_MÚLTIPLE', label: 'Colision multiple' },
  { value: 'VUELCO', label: 'Vuelco' },
  { value: 'OTRO', label: 'Otro' }
];

// Niveles de gravedad para selector
export const opcionesGravedad = [
  { value: 'SIN_LESIONES', label: 'Sin lesiones' },
  { value: 'LEVE', label: 'Leve' },
  { value: 'GRAVE', label: 'Grave' },
  { value: 'MORTAL', label: 'Mortal' }
];

// Mapa enum -> etiqueta legible, derivado del catalogo del selector para no
// duplicar la fuente de verdad.
const ETIQUETAS_TIPO_ACCIDENTE = new Map(
  opcionesTipoAccidente.map(({ value, label }) => [value, label])
);

/**
 * Convierte el codigo de tipo de accidente del backend en una etiqueta
 * legible para graficos y leyendas. Si el tipo no esta en el catalogo
 * conocido, lo normaliza (guiones bajos a espacios, capitalizacion inicial)
 * en lugar de mostrar el enum crudo (p.ej. "COLISION_FRONTO-LATERAL").
 *
 * @param {string} valor - Tipo de accidente tal cual llega del backend
 * @returns {string} Etiqueta legible
 */
export function etiquetaTipoAccidente(valor) {
  if (!valor) return 'Desconocido';
  return ETIQUETAS_TIPO_ACCIDENTE.get(valor) || formatearEtiquetaEnum(valor, 'Desconocido');
}

// Mapa enum -> etiqueta legible de gravedad (incluye SIN_LESIONES, que el
// backend emite para afectados sin lesion / lesividad desconocida).
const ETIQUETAS_GRAVEDAD = new Map(
  opcionesGravedad.map(({ value, label }) => [value, label])
);

/**
 * Convierte el codigo de gravedad del backend en etiqueta legible
 * ("SIN_LESIONES" -> "Sin lesiones"), evitando mostrar el enum crudo.
 *
 * @param {string} valor - Gravedad tal cual llega del backend
 * @returns {string} Etiqueta legible
 */
export function etiquetaGravedad(valor) {
  if (!valor) return '-';
  return ETIQUETAS_GRAVEDAD.get(valor) || formatearEtiquetaEnum(valor, 'Desconocido');
}
