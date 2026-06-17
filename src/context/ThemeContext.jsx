/**
 * Context de Tema (claro / oscuro)
 *
 * Gestiona el tema visual de Anthem. Por defecto OSCURO ("plano nocturno"),
 * con alternancia a CLARO ("blanco tecnico"). La clase `dark` se aplica sobre
 * <html>; los tokens OKLCH del index.css cambian en runtime.
 *
 * El hook `useTheme` vive en `useTheme.js` para que este archivo solo exporte
 * componentes (react-refresh / HMR).
 *
 * Para evitar flash de tema incorrecto (FOUC), un script inline en index.html
 * aplica la clase ANTES del primer paint; este provider sincroniza el estado.
 */

import { createContext, useState, useEffect, useCallback, useMemo } from 'react';

const ThemeContext = createContext(null);

const STORAGE_KEY = 'anthem-tema';
const TEMA_POR_DEFECTO = 'dark';

/**
 * Aplica el tema al documento y al meta theme-color. Devuelve si es oscuro.
 * @param {'dark'|'light'} tema
 * @returns {boolean}
 */
function aplicarTema(tema) {
  const esOscuro = tema === 'dark';
  document.documentElement.classList.toggle('dark', esOscuro);
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute('content', esOscuro ? '#1b1f27' : '#f4f6fa');
  }
  return esOscuro;
}

/**
 * Provider de tema
 * @param {Object} props
 * @param {React.ReactNode} props.children
 */
export function ThemeProvider({ children }) {
  const [tema, setTema] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || TEMA_POR_DEFECTO;
    } catch {
      return TEMA_POR_DEFECTO;
    }
  });

  useEffect(() => {
    aplicarTema(tema);
    try {
      localStorage.setItem(STORAGE_KEY, tema);
    } catch {
      // localStorage no disponible (modo privado): el tema vive en memoria.
    }
  }, [tema]);

  const alternarTema = useCallback(() => {
    setTema((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const value = useMemo(
    () => ({ tema, esOscuro: tema === 'dark', setTema, alternarTema }),
    [tema, alternarTema]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export default ThemeContext;
