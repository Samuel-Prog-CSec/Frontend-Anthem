/**
 * Funciones de formateo para el Dashboard
 * 
 * Utilidades para formatear fechas, numeros y otros valores
 * de manera consistente en toda la aplicacion.
 */

import { DATE_CONFIG } from '../constants';

/**
 * Formatea una fecha segun las opciones especificadas
 * @param {Date|string} date - Fecha a formatear
 * @param {string} format - Tipo de formato: 'short', 'long', 'monthYear'
 * @returns {string} Fecha formateada
 */
export function formatDate(date, format = 'short') {
  if (!date) return '-';
  
  const dateObj = date instanceof Date ? date : new Date(date);
  
  if (isNaN(dateObj.getTime())) return '-';
  
  const options = DATE_CONFIG.FORMAT_OPTIONS[format] || DATE_CONFIG.FORMAT_OPTIONS.short;
  
  return dateObj.toLocaleDateString(DATE_CONFIG.LOCALE, options);
}

/**
 * Formatea un numero con separadores de miles
 * @param {number} value - Numero a formatear
 * @param {number} decimals - Numero de decimales (default: 0)
 * @returns {string} Numero formateado
 */
export function formatNumber(value, decimals = 0) {
  if (value === null || value === undefined) return '-';
  
  return new Intl.NumberFormat(DATE_CONFIG.LOCALE, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
}

/**
 * Formatea un valor de decibelios
 * @param {number} value - Valor en dB
 * @returns {string} Valor formateado con unidad
 */
export function formatDecibels(value) {
  if (value === null || value === undefined) return '-';
  return `${formatNumber(value, 1)} dB`;
}

/**
 * Formatea un valor de concentracion de contaminante
 * @param {number} value - Valor de concentracion
 * @param {string} unit - Unidad de medida (default: 'ug/m3')
 * @returns {string} Valor formateado con unidad
 */
export function formatConcentration(value, unit = 'ug/m3') {
  if (value === null || value === undefined) return '-';
  return `${formatNumber(value, 2)} ${unit}`;
}

/**
 * Formatea coordenadas geograficas
 * @param {number} lat - Latitud
 * @param {number} lon - Longitud
 * @returns {string} Coordenadas formateadas
 */
export function formatCoordinates(lat, lon) {
  if (lat === null || lon === null) return '-';
  return `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
}

/**
 * Formatea una hora en formato 24h
 * @param {number} hour - Hora (1-24)
 * @returns {string} Hora formateada (ej: "08:00")
 */
export function formatHour(hour) {
  if (hour < 1 || hour > 24) return '-';
  const h = hour === 24 ? 0 : hour;
  return `${h.toString().padStart(2, '0')}:00`;
}

/**
 * Capitaliza la primera letra de un string
 * @param {string} str - String a capitalizar
 * @returns {string} String capitalizado
 */
export function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Trunca un texto a una longitud maxima
 * @param {string} text - Texto a truncar
 * @param {number} maxLength - Longitud maxima
 * @returns {string} Texto truncado con ellipsis si es necesario
 */
export function truncate(text, maxLength = 50) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 3)}...`;
}
