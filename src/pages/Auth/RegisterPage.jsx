/**
 * Pagina de Registro
 *
 * Formulario de registro de nuevo usuario con diseno futurista.
 */

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, UserPlus, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import { Button, Input, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/common';
import { register } from '../../api/authService';
import { ROUTES } from '../../constants';

/**
 * Pagina de registro
 */
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
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await register(formData);
      navigate(ROUTES.DASHBOARD);
    } catch (err) {
      setError(err.message || 'Error al registrar. Intenta con otros datos.');
    } finally {
      setIsLoading(false);
    }
  };

  // Validacion visual del password
  const passwordChecks = {
    length: formData.password.length >= 8,
    uppercase: /[A-Z]/.test(formData.password),
    lowercase: /[a-z]/.test(formData.password),
    number: /[0-9]/.test(formData.password),
    special: /[@$!%*?&]/.test(formData.password)
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-emerald-950 flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-xl">
        {/* Boton volver */}
        <Link
          to={ROUTES.LOGIN}
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6 group"
        >
          <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" aria-hidden="true" />
          <span className="text-sm">Volver al login</span>
        </Link>

        {/* Card del formulario */}
        <Card className="shadow-2xl">
          <CardHeader className="text-center pb-2">
            {/* Logo */}
            <div className="mx-auto mb-4">
              <div className="inline-flex items-center justify-center size-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 shadow-lg shadow-emerald-500/20">
                <UserPlus className="size-8 text-white" aria-hidden="true" />
              </div>
            </div>
            <CardTitle className="text-2xl">Crear Cuenta</CardTitle>
            <CardDescription className="text-base">
              Unete a Anthem City Smart Dashboard
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-8 pt-6">
              {/* Error */}
              {error && (
                <div
                  className="flex items-center gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/30"
                  role="alert"
                >
                  <AlertCircle className="size-5 text-destructive flex-shrink-0" aria-hidden="true" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              {/* Username */}
              <div className="space-y-3">
                <label htmlFor="username" className="text-sm font-medium text-foreground/80 block">
                  Usuario
                </label>
                <div className="relative group">
                  <span
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary z-10 pointer-events-none"
                    aria-hidden="true"
                  >
                    @
                  </span>
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    placeholder="juanperez"
                    value={formData.username}
                    onChange={handleChange}
                    className="pl-14 h-12"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-3">
                <label htmlFor="email" className="text-sm font-medium text-foreground/80 block">
                  Correo electronico
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  startIcon={Mail}
                  className="h-12"
                  required
                />
              </div>

              {/* Password */}
              <div className="space-y-3">
                <label htmlFor="password" className="text-sm font-medium text-foreground/80 block">
                  Contrasena
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Crea una contrasena segura"
                  value={formData.password}
                  onChange={handleChange}
                  startIcon={Lock}
                  className="h-12"
                  required
                  minLength={8}
                />

                {/* Requisitos del password */}
                <ul className="grid grid-cols-2 gap-2 mt-3 list-none" aria-label="Requisitos de contrasena">
                  {[
                    { key: 'length', label: '8+ caracteres' },
                    { key: 'uppercase', label: '1 mayuscula' },
                    { key: 'lowercase', label: '1 minuscula' },
                    { key: 'number', label: '1 numero' },
                    { key: 'special', label: '1 especial (@$!%*?&)' }
                  ].map(({ key, label }) => (
                    <li key={key} className="flex items-center gap-2">
                      <CheckCircle2
                        className={`size-4 transition-colors ${
                          passwordChecks[key] ? 'text-emerald-400' : 'text-muted-foreground/60'
                        }`}
                        aria-hidden="true"
                      />
                      <span className={`text-xs transition-colors ${
                        passwordChecks[key] ? 'text-emerald-400' : 'text-muted-foreground'
                      }`}>
                        {label}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>

            <CardFooter className="flex-col gap-5 pt-2">
              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 shadow-lg shadow-emerald-500/20"
                isLoading={isLoading}
              >
                {!isLoading && <UserPlus className="size-5 mr-2" aria-hidden="true" />}
                Crear Cuenta
              </Button>

              <p className="text-sm text-muted-foreground text-center">
                ¿Ya tienes una cuenta?{' '}
                <Link to={ROUTES.LOGIN} className="text-primary hover:text-primary/80 font-medium transition-colors">
                  Iniciar Sesion
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>

        {/* Terminos */}
        <p className="text-center text-xs text-muted-foreground mt-6 px-4">
          Al registrarte, aceptas los terminos de uso y politica de privacidad de Anthem City Dashboard.
        </p>
      </div>
    </main>
  );
}

export default RegisterPage;
