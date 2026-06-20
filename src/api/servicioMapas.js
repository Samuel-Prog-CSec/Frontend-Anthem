/**
 * Servicio de Mapas
 *
 * Centraliza las llamadas a los endpoints `/mapa` de la API, que
 * devuelven FeatureCollection GeoJSON (RFC 7946) con `metadata`
 * enriquecida por recurso.
 *
 * Soporta AbortSignal vía options.signal para cancelacion via React Query.
 */

import apiClient from './axios';
import { normalizarRespuestaDetalle } from './normalizarRespuesta';

function construirQuery(params = {}) {
  const searchParams = new URLSearchParams();
  for (const [clave, valor] of Object.entries(params)) {
    if (valor === null || valor === undefined || valor === '') {continue;}
    if (Array.isArray(valor)) {
      if (valor.length) {searchParams.append(clave, valor.join(','));}
    } else {
      searchParams.append(clave, valor);
    }
  }
  const query = searchParams.toString();
  return query ? `?${query}` : '';
}

export async function obtenerMapaUbicaciones(params = {}, { signal } = {}) {
  const response = await apiClient.get(`/ubicaciones/mapa${construirQuery(params)}`, { signal });
  return normalizarRespuestaDetalle(response);
}

export async function obtenerMapaAccidentes(params = {}, { signal } = {}) {
  const response = await apiClient.get(`/accidentes/mapa${construirQuery(params)}`, { signal });
  return normalizarRespuestaDetalle(response);
}

export async function obtenerMapaPatinetes(params = {}, { signal } = {}) {
  const response = await apiClient.get(`/patinetes/mapa${construirQuery(params)}`, { signal });
  return normalizarRespuestaDetalle(response);
}

export async function obtenerMapaAforo(params = {}, { signal } = {}) {
  const response = await apiClient.get(`/aforo-bicicletas/mapa${construirQuery(params)}`, { signal });
  return normalizarRespuestaDetalle(response);
}

export async function obtenerMapaRuido(params = {}, { signal } = {}) {
  const response = await apiClient.get(`/ruido/mapa${construirQuery(params)}`, { signal });
  return normalizarRespuestaDetalle(response);
}

export async function obtenerMapaMultas(params = {}, { signal } = {}) {
  const response = await apiClient.get(`/multas/mapa${construirQuery(params)}`, { signal });
  return normalizarRespuestaDetalle(response);
}

export async function obtenerMapaContenedores(params = {}, { signal } = {}) {
  const response = await apiClient.get(`/contenedores/mapa${construirQuery(params)}`, { signal });
  return normalizarRespuestaDetalle(response);
}

export async function obtenerMapaTrafico(params = {}, { signal } = {}) {
  const response = await apiClient.get(`/trafico/mapa${construirQuery(params)}`, { signal });
  return normalizarRespuestaDetalle(response);
}
