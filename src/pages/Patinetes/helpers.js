/**
 * Helpers compartidos por la pagina de Patinetes y sus subcomponentes.
 */

// Opciones de filtro para densidad de patinetes
export const densityOptions = [
  { value: 'BAJA', label: 'Baja' },
  { value: 'MEDIA', label: 'Media' },
  { value: 'ALTA', label: 'Alta' },
  { value: 'MUY_ALTA', label: 'Muy alta' }
];

// Opciones de filtro para tipo de zona
export const zoneTypeOptions = [
  { value: 'CENTRO_URBANO', label: 'Centro urbano' },
  { value: 'ZONA_COMERCIAL', label: 'Zona comercial' },
  { value: 'ZONA_UNIVERSITARIA', label: 'Zona universitaria' },
  { value: 'ZONA_TRANSPORTE', label: 'Zona transporte' },
  { value: 'ZONA_RESIDENCIAL', label: 'Zona residencial' }
];

/**
 * Obtiene la variante del badge segun el nivel de densidad
 * @param {string} density - Nivel de densidad
 * @returns {string} Variante del badge
 */
export function obtenerVarianteBadgeDensidad(density) {
  switch (density) {
    case 'MUY_ALTA': return 'destructive';
    case 'ALTA': return 'warning';
    case 'MEDIA': return 'info';
    case 'BAJA': return 'secondary';
    default: return 'secondary';
  }
}

/**
 * Obtiene la variante del badge segun el nivel de demanda
 * @param {string} demand - Nivel de demanda
 * @returns {string} Variante del badge
 */
export function obtenerVarianteBadgeDemanda(demand) {
  switch (demand) {
    case 'MUY_ALTA': return 'destructive';
    case 'ALTA': return 'warning';
    case 'MEDIA': return 'info';
    case 'BAJA': return 'secondary';
    default: return 'secondary';
  }
}
