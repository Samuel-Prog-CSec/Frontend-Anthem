/**
 * Utilidad de normalizacion de respuestas de la API
 *
 * La API devuelve respuestas con estructura anidada:
 *   { success, message, data: { [dataKey]: [...], pagination, filters } }
 *
 * Este helper aplana la estructura para consumo directo en el frontend.
 */

/**
 * Normaliza la respuesta de un endpoint de listado de la API
 * @param {Object} response - Respuesta cruda de axios
 * @param {string} [dataKey='data'] - Clave donde estan los registros dentro de response.data.data
 * @returns {Object} Respuesta normalizada con data, pagination y filters al nivel superior
 */
export function normalizarRespuestaLista(response, dataKey = 'data') {
  const envelope = response.data;

  if (!envelope?.success || !envelope?.data) {
    return envelope || { success: false, data: [], pagination: null };
  }

  const inner = envelope.data;

  // Estrategia de busqueda del array de registros:
  //   1) inner[dataKey]    - si el llamador especifico la clave (mejor caso)
  //   2) inner.data        - convencion mas comun en este backend
  //   3) inner             - si la propia inner es ya un array plano
  //   4) inner[<primera>]  - fallback: primera propiedad que sea array
  //      (asignaciones, registros, estaciones, etc.). Evita el bug donde
  //      el endpoint cambia el nombre del array y el normalizer devuelve
  //      [] silenciosamente provocando "datos en 0" en la UI.
  let data;
  if (Array.isArray(inner?.[dataKey])) {
    data = inner[dataKey];
  } else if (Array.isArray(inner?.data)) {
    data = inner.data;
  } else if (Array.isArray(inner)) {
    data = inner;
  } else {
    const primerArray = inner && typeof inner === 'object'
      ? Object.values(inner).find(v => Array.isArray(v))
      : null;
    data = primerArray || [];
  }

  return {
    success: envelope.success,
    message: envelope.message,
    data,
    pagination: inner.pagination || null,
    filters: inner.filters || null,
    // `stats` lo emiten los listados de gran volumen (/accidentes, /trafico,
    // /multas) dentro del mismo $facet. Conservarlo permite a los hooks exponer
    // los totales por-filtro sin una segunda peticion al endpoint /estadisticas.
    stats: inner.stats || null
  };
}

/**
 * Normaliza la respuesta de un endpoint de detalle de la API
 * @param {Object} response - Respuesta cruda de axios
 * @returns {Object} Respuesta normalizada
 */
export function normalizarRespuestaDetalle(response) {
  const envelope = response.data;

  if (!envelope?.success || !envelope?.data) {
    return envelope || { success: false, data: null };
  }

  return {
    success: envelope.success,
    message: envelope.message,
    data: envelope.data
  };
}
