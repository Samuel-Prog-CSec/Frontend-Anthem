/**
 * Pagina de Login - identidad "Atlas Civico"
 *
 * Dos paneles:
 *  - Izquierda (lg+): marca + titular + cifras estructurales HONESTAS del
 *    conjunto (no telemetria falsa).
 *  - Derecha: formulario sobrio con la cobalto de marca.
 */

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { Button, Input } from '../../components/common';
import { MarcaGlifo } from '../../components/layout/Wordmark';
import { useAuth } from '../../context';
import { ROUTES, DATE_CONFIG } from '../../constants';

// Cifras estructurales reales del conjunto (no requieren API ni auth).
const CIFRAS_ESCALA = [
  { etiqueta: 'distritos cubiertos', valor: '21' },
  { etiqueta: 'áreas de datos', valor: '12' },
  { etiqueta: 'meses completos', valor: '12' },
  { etiqueta: 'horizonte temporal', valor: `${DATE_CONFIG.DATASET_YEAR}` }
];

function PanelEscala() {
  return (
    <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border">
      {CIFRAS_ESCALA.map((item) => (
        <div key={item.etiqueta} className="flex flex-col gap-1.5 bg-card p-5">
          <p className="stat-hero text-3xl text-foreground">{item.valor}</p>
          <p className="text-xs leading-snug text-muted-foreground">{item.etiqueta}</p>
        </div>
      ))}
    </div>
  );
}

function LoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!identifier.trim()) {
      setError('Indica usuario o correo para continuar.');
      return;
    }
    if (!password || password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    setIsLoading(true);
    try {
      await login(identifier, password);
      navigate(ROUTES.DASHBOARD);
    } catch (err) {
      // El backend devuelve un mensaje generico ("Errores de validacion") para
      // un login fallido, que no orienta al usuario. Lo mapeamos a un mensaje
      // claro segun el caso, preservando los detalles accionables (bloqueo de
      // cuenta, red).
      if (err?.isNetworkError) {
        setError('No se pudo conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.');
      } else if (err?.status === 429 || err?.status === 423) {
        setError(err.message || 'Demasiados intentos. Espera unos minutos e inténtalo de nuevo.');
      } else if (err?.status === 401 || err?.status === 400) {
        const msg = err?.message || '';
        setError(/bloque|intento|temporal/i.test(msg) ? msg : 'Usuario o contraseña incorrectos.');
      } else {
        setError(err?.message || 'No se pudo iniciar sesión. Inténtalo de nuevo.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen bg-background">
      {/* Panel izquierdo - marca y escala */}
      <aside className="relative hidden border-r border-border lg:flex lg:w-1/2">
        <div className="coord-grid pointer-events-none absolute inset-0 opacity-50" aria-hidden="true" />
        <div className="relative z-10 flex w-full flex-col justify-between px-12 py-16 xl:px-20">
          <div className="flex items-center gap-2.5">
            <MarcaGlifo className="size-7" />
            <span className="font-display text-lg font-semibold tracking-tight text-foreground">Anthem</span>
          </div>

          <div className="space-y-5">
            <h1 className="font-display text-5xl font-semibold leading-[1.02] text-foreground xl:text-6xl">
              La ciudad,<br />
              <span className="text-[var(--marca)]">vista</span> en datos.
            </h1>
            <p className="max-w-md text-base leading-relaxed text-muted-foreground">
              El atlas de datos abiertos de Anthem: aire, ruido, movilidad,
              seguridad vial, residuos y demografía de los 21 distritos, en una
              sola superficie.
            </p>
          </div>

          <div className="space-y-3">
            <PanelEscala />
            <p className="text-xs text-muted-foreground">
              Atlas urbano de Madrid. Datos simulados del año {DATE_CONFIG.DATASET_YEAR}.
            </p>
          </div>
        </div>
      </aside>

      {/* Panel derecho - formulario */}
      <section
        className="flex w-full items-center justify-center p-6 sm:p-12 lg:w-1/2"
        aria-label="Formulario de inicio de sesión"
      >
        <div className="w-full max-w-md">
          <div className="mb-10 flex items-center gap-2.5 lg:hidden">
            <MarcaGlifo className="size-7" />
            <span className="font-display text-lg font-semibold tracking-tight text-foreground">Anthem</span>
          </div>

          <div className="space-y-8">
            <header className="space-y-2">
              <h2 className="font-display text-3xl font-semibold leading-tight text-foreground">
                Iniciar sesión
              </h2>
              <p className="text-sm text-muted-foreground">
                Introduce tus credenciales para continuar.
              </p>
            </header>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div
                  className="flex items-start gap-3 rounded-md border border-[var(--alert)] bg-[var(--surface-raised)] p-4"
                  role="alert"
                >
                  <AlertCircle className="mt-0.5 size-4 flex-shrink-0 text-[var(--alert)]" aria-hidden="true" />
                  <p className="text-sm leading-snug text-foreground">{error}</p>
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="identifier" className="block text-sm font-medium text-foreground">
                  Usuario o correo
                </label>
                <Input
                  id="identifier"
                  type="text"
                  placeholder="tu usuario o tu@anthem.es"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                  autoComplete="username"
                  spellCheck={false}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-foreground">
                  Contraseña
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={mostrarPassword ? 'text' : 'password'}
                    className="pr-10"
                    placeholder="Mínimo 8 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarPassword((v) => !v)}
                    aria-label={mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    aria-pressed={mostrarPassword}
                    className="absolute right-2 top-1/2 inline-flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--marca)]"
                  >
                    {mostrarPassword
                      ? <EyeOff className="size-4" aria-hidden="true" />
                      : <Eye className="size-4" aria-hidden="true" />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full" isLoading={isLoading}>
                {!isLoading && <LogIn className="size-4" />}
                Entrar
              </Button>
            </form>

            <hr className="hairline" />

            <p className="text-center text-sm text-muted-foreground">
              ¿No tienes cuenta todavía?{' '}
              <Link
                to={ROUTES.REGISTER}
                className="font-medium text-foreground underline underline-offset-4 hover:text-[var(--marca)]"
              >
                Crear cuenta
              </Link>
            </p>

            <div className="rounded-md border border-border bg-card p-4">
              <p className="mb-1 text-sm font-medium text-foreground">Entorno de demostración</p>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Proyecto educativo con datos simulados. Usa tus credenciales o
                crea una cuenta para explorar el atlas.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default LoginPage;
