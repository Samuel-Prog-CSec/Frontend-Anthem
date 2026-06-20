/**
 * Helpers locales del modulo Trafico.
 */

import {
  TRAFFIC_ELEMENT_TYPES,
  TRAFFIC_ELEMENT_LABELS,
  CONGESTION_LEVELS,
  CONGESTION_LEVEL_LABELS,
  CONGESTION_LEVEL_COLORS,
  TRAFICO_MAPA_MAX_DIAS,
  DATE_CONFIG
} from '../../constants';

/** Options para Select de tipoElemento (URB | M30) */
export const opcionesTipoElemento = Object.values(TRAFFIC_ELEMENT_TYPES).map(value => ({
  value,
  label: TRAFFIC_ELEMENT_LABELS[value] || value
}));

/** Options para Select de granularidad temporal (historico) */
export const opcionesAgregacion = [
  { value: 'hour', label: 'Por hora' },
  { value: 'day', label: 'Por dia' },
  { value: 'week', label: 'Por semana' },
  { value: 'month', label: 'Por mes' }
];

/** Etiqueta legible de un tipo de elemento */
export function etiquetaTipoElemento(tipo) {
  return TRAFFIC_ELEMENT_LABELS[tipo] || tipo || '-';
}

/** Etiqueta legible de un nivel de congestion */
export function etiquetaCongestion(nivel) {
  return CONGESTION_LEVEL_LABELS[nivel] || nivel || '-';
}

/**
 * Color para un porcentaje de congestion (0..100).
 * Mapeo: <20 fluido, <50 denso, <80 congestionado, >=80 colapsado.
 */
export function colorPorPorcentajeCongestion(porcentaje) {
  if (!Number.isFinite(porcentaje)) {return CONGESTION_LEVEL_COLORS.FLUIDO;}
  if (porcentaje >= 80) {return CONGESTION_LEVEL_COLORS.COLAPSADO;}
  if (porcentaje >= 50) {return CONGESTION_LEVEL_COLORS.CONGESTIONADO;}
  if (porcentaje >= 20) {return CONGESTION_LEVEL_COLORS.DENSO;}
  return CONGESTION_LEVEL_COLORS.FLUIDO;
}

/** Etiqueta del nivel de congestion derivado del porcentaje */
export function nivelDesdePorcentaje(porcentaje) {
  if (!Number.isFinite(porcentaje)) {return CONGESTION_LEVELS.FLUIDO;}
  if (porcentaje >= 80) {return CONGESTION_LEVELS.COLAPSADO;}
  if (porcentaje >= 50) {return CONGESTION_LEVELS.CONGESTIONADO;}
  if (porcentaje >= 20) {return CONGESTION_LEVELS.DENSO;}
  return CONGESTION_LEVELS.FLUIDO;
}

/**
 * Devuelve un objeto {startDate, endDate} con valores por defecto:
 *  - Para datos del dataset 2051, sugiere los primeros 7 dias del año.
 */
export function rangoFechasInicial() {
  return {
    startDate: '2051-01-01',
    endDate: '2051-01-07'
  };
}

/**
 * Valida un rango de fechas para el endpoint /mapa.
 * Devuelve { valido, error?, dias? }.
 */
export function validarRangoMapa(startDate, endDate) {
  if (!startDate || !endDate) {
    return { valido: false, error: 'Selecciona fecha de inicio y fin.' };
  }
  const desde = new Date(startDate);
  const hasta = new Date(endDate);
  if (isNaN(desde.getTime()) || isNaN(hasta.getTime())) {
    return { valido: false, error: 'Fechas no válidas.' };
  }
  // El dataset es de un unico año (2051). Aunque los inputs llevan min/max,
  // algunos navegadores permiten teclear fuera de rango: bloqueamos aqui para
  // no lanzar queries que devolverian cero.
  const anioDataset = DATE_CONFIG.DATASET_YEAR;
  if (desde.getUTCFullYear() !== anioDataset || hasta.getUTCFullYear() !== anioDataset) {
    return { valido: false, error: `Las fechas deben estar dentro de ${anioDataset}.` };
  }
  if (desde > hasta) {
    return { valido: false, error: 'La fecha de inicio debe ser anterior o igual a la de fin.' };
  }
  const dias = Math.ceil((hasta - desde) / (24 * 60 * 60 * 1000));
  if (dias > TRAFICO_MAPA_MAX_DIAS) {
    return { valido: false, error: `El rango máximo es ${TRAFICO_MAPA_MAX_DIAS} días (solicitado: ${dias}).` };
  }
  return { valido: true, dias };
}
