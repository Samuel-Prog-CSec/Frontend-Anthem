/**
 * Pagina de Registro - "Civic Operations Console"
 *
 * Misma direccion estetica que LoginPage: branding tecnico a la izquierda,
 * formulario sobrio a la derecha. Sin gradients, sin blobs, sin shadow-2xl.
 */

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, AlertCircle, Check, ArrowLeft } from 'lucide-react';
import { Button, Input } from '../../components/common';
import { register } from '../../api/authService';
import { ROUTES } from '../../constants';

const REQUISITOS_PASSWORD = [
  { key: 'length',    label: '8 caracteres minimo',           regex: (v) => v.length >= 8 },
  { key: 'uppercase', label: 'Una letra mayuscula',           regex: (v) => /[A-Z]/.test(v) },
  { key: 'lowercase', label: 'Una letra minuscula',           regex: (v) => /[a-z]/.test(v) },
  { key: 'number',    label: 'Un digito numerico',            regex: (v) => /[0-9]/.test(v) },
  { key: 'special',   label: 'Un caracter @ $ ! % * ? &',     regex: (v) => /[@$!%*?&]/.test(v) }
];

function ListaRequisitosPassword({ password }) {
  return (
    <ul
      className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mt-3 list-none"
      aria-label="Requisitos de contrasena"
    >
      {REQUISITOS_PASSWORD.map(({ key, label, regex }) => {
        const cumple = regex(password);
        return (
          <li key={key} className="flex items-center gap-2">
            <span
              className={`size-3 border ${cumple ? 'border-[var(--ok)] bg-[var(--ok)]' : 'border-[var(--border-emphasis)]'} flex items-center justify-center transition-colors`}
              aria-hidden="true"
            >
              {cumple && <Check className="size-2 text-[var(--ink)]" strokeWidth={3} />}
            </span>
            <span
              className={`font-mono text-[10px] uppercase tracking-[0.1em] transition-colors ${cumple ? 'text-[var(--ok)]' : 'text-[var(--ink-tertiary)]'}`}
            >
              {label}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await register(formData);
      navigate(ROUTES.DASHBOARD);
    } catch (err) {
      setError(err.message || 'No se pudo crear el operador. Revisa los datos o intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background flex">
      {/* Panel izquierdo - Contexto editorial */}
      <aside className="hidden lg:flex lg:w-1/2 relative border-r border-[var(--border-hairline)]">
        <div className="relative z-10 flex flex-col justify-between w-full px-12 xl:px-20 py-16">
          <div className="space-y-4">
            <p className="eyebrow">ANTHEM // CTC // ALTA DE OPERADOR</p>
            <h1 className="font-display italic text-5xl xl:text-6xl text-foreground leading-[0.95]">
              Un nuevo <span className="text-[var(--signal)]">turno</span><br />
              en la consola.
            </h1>
            <p className="text-base text-muted-foreground max-w-md leading-relaxed">
              Crea tus credenciales para acceder a las 14 superficies de la
              Smart City. El sistema queda anclado a tu identidad y registra
              toda actividad como huella auditable.
            </p>
          </div>

          <div className="space-y-4">
            <p className="eyebrow">Politica de acceso</p>
            <ul className="space-y-3 text-sm text-muted-foreground leading-relaxed">
              <li className="flex gap-3">
                <span className="font-mono text-[var(--signal)] flex-shrink-0">01</span>
                Tu sesion vive en memoria. El token de refresco se guarda en una cookie httpOnly que JavaScript no puede leer.
              </li>
              <li className="flex gap-3">
                <span className="font-mono text-[var(--signal)] flex-shrink-0">02</span>
                Cada token incluye identificador unico (jti) que permite revocacion individual desde el panel de auditoria.
              </li>
              <li className="flex gap-3">
                <span className="font-mono text-[var(--signal)] flex-shrink-0">03</span>
                Tras cinco intentos fallidos la cuenta se bloquea dos horas. Las contrasenas se cifran con bcrypt cost 12.
              </li>
            </ul>
          </div>

          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--ink-tertiary)]">
            BACKEND // EXPRESS 5 + MONGOOSE 9 // NODE 22
          </p>
        </div>
      </aside>

      {/* Panel derecho - Formulario */}
      <section
        className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12"
        aria-label="Formulario de registro"
      >
        <div className="w-full max-w-md">
          <Link
            to={ROUTES.LOGIN}
            className="inline-flex items-center gap-2 mb-8 font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ArrowLeft className="size-3 transition-transform group-hover:-translate-x-0.5" aria-hidden="true" />
            Volver al acceso
          </Link>

          {/* Wordmark movil */}
          <div className="lg:hidden mb-10 space-y-2">
            <p className="eyebrow">ANTHEM // CTC</p>
            <h1 className="font-display italic text-3xl text-foreground leading-tight">
              Un nuevo <span className="text-[var(--signal)]">turno</span> en la consola.
            </h1>
          </div>

          <div className="space-y-8">
            <header className="space-y-2">
              <p className="eyebrow">Alta de operador</p>
              <h2 className="font-display italic text-3xl text-foreground leading-tight">
                Crear credenciales
              </h2>
              <p className="text-sm text-muted-foreground">
                El usuario quedara activo de inmediato.
              </p>
            </header>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div
                  className="flex items-start gap-3 p-4 border border-[var(--alert)] bg-[var(--surface-raised)]"
                  role="alert"
                >
                  <AlertCircle className="size-4 text-[var(--alert)] flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <p className="text-sm text-foreground leading-snug">{error}</p>
                </div>
              )}

              <div className="space-y-2">
                <label
                  htmlFor="username"
                  className="font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--ink-secondary)] block"
                >
                  Identificador del operador
                </label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="operador.04"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  autoComplete="username"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--ink-secondary)] block"
                >
                  Correo de contacto
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="operador.04@anthem.es"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
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
                  name="password"
                  type="password"
                  placeholder="Diseña una clave robusta"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
                <ListaRequisitosPassword password={formData.password} />
              </div>

              <Button type="submit" className="w-full" isLoading={isLoading}>
                {!isLoading && <UserPlus className="size-4" />}
                Activar operador
              </Button>
            </form>

            <hr className="hairline" />

            <p className="text-sm text-muted-foreground text-center">
              ¿Ya tienes credenciales?{' '}
              <Link
                to={ROUTES.LOGIN}
                className="text-foreground underline underline-offset-4 hover:text-[var(--signal)]"
              >
                Entrar a la consola
              </Link>
            </p>

            <p className="text-center font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--ink-tertiary)] leading-relaxed">
              Al activar tu cuenta aceptas los terminos de uso de la consola
              y la politica de auditoria de Anthem City.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

export default RegisterPage;
