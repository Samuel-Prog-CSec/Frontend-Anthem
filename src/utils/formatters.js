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
 * Formatea coordenadas geograficas en formato WGS84 (lat, lon).
 * @param {number} lat - Latitud
 * @param {number} lon - Longitud
 * @returns {string} Coordenadas formateadas
 */
export function formatCoordinates(lat, lon) {
  if (lat === null || lon === null) return '-';
  return `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
}

/**
 * Formatea las coordenadas de una ubicacion soportando los dos formatos
 * que devuelve el backend:
 *   - `geometry.coordinates: [lon, lat]` (GeoJSON WGS84, en endpoints /mapa
 *     y en algunos listados ya transformados).
 *   - `coordenadas: { x, y }` (UTM ETRS89 zona 30N, en el listado plano
 *     `/ubicaciones`).
 *
 * Sin esta funcion el listado plano mostraba '-' en los 27 454 registros
 * porque la celda solo entendia GeoJSON.
 *
 * @param {{geometry?: {coordinates?: [number, number]}, coordenadas?: {x?: number, y?: number}}} location
 * @returns {string} Coordenadas legibles, con sufijo `UTM` cuando el dato es UTM.
 */
export function formatUbicacionCoords(location) {
  if (!location) return '-';
  const coords = location.geometry?.coordinates;
  if (Array.isArray(coords) && coords.length >= 2) {
    const [lon, lat] = coords;
    if (Number.isFinite(lat) && Number.isFinite(lon)) {
      return formatCoordinates(lat, lon);
    }
  }
  const utm = location.coordenadas;
  if (utm && Number.isFinite(utm.x) && Number.isFinite(utm.y)) {
    // ETRS89/UTM-30N: enteros suficientes (precision ~1m).
    return `${Math.round(utm.x)}, ${Math.round(utm.y)} UTM`;
  }
  return '-';
}

/**
 * Mapa canonico de los 21 distritos de Anthem (calcado de Madrid).
 *
 * El backend almacena los nombres como llegan del CSV de cada dominio.
 * Esto produce inconsistencias visibles en la UI:
 *   - containers: "CHAMARTIN", "CIUDAD-LINEAL", "TETUAN"
 *   - accidents:  "CHAMARTIN", "CIUDAD LINEAL", "TETUAN"
 * Normalizamos siempre a la forma con tildes y separador con espacio
 * (no guion) para que la UI muestre el mismo nombre en todas las
 * paginas y para que los joins por distrito (Censo cross-domain) no
 * fallen por diferencias tipograficas.
 *
 * La clave es la version "ascii-mayusculas-sin-puntuacion" del nombre
 * para hacer match con cualquier variante de entrada.
 */
const DISTRITOS_CANONICOS = {
  CENTRO: 'CENTRO',
  ARGANZUELA: 'ARGANZUELA',
  RETIRO: 'RETIRO',
  SALAMANCA: 'SALAMANCA',
  CHAMARTIN: 'CHAMARTÍN',
  TETUAN: 'TETUÁN',
  CHAMBERI: 'CHAMBERÍ',
  'FUENCARRAL EL PARDO': 'FUENCARRAL-EL PARDO',
  'MONCLOA ARAVACA': 'MONCLOA-ARAVACA',
  LATINA: 'LATINA',
  CARABANCHEL: 'CARABANCHEL',
  USERA: 'USERA',
  'PUENTE DE VALLECAS': 'PUENTE DE VALLECAS',
  MORATALAZ: 'MORATALAZ',
  'CIUDAD LINEAL': 'CIUDAD LINEAL',
  HORTALEZA: 'HORTALEZA',
  VILLAVERDE: 'VILLAVERDE',
  'VILLA DE VALLECAS': 'VILLA DE VALLECAS',
  VICALVARO: 'VICÁLVARO',
  'SAN BLAS CANILLEJAS': 'SAN BLAS-CANILLEJAS',
  BARAJAS: 'BARAJAS'
};

/**
 * Normaliza un nombre de distrito a su forma canonica (mayusculas con
 * tildes correctas, separador con guion donde corresponde).
 *
 * Acepta cualquier variante de entrada (sin tildes, con guion, con
 * espacios, en minusculas) porque internamente convierte a la clave
 * ascii-mayusculas para hacer el lookup. Si el nombre no esta en el
 * mapa, devuelve el original tal cual para no perder informacion.
 *
 * @param {string|null|undefined} nombre - Nombre de distrito tal como
 *   viene del backend
 * @returns {string} Nombre canonico con tildes/separadores correctos
 */
export function formatearNombreDistrito(nombre) {
  if (!nombre || typeof nombre !== 'string') return '-';
  const clave = nombre
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toUpperCase()
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return DISTRITOS_CANONICOS[clave] || nombre;
}

/**
 * Formatea una hora en formato 24h con cero a la izquierda.
 *
 * Aceptamos tanto el rango 0-23 (UTC estandar, viene del backend de
 * aforos) como 1-24 (donde 24 representa medianoche del dia siguiente).
 * En cualquier caso devolvemos siempre dos digitos para que la columna
 * no salte visualmente entre "9:00" y "10:00".
 *
 * @param {number|string} hour - Hora (0-24)
 * @returns {string} Hora formateada (ej: "08:00", "00:00")
 */
export function formatHour(hour) {
  const n = typeof hour === 'string' ? Number(hour) : hour;
  if (!Number.isFinite(n) || n < 0 || n > 24) return '-';
  const h = n === 24 ? 0 : Math.trunc(n);
  return `${h.toString().padStart(2, '0')}:00`;
}

const AFORO_TIPO_ESTACION = { PERM: 'Permanente', TEMP: 'Temporal' };
const AFORO_MODALIDAD = { BICI: 'Bicicletas', PEA: 'Peatones' };

/**
 * Descompone el identificador tecnico de una estacion de aforo en partes
 * legibles. Los identificadores siguen el patron
 * `{TIPO_ESTACION}_{MODALIDAD}{NN}_{PM}{MM}`:
 *
 *   `PERM_BICI20_PM02` -> Permanente · Bicicletas · Estacion 20 · Punto 02
 *   `PERM_PEA02_PM01`  -> Permanente · Peatones · Estacion 02 · Punto 01
 *
 * Usado en tablas (como `title` para tooltip) y en paneles de detalle
 * (como subtitulo). Si el identificador no encaja en el patron,
 * `legible` es null y el caller decide el fallback (normalmente
 * mostrar el codigo crudo).
 *
 * Vive en utils/ porque es compartido entre AforoBicicletas y
 * AforoPeatones; la modalidad sale del propio codigo, no hace falta
 * duplicar la funcion por pagina.
 *
 * @param {string|null|undefined} identificador
 * @returns {{tipoEstacion: string, modalidad: string, estacion: string, punto: string, legible: string|null}}
 */
export function descomponerIdentificadorAforo(identificador) {
  if (!identificador || typeof identificador !== 'string') {
    return { tipoEstacion: '', modalidad: '', estacion: '', punto: '', legible: null };
  }
  const partes = identificador.trim().toUpperCase().split('_');
  if (partes.length < 3) {
    return { tipoEstacion: '', modalidad: '', estacion: '', punto: '', legible: null };
  }
  const [tipoCodigo, modalidadRaw, puntoRaw] = partes;
  const matchModalidad = modalidadRaw.match(/^([A-Z]+)(\d+)$/);
  const matchPunto = puntoRaw.match(/^([A-Z]+)(\d+)$/);
  if (!matchModalidad || !matchPunto) {
    return {
      tipoEstacion: AFORO_TIPO_ESTACION[tipoCodigo] || tipoCodigo,
      modalidad: modalidadRaw,
      estacion: '',
      punto: puntoRaw,
      legible: null
    };
  }
  const [, modalidadCodigo, estacionNum] = matchModalidad;
  const [, , puntoNum] = matchPunto;
  const tipoEtiqueta = AFORO_TIPO_ESTACION[tipoCodigo] || tipoCodigo;
  const modalidadEtiqueta = AFORO_MODALIDAD[modalidadCodigo] || modalidadCodigo;
  return {
    tipoEstacion: tipoEtiqueta,
    modalidad: modalidadEtiqueta,
    estacion: estacionNum,
    punto: puntoNum,
    legible: `${tipoEtiqueta} · ${modalidadEtiqueta} · Estacion ${estacionNum} · Punto ${puntoNum}`
  };
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
