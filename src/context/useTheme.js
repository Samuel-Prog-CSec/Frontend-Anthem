/**
 * Hook useTheme
 *
 * Aislado del ThemeContext.jsx para que ese archivo solo exporte componentes
 * (requisito de react-refresh para HMR fiable).
 */

import { useContext } from 'react';
import ThemeContext from './ThemeContext';

/**
 * Hook para acceder al contexto de tema
 * @returns {{ tema: 'dark'|'light', esOscuro: boolean, setTema: Function, alternarTema: Function }}
 * @throws {Error} Si se usa fuera de un ThemeProvider
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme debe usarse dentro de un ThemeProvider');
  }
  return context;
}
