/**
 * Context de Autenticacion
 * 
 * Maneja el estado global de autenticacion:
 * - Usuario actual
 * - Estado de carga inicial
 * - Funciones de login/logout
 */

import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { login as apiLogin, logout as apiLogout, restoreSession } from '../api/authService';

const AuthContext = createContext(null);

/**
 * Provider de autenticacion
 * @param {Object} props - Props del componente
 * @param {React.ReactNode} props.children - Componentes hijos
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const initRef = useRef(false);

  // Restaurar sesion al cargar la app
  useEffect(() => {
    const initAuth = async () => {
      // Evitar doble ejecucion en React Strict Mode
      if (initRef.current) return;
      initRef.current = true;

      try {
        const session = await restoreSession();
        if (session) {
          setUser(session.user);
          setIsAuthenticated(true);
        }
      } catch {
        // Sesion no valida, el usuario debera hacer login
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // Escuchar evento de logout forzado (token expirado)
  useEffect(() => {
    const handleForcedLogout = () => {
      setUser(null);
      setIsAuthenticated(false);
    };

    window.addEventListener('auth:logout', handleForcedLogout);
    return () => window.removeEventListener('auth:logout', handleForcedLogout);
  }, []);

  const login = useCallback(async (email, password) => {
    const result = await apiLogin(email, password);
    setUser(result.user);
    setIsAuthenticated(true);
    return result;
  }, []);

  const logout = useCallback(async () => {
    await apiLogout();
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const value = {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook para acceder al contexto de autenticacion
 * @returns {Object} Estado y funciones de autenticacion
 */
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  
  return context;
}

export default AuthContext;
