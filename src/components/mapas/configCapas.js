/**
 * Configuracion compartida del MapaUnificado.
 *
 * Define la paleta de colores por capa y los metadatos visuales que usan
 * tanto las capas individuales (CapaPuntos) como el PanelCapasMapa para
 * mostrar la leyenda. Centralizar aqui evita duplicar valores en multiples
 * componentes y facilita anadir capas nuevas.
 */

import { AudioLines, Car, AlertTriangle, Receipt, Zap, Bike, Volume2 } from 'lucide-react';

/**
 * Paleta de colores semantica por dominio. Elegidos para contraste visual
 * en mapa Leaflet con tile OSM. Si se anade una capa nueva, anadir aqui.
 */
// Paleta alineada con la identidad "Atlas Civico": 6 colores distinguibles
// entre si y coherentes con los tokens de dominio. Legibles sobre el basemap
// claro y sobre el basemap oscuro filtrado.
export const COLORES_CAPA = {
  ubicaciones: '#3b82c4', // cobalto
  accidentes: '#d9533f',  // rojo
  multas: '#d9a03f',      // ambar
  patinetes: '#c2693c',   // terracota
  aforo: '#2ba39b',       // teal
  ruido: '#8a5bc2'        // violeta
};

/**
 * Metadatos visuales de cada capa. Usado por PanelCapasMapa para construir
 * los switches y la leyenda. El orden de este array es el orden visual.
 */
export const CAPAS_DISPONIBLES = [
  {
    id: 'ubicaciones',
    nombre: 'Estaciones y rutas',
    descripcion: 'Estaciones acústicas, puntos de tráfico y rutas de transporte',
    color: COLORES_CAPA.ubicaciones,
    icon: Car
  },
  {
    id: 'aforo',
    nombre: 'Aforo bicicletas',
    descripcion: 'Estaciones de conteo de bicicletas',
    color: COLORES_CAPA.aforo,
    icon: Bike
  },
  {
    id: 'ruido',
    nombre: 'Estaciones de ruido',
    descripcion: 'Estaciones de monitoreo acústico con niveles dB',
    color: COLORES_CAPA.ruido,
    icon: AudioLines
  },
  {
    id: 'accidentes',
    nombre: 'Accidentes',
    descripcion: 'Accidentes de tráfico georreferenciados',
    color: COLORES_CAPA.accidentes,
    icon: AlertTriangle
  },
  {
    id: 'multas',
    nombre: 'Multas',
    descripcion: 'Multas de tráfico con coordenadas válidas',
    color: COLORES_CAPA.multas,
    icon: Receipt
  },
  {
    id: 'patinetes',
    nombre: 'Patinetes (por distrito)',
    descripcion: 'Asignación de patinetes agregada por distrito (centroide)',
    color: COLORES_CAPA.patinetes,
    icon: Zap
  }
];

/**
 * IDs de las capas que se activan por defecto al abrir el mapa.
 * Mantenemos solo "ubicaciones" para evitar 6 requests simultaneas en frio
 * (usuario activa el resto bajo demanda).
 */
export const CAPAS_POR_DEFECTO = ['ubicaciones'];
