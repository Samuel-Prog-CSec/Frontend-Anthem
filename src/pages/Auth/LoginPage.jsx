/**
 * Pagina de Login - "Civic Operations Console"
 *
 * Dos paneles editoriales:
 *  - Izquierda (lg+): wordmark monoespacial + cabecera serif italic +
 *    bento tipo telemetria con metricas de la ciudad (mock fallback si
 *    no hay endpoint publico). Sin gradients ni blobs.
 *  - Derecha: formulario sobrio, button signal yellow, copy editorial.
 */

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, AlertCircle } from 'lucide-react';
import { Button, Input } from '../../components/common';
import { useAuth } from '../../context';
import { ROUTES } from '../../constants';

/**
 * Card mini de telemetria estatica (placeholder editorial).
 *
 * No depende de la API porque LoginPage es publico: si pidieramos al
 * backend, expondriamos endpoint sin auth. Los valores son indicativos
 * de la escala del dataset (ver Fase 0 / docs).
 */
const TELEMETRIA_VIVA = [
  { etiqueta: 'Estaciones acusticas', valor: '93', unidad: 'activas', estado: 'ok' },
  { etiqueta: 'Calidad del aire', valor: '22.8', unidad: 'µg/m³ NO2', estado: 'ok' },
  { etiqueta: 'Puntos de trafico', valor: '13.1K', unidad: 'sensorizados', estado: 'ok' },
  { etiqueta: 'Ruido medio LAeq24', valor: '60.1', unidad: 'dB urbano', estado: 'caution' }
];

function PanelTelemetria() {
  return (
    <div className="grid grid-cols-2 gap-px bg-[var(--border-hairline)] border border-[var(--border-hairline)]">
      {TELEMETRIA_VIVA.map((item) => (
        <div key={item.etiqueta} className="bg-[var(--surface)] p-5 flex flex-col gap-2">
          <p className="eyebrow">{item.etiqueta}</p>
          <p className="stat-number text-2xl text-foreground">{item.valor}</p>
          <div className="flex items-center gap-2">
            <span
              className={`size-1.5 rounded-full ${item.estado === 'ok' ? 'bg-[var(--ok)]' : 'bg-[var(--caution)]'}`}
              aria-hidden="true"
            />
            <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--ink-tertiary)]">
              {item.unidad}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function LoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
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
      setError('La contrasena debe tener al menos 8 caracteres.');
      return;
    }

    setIsLoading(true);
    try {
      await login(identifier, password);
      navigate(ROUTES.DASHBOARD);
    } catch (err) {
      setError(err.message || 'No se pudo iniciar sesion. Revisa tus credenciales o intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background flex">
      {/* Panel izquierdo - Branding tecnico */}
      <aside className="hidden lg:flex lg:w-1/2 relative border-r border-[var(--border-hairline)]">
        <div className="relative z-10 flex flex-col justify-between w-full px-12 xl:px-20 py-16">
          {/* Wordmark superior */}
          <div className="space-y-4">
            <p className="eyebrow">ANTHEM // CTC // ACCESO</p>
            <h1 className="font-display italic text-5xl xl:text-6xl text-foreground leading-[0.95]">
              La ciudad,<br />
              <span className="text-[var(--signal)]">vista</span> en datos.
            </h1>
            <p className="text-base text-muted-foreground max-w-md leading-relaxed">
              Consola integral de operaciones urbanas para la malla sensorizada
              de Anthem City. Aire, ruido, movilidad, censo, accidentalidad,
              en una sola superficie.
            </p>
          </div>

          {/* Bento de telemetria viva */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="eyebrow">Pulso del sistema / instantanea 2051</p>
              <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--ink-tertiary)]">
                ENERO – DICIEMBRE
              </p>
            </div>
            <PanelTelemetria />
          </div>

          {/* Footer del panel */}
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--ink-tertiary)]">
            12 MODULOS // 21 DISTRITOS // ~24M REGISTROS
          </p>
        </div>
      </aside>

      {/* Panel derecho - Formulario */}
      <section
        className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12"
        aria-label="Formulario de inicio de sesion"
      >
        <div className="w-full max-w-md">
          {/* Wordmark movil */}
          <div className="lg:hidden text-center mb-10 space-y-2">
            <p className="eyebrow">ANTHEM // CTC</p>
            <h1 className="font-display italic text-3xl text-foreground leading-tight">
              La ciudad, <span className="text-[var(--signal)]">vista</span> en datos.
            </h1>
          </div>

          {/* Formulario */}
          <div className="space-y-8">
            <header className="space-y-2">
              <p className="eyebrow">Identificacion del operador</p>
              <h2 className="font-display italic text-3xl text-foreground leading-tight">
                Acceso a la consola
              </h2>
              <p className="text-sm text-muted-foreground">
                Introduce tus credenciales para continuar.
              </p>
            </header>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div
                  className="flex items-start gap-3 p-4 border border-[var(--alert)] bg-[var(--surface-raised)]"
                  role="alert"
                >
                  <AlertCircle className="size-4 text-[var(--alert)] flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-foreground leading-snug">{error}</p>
                </div>
              )}

              <div className="space-y-2">
                <label
                  htmlFor="identifier"
                  className="font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--ink-secondary)] block"
                >
                  Usuario o correo
                </label>
                <Input
                  id="identifier"
                  type="text"
                  placeholder="operador.04 o tu@ciudad.es"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                  autoComplete="username"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--ink-secondary)] block"
                >
                  Clave de acceso
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Minimo 8 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                isLoading={isLoading}
              >
                {!isLoading && <LogIn className="size-4" />}
                Entrar a la consola
              </Button>
            </form>

            <hr className="hairline" />

            <p className="text-sm text-muted-foreground text-center">
              Sin credenciales todavia?{' '}
              <Link
                to={ROUTES.REGISTER}
                className="text-foreground underline underline-offset-4 hover:text-[var(--signal)]"
              >
                Solicitar acceso
              </Link>
            </p>

            <div className="border border-[var(--border-hairline)] bg-[var(--surface)] p-4">
              <p className="eyebrow mb-2">Modo demostracion</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Entorno de practica universitaria. Usa las credenciales del
                backend local o registra un operador nuevo para explorar la
                consola.
              </p>
            </div>

            <p className="text-center font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--ink-tertiary)]">
              ANTHEM CITY DASHBOARD 2051 / PROYECTO UNIVERSITARIO
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

export default LoginPage;
