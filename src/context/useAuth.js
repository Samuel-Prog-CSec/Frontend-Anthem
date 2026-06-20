/**
 * Hook useAuth
 *
 * Aislado del AuthContext.jsx para que ese archivo solo exporte componentes
 * (requisito de react-refresh para HMR fiable).
 */

import { useContext } from 'react';
import AuthContext from './AuthContext';

/**
 * Hook para acceder al contexto de autenticacion
 * @returns {Object} Estado y funciones de autenticacion
 * @throws {Error} Si se usa fuera de un AuthProvider
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}
