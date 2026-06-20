/**
 * Modelo de navegacion de Anthem
 *
 * Las 14 superficies agrupadas por FAMILIA. Cada familia tiene un `dominio`
 * que alimenta el token --dominio (color de acento de la pagina, indicador
 * activo en la sidebar, marcador de mapa, serie principal de chart).
 *
 * Sustituye a la barra de 14 iconos identicos sin etiqueta por una sidebar
 * con icono + texto agrupada, que resuelve la descubribilidad.
 */

import {
  LayoutDashboard, MapPin, Wind, Volume2, Recycle, TrafficCone,
  Zap, Bike, Activity, Footprints, AlertTriangle, FileWarning,
  Users, Network
} from 'lucide-react';
import { ROUTES } from '../../constants';

export const GRUPOS_NAVEGACION = [
  {
    id: 'resumen',
    label: 'Resumen',
    dominio: null,
    items: [
      { path: ROUTES.DASHBOARD, label: 'Panel general', icon: LayoutDashboard }
    ]
  },
  {
    id: 'movilidad',
    label: 'Movilidad',
    dominio: 'movilidad',
    items: [
      { path: ROUTES.TRAFICO, label: 'Tráfico', icon: TrafficCone },
      { path: ROUTES.UBICACIONES, label: 'Ubicaciones', icon: MapPin },
      { path: ROUTES.PATINETES, label: 'Patinetes', icon: Zap },
      { path: ROUTES.BICICLETAS, label: 'Bicicletas', icon: Bike },
      { path: ROUTES.AFORO_BICICLETAS, label: 'Aforo de bicicletas', icon: Activity },
      { path: ROUTES.AFORO_PEATONES, label: 'Aforo de peatones', icon: Footprints }
    ]
  },
  {
    id: 'medioambiente',
    label: 'Medioambiente',
    dominio: 'ambiente',
    items: [
      { path: ROUTES.CALIDAD_AIRE, label: 'Calidad del aire', icon: Wind },
      { path: ROUTES.RUIDO, label: 'Ruido', icon: Volume2 },
      { path: ROUTES.CONTENEDORES, label: 'Contenedores', icon: Recycle }
    ]
  },
  {
    id: 'seguridad',
    label: 'Seguridad vial',
    dominio: 'seguridad',
    items: [
      { path: ROUTES.ACCIDENTES, label: 'Accidentes', icon: AlertTriangle },
      { path: ROUTES.MULTAS, label: 'Multas', icon: FileWarning }
    ]
  },
  {
    id: 'poblacion',
    label: 'Población',
    dominio: 'demografia',
    items: [
      { path: ROUTES.CENSO, label: 'Censo', icon: Users }
    ]
  },
  {
    id: 'analisis',
    label: 'Análisis',
    dominio: 'bi',
    items: [
      { path: ROUTES.CORRELACIONES, label: 'Correlaciones', icon: Network }
    ]
  }
];

/**
 * Mapa ruta -> dominio. Permite a PageLayout inferir el dominio de la pagina
 * a partir de la ruta activa (incluye rutas hijas de correlaciones).
 */
export const DOMINIO_POR_RUTA = (() => {
  const mapa = {};
  for (const grupo of GRUPOS_NAVEGACION) {
    for (const item of grupo.items) {
      mapa[item.path] = grupo.dominio;
    }
  }
  // Ruido vive en la familia "Medioambiente" (agrupacion de la sidebar), pero
  // tiene identidad de color propia (violeta acustico) que el grafo BI y la capa
  // de mapa ya usan. Lo fijamos aqui para que el shell (cabecera de pagina, item
  // activo del sidebar, stat-cards del dashboard) sea coherente con esos sitios.
  mapa[ROUTES.RUIDO] = 'ruido';

  // Vistas que no estan en la sidebar pero tienen dominio claro
  mapa[ROUTES.CORRELACION_AIRE_TRAFICO] = 'bi';
  mapa[ROUTES.CORRELACION_MULTAS_ACCIDENTES] = 'bi';
  mapa[ROUTES.CORRELACION_CENSO_CONTENEDORES] = 'bi';
  mapa[ROUTES.CORRELACION_RUIDO_CENSO] = 'bi';
  return mapa;
})();

/**
 * Resuelve el dominio de una ruta concreta (soporta rutas hijas via prefijo).
 * @param {string} pathname
 * @returns {string|undefined}
 */
export function dominioDeRuta(pathname) {
  if (DOMINIO_POR_RUTA[pathname]) {
    return DOMINIO_POR_RUTA[pathname];
  }
  if (pathname.startsWith('/correlaciones')) { return 'bi'; }
  if (pathname.startsWith('/distritos')) { return 'demografia'; }
  return undefined;
}
