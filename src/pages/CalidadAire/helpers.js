/**
 * Helpers de CalidadAire
 *
 * Funciones puras compartidas entre los sub-componentes de la pagina.
 * Sin dependencias de React, listas para ser testeadas o reutilizadas.
 */

/**
 * Calcula el promedio de mediciones validas de un registro horario.
 *
 * @param {Map|Object} mediciones - Mediciones horarias del registro
 * @returns {number|null} Promedio o null si no hay datos validos
 */
export function calcularPromedioDiario(mediciones) {
  if (!mediciones) return null;

  const entries = mediciones instanceof Map
    ? Array.from(mediciones.values())
    : Object.values(mediciones);

  const validValues = entries
    .filter(m => m && m.validationCode === 'V' && m.value != null)
    .map(m => m.value);

  if (validValues.length === 0) return null;

  return validValues.reduce((sum, val) => sum + val, 0) / validValues.length;
}

/**
 * Determina el nivel de calidad del aire basado en el valor.
 * Umbrales basados en el Indice de Calidad del Aire (AQI estandar EPA).
 *
 * @param {number} value - Valor de la medicion (ug/m3)
 * @returns {{label: string, variant: string}} Nivel con label y variant para Badge
 */
export function obtenerNivelCalidadAire(value) {
  if (value == null) return { label: 'Sin datos', variant: 'secondary' };
  if (value <= 50) return { label: 'Buena', variant: 'success' };
  if (value <= 100) return { label: 'Moderada', variant: 'warning' };
  if (value <= 150) return { label: 'Daniña (sensibles)', variant: 'warning' };
  if (value <= 200) return { label: 'Daniña', variant: 'destructive' };
  if (value <= 300) return { label: 'Muy daniña', variant: 'destructive' };
  return { label: 'Peligrosa', variant: 'destructive' };
}
