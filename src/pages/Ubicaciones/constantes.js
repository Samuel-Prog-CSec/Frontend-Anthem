/**
 * Constantes de Ubicaciones
 *
 * Mapeos de iconos, badge variants y conversion de tipos de la UI a los
 * parametros que esperan los endpoints `/ubicaciones/transporte/:tipo`
 * y `/ubicaciones/puntos-medicion/:tipo`. Separadas en .js para cumplir
 * `react-refresh/only-export-components`.
 */

import { AudioLines, Bus, Car, Train } from 'lucide-react';
import { LOCATION_TYPE_LABELS } from '../../constants';

export const opcionesTipo = Object.entries(LOCATION_TYPE_LABELS).map(([value, label]) => ({
  value,
  label
}));

export const iconosPorTipo = {
  estacion_acustica: AudioLines,
  punto_trafico: Car,
  ruta_cercanias: Train,
  ruta_autobus: Bus,
  ruta_interurbano: Bus,
  ruta_metro: Train,
  ruta_metro_ligero: Train,
  zona_taxi: Car
};

export const variantesBadgePorTipo = {
  estacion_acustica: 'purple',
  punto_trafico: 'warning',
  ruta_cercanias: 'info',
  ruta_autobus: 'success',
  ruta_interurbano: 'secondary',
  ruta_metro: 'default',
  ruta_metro_ligero: 'info',
  zona_taxi: 'warning'
};

export const tipoTransportePorTipo = {
  ruta_cercanias: 'cercanias',
  ruta_autobus: 'autobus',
  ruta_interurbano: 'interurbano',
  ruta_metro: 'metro',
  ruta_metro_ligero: 'metro_ligero'
};

export const tipoMedicionPorTipo = {
  estacion_acustica: 'acustica',
  punto_trafico: 'trafico'
};
