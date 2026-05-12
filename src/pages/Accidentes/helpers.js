/**
 * Helpers compartidos por la pagina de Accidentes y sus subcomponentes.
 */

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
  { value: 'LEVE', label: 'Leve' },
  { value: 'GRAVE', label: 'Grave' },
  { value: 'MORTAL', label: 'Mortal' }
];
