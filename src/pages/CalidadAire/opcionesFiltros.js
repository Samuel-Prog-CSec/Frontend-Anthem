/**
 * Opciones de selectores de los filtros de Calidad del Aire.
 *
 * Se separan en un modulo dedicado para cumplir la regla
 * `react-refresh/only-export-components`: un archivo JSX solo exporta
 * componentes; los datos compartidos viven en archivos `.js` aparte.
 */

import { AIR_QUALITY_MAGNITUDES } from '../../constants';

export const opcionesMagnitud = Object.entries(AIR_QUALITY_MAGNITUDES).map(([value, label]) => ({
  value,
  label
}));

export const opcionesMes = [
  { value: '1', label: 'Enero' },
  { value: '2', label: 'Febrero' },
  { value: '3', label: 'Marzo' },
  { value: '4', label: 'Abril' },
  { value: '5', label: 'Mayo' },
  { value: '6', label: 'Junio' },
  { value: '7', label: 'Julio' },
  { value: '8', label: 'Agosto' },
  { value: '9', label: 'Septiembre' },
  { value: '10', label: 'Octubre' },
  { value: '11', label: 'Noviembre' },
  { value: '12', label: 'Diciembre' }
];
