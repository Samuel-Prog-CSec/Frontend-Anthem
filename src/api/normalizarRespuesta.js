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

  return {
    success: envelope.success,
    message: envelope.message,
    data: inner[dataKey] || inner.data || [],
    pagination: inner.pagination || null,
    filters: inner.filters || null
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
