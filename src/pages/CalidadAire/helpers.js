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
 * Tabla de umbrales por contaminante (μg/m³ salvo indicacion).
 *
 * Basada en los rangos del European Environment Agency (EEA) y los limites
 * anuales/horarios de la Directiva 2008/50/CE. Aplicar la misma escala
 * 0-50/51-100/... a TODOS los contaminantes (como hacia el codigo
 * anterior) es incorrecto: un PM2.5 de 25 μg/m³ ya supera el limite OMS,
 * pero el helper antiguo lo calificaba "Buena" porque pasaba de la regla
 * generica AQI 0-50. Cada contaminante tiene su propia respuesta sanitaria.
 *
 * Cada rango es un array de cortes ascendente; el ultimo nivel atrapa
 * cualquier valor por encima del penultimo corte.
 *
 * Magnitudes (codigo Ayuntamiento Madrid):
 *   1 SO2, 6 CO, 7 NO, 8 NO2, 9 PM2.5, 10 PM10, 12 NOx, 14 O3
 */
const UMBRALES_POR_MAGNITUD = {
  // SO2 (Directiva UE: 350 μg/m³ horario)
  1:  { cortes: [100, 200, 350, 500, 750],  unidad: 'μg/m³' },
  // CO (Directiva UE: 10 mg/m³ = 10000 μg/m³ 8h). Los CSV vienen en mg/m³.
  6:  { cortes: [2, 4, 10, 15, 30],         unidad: 'mg/m³' },
  // NO (sin limite legal directo, usamos escala proporcional NO2)
  7:  { cortes: [40, 100, 200, 400, 600],   unidad: 'μg/m³' },
  // NO2 (Directiva UE anual 40 μg/m³; horario 200 μg/m³)
  8:  { cortes: [40, 90, 120, 230, 340],    unidad: 'μg/m³' },
  // PM2.5 (OMS 2021 anual 5 μg/m³; UE anual 25 μg/m³)
  9:  { cortes: [10, 20, 25, 50, 75],       unidad: 'μg/m³' },
  // PM10 (OMS 2021 anual 15 μg/m³; UE anual 40 μg/m³, diario 50 μg/m³)
  10: { cortes: [20, 40, 50, 100, 150],     unidad: 'μg/m³' },
  // NOx (escala equivalente a NO2 + NO)
  12: { cortes: [60, 140, 230, 350, 500],   unidad: 'μg/m³' },
  // O3 (Directiva UE 8h: 120 μg/m³ obj; alerta poblacion 240 μg/m³)
  14: { cortes: [50, 100, 130, 240, 380],   unidad: 'μg/m³' }
};

/**
 * Devuelve la unidad de medida de una magnitud (codigo Ayto. Madrid).
 *
 * El CO (codigo 6) se reporta en mg/m3; el resto de contaminantes tabulados
 * en ug/m3. Para magnitudes sin tabla (hidrocarburos, etilbenceno...) se
 * asume ug/m3 por ser la unidad mayoritaria de la malla atmosferica.
 *
 * @param {number} magnitud - Codigo de magnitud
 * @returns {string} Unidad ('ug/m3' o 'mg/m3')
 */
export function obtenerUnidadMagnitud(magnitud) {
  return UMBRALES_POR_MAGNITUD[magnitud]?.unidad ?? 'μg/m³';
}

// Tabla de niveles ordenados de menor a mayor severidad.
const NIVELES_CALIDAD = [
  { label: 'Buena',                variant: 'success' },
  { label: 'Moderada',             variant: 'warning' },
  { label: 'Dañina (sensibles)',  variant: 'warning' },
  { label: 'Dañina',              variant: 'destructive' },
  { label: 'Muy dañina',          variant: 'destructive' },
  { label: 'Peligrosa',            variant: 'destructive' }
];

/**
 * Determina el nivel de calidad del aire para un contaminante concreto.
 *
 * Si la magnitud no esta tabulada (hidrocarburos, etilbenceno...), se
 * devuelve "Sin escala" en lugar de inventar una clasificacion: marcar un
 * valor de tolueno como "Buena" sin tabla de referencia seria mas
 * engañoso que mostrar el valor sin clasificacion.
 *
 * @param {number} value - Valor de la medicion (en la unidad de la magnitud)
 * @param {number} [magnitud] - Codigo de magnitud Ayto. Madrid (1/6/7/8/9/10/12/14)
 * @returns {{label: string, variant: string}} Nivel con label y variant para Badge
 */
export function obtenerNivelCalidadAire(value, magnitud) {
  if (value == null) return { label: 'Sin datos', variant: 'secondary' };

  const tabla = magnitud != null ? UMBRALES_POR_MAGNITUD[magnitud] : null;
  if (!tabla) {
    // Sin tabla de referencia, no clasificamos para no enganyar al usuario.
    return { label: 'Sin escala', variant: 'secondary' };
  }

  for (let i = 0; i < tabla.cortes.length; i += 1) {
    if (value <= tabla.cortes[i]) {
      return NIVELES_CALIDAD[i];
    }
  }
  return NIVELES_CALIDAD[NIVELES_CALIDAD.length - 1];
}
