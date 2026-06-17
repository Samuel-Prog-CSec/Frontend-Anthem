/**
 * Pagina de Registro - identidad "Atlas Civico"
 *
 * Mismo lenguaje que LoginPage: marca + contexto a la izquierda, formulario
 * sobrio a la derecha. Sin roleplay de consola ni numeracion decorativa.
 */

import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, AlertCircle, Check, ArrowLeft } from 'lucide-react';
import { Button, Input } from '../../components/common';
import { MarcaGlifo } from '../../components/layout/Wordmark';
import { register } from '../../api/authService';
import { ROUTES, DATE_CONFIG } from '../../constants';

const REQUISITOS_PASSWORD = [
  { key: 'length',    label: '8 caracteres mínimo',       regex: (v) => v.length >= 8 },
  { key: 'uppercase', label: 'Una letra mayúscula',       regex: (v) => /[A-Z]/.test(v) },
  { key: 'lowercase', label: 'Una letra minúscula',       regex: (v) => /[a-z]/.test(v) },
  { key: 'number',    label: 'Un dígito numérico',        regex: (v) => /[0-9]/.test(v) },
  { key: 'special',   label: 'Un carácter @ $ ! % * ? &', regex: (v) => /[@$!%*?&]/.test(v) }
];

const POLITICA_ACCESO = [
  'Tu sesión se guarda de forma segura y se renueva sin pedirte la contraseña en cada visita.',
  'Puedes cerrar la sesión en cualquier momento y revocar el acceso.',
  'Tras cinco intentos fallidos la cuenta se bloquea dos horas. Tu contraseña se guarda siempre cifrada.'
];

function ListaRequisitosPassword({ password }) {
  return (
    <ul
      className="mt-3 grid list-none grid-cols-1 gap-1.5 sm:grid-cols-2"
      aria-label="Requisitos de contraseña"
    >
      {REQUISITOS_PASSWORD.map(({ key, label, regex }) => {
        const cumple = regex(password);
        return (
          <li key={key} className="flex items-center gap-2">
            <span
              className={`flex size-3.5 items-center justify-center rounded-sm border transition-colors ${cumple ? 'border-[var(--ok)] bg-[var(--ok)]' : 'border-[var(--border-emphasis)]'}`}
              aria-hidden="true"
            >
              {cumple && <Check className="size-2.5 text-[var(--on-status)]" strokeWidth={3} />}
            </span>
            <span className={`text-xs transition-colors ${cumple ? 'text-foreground' : 'text-muted-foreground'}`}>
              {label}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

function RegisterPage() {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Limpia cualquier error que persista entre navegaciones al montar la vista.
  useEffect(() => {
    setError('');
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.username.trim()) {
      setError('Indica un nombre de usuario para continuar.');
      return;
    }
    if (!formData.email.trim()) {
      setError('Indica un correo de contacto para continuar.');
      return;
    }
    if (!REQUISITOS_PASSWORD.every((requisito) => requisito.regex(formData.password))) {
      setError('La contraseña no cumple todos los requisitos de seguridad indicados.');
      return;
    }

    setIsLoading(true);
    try {
      await register(formData);
      navigate(ROUTES.DASHBOARD);
    } catch (err) {
      if (err?.isNetworkError) {
        setError('No se pudo conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.');
      } else if (err?.status === 409) {
        setError('Ese usuario o correo ya está registrado. Prueba con otro o inicia sesión.');
      } else {
        setError(err?.message || 'No se pudo crear la cuenta. Revisa los datos o inténtalo de nuevo.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen bg-background">
      {/* Panel izquierdo - contexto */}
      <aside className="relative hidden border-r border-border lg:flex lg:w-1/2">
        <div className="coord-grid pointer-events-none absolute inset-0 opacity-50" aria-hidden="true" />
        <div className="relative z-10 flex w-full flex-col justify-between px-12 py-16 xl:px-20">
          <div className="flex items-center gap-2.5">
            <MarcaGlifo className="size-7" />
            <span className="font-display text-lg font-semibold tracking-tight text-foreground">Anthem</span>
          </div>

          <div className="space-y-5">
            <h1 className="font-display text-5xl font-semibold leading-[1.02] text-foreground xl:text-6xl">
              Crea tu <span className="text-[var(--marca)]">cuenta</span><br />
              en Anthem.
            </h1>
            <p className="max-w-md text-base leading-relaxed text-muted-foreground">
              Accede a las áreas del atlas urbano: aire, ruido, movilidad,
              seguridad vial, residuos y demografía de los 21 distritos.
            </p>
            <ul className="space-y-2.5 pt-2">
              {POLITICA_ACCESO.map((punto) => (
                <li key={punto} className="flex gap-3 text-sm leading-relaxed text-muted-foreground">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-[var(--marca)]" aria-hidden="true" />
                  {punto}
                </li>
              ))}
            </ul>
          </div>

          <p className="text-xs text-muted-foreground">
            Atlas urbano de Madrid. Datos simulados del año {DATE_CONFIG.DATASET_YEAR}.
          </p>
        </div>
      </aside>

      {/* Panel derecho - formulario */}
      <section
        className="flex w-full items-center justify-center p-6 sm:p-12 lg:w-1/2"
        aria-label="Formulario de registro"
      >
        <div className="w-full max-w-md">
          <Link
            to={ROUTES.LOGIN}
            className="group mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" aria-hidden="true" />
            Volver a iniciar sesión
          </Link>

          <div className="mb-10 flex items-center gap-2.5 lg:hidden">
            <MarcaGlifo className="size-7" />
            <span className="font-display text-lg font-semibold tracking-tight text-foreground">Anthem</span>
          </div>

          <div className="space-y-8">
            <header className="space-y-2">
              <h2 className="font-display text-3xl font-semibold leading-tight text-foreground">
                Crear cuenta
              </h2>
              <p className="text-sm text-muted-foreground">
                Tu cuenta quedará activa de inmediato.
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
                <label htmlFor="username" className="block text-sm font-medium text-foreground">
                  Usuario
                </label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="tu.usuario"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  autoComplete="username"
                  spellCheck={false}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-foreground">
                  Correo de contacto
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="tu.correo@anthem.es"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  autoComplete="email"
                  spellCheck={false}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-foreground">
                  Contraseña
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Crea una contraseña segura"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={8}
                  disabled={isLoading}
                  autoComplete="new-password"
                />
                <ListaRequisitosPassword password={formData.password} />
              </div>

              <Button type="submit" className="w-full" isLoading={isLoading}>
                {!isLoading && <UserPlus className="size-4" />}
                Crear cuenta
              </Button>
            </form>

            <hr className="hairline" />

            <p className="text-center text-sm text-muted-foreground">
              ¿Ya tienes cuenta?{' '}
              <Link
                to={ROUTES.LOGIN}
                className="font-medium text-foreground underline underline-offset-4 hover:text-[var(--marca)]"
              >
                Entrar
              </Link>
            </p>

            <p className="text-center text-xs leading-relaxed text-muted-foreground">
              Proyecto académico con datos simulados; tu cuenta solo habilita el
              acceso a este atlas de demostración.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

export default RegisterPage;
