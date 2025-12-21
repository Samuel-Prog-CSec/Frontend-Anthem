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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-xl">
        {/* Boton volver */}
        <Link 
          to={ROUTES.LOGIN}
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6 group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span className="text-sm">Volver al login</span>
        </Link>

        {/* Card del formulario */}
        <Card className="border-slate-700/50 bg-slate-900/80 backdrop-blur-xl shadow-2xl">
          <CardHeader className="text-center pb-2">
            {/* Logo */}
            <div className="mx-auto mb-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 shadow-lg shadow-emerald-500/20">
                <UserPlus className="w-8 h-8 text-white" />
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
                <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30">
                  <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
                  <p className="text-sm text-red-300">{error}</p>
                </div>
              )}

              {/* Username */}
              <div className="space-y-3">
                <label htmlFor="username" className="text-sm font-medium text-slate-300 block">
                  Usuario
                </label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-emerald-400 z-10 pointer-events-none">@</span>
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    placeholder="juanperez"
                    value={formData.username}
                    onChange={handleChange}
                    className="pl-14 h-12 bg-slate-800/50 border-slate-700 focus:border-emerald-500 focus:ring-emerald-500/20"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-3">
                <label htmlFor="email" className="text-sm font-medium text-slate-300 block">
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
                  className="h-12 bg-slate-800/50 border-slate-700 focus:border-emerald-500 focus:ring-emerald-500/20"
                  required
                />
              </div>

              {/* Password */}
              <div className="space-y-3">
                <label htmlFor="password" className="text-sm font-medium text-slate-300 block">
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
                  className="h-12 bg-slate-800/50 border-slate-700 focus:border-emerald-500 focus:ring-emerald-500/20"
                  required
                  minLength={8}
                />
                
                {/* Requisitos del password */}
                <div className="grid grid-cols-2 gap-2 mt-3">
                  {[
                    { key: 'length', label: '8+ caracteres' },
                    { key: 'uppercase', label: '1 mayuscula' },
                    { key: 'lowercase', label: '1 minuscula' },
                    { key: 'number', label: '1 numero' },
                    { key: 'special', label: '1 especial (@$!%*?&)' }
                  ].map(({ key, label }) => (
                    <div key={key} className="flex items-center gap-2">
                      <CheckCircle2 
                        className={`w-4 h-4 transition-colors ${
                          passwordChecks[key] ? 'text-emerald-400' : 'text-slate-600'
                        }`} 
                      />
                      <span className={`text-xs transition-colors ${
                        passwordChecks[key] ? 'text-emerald-400' : 'text-slate-500'
                      }`}>
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex-col gap-5 pt-2">
              <Button 
                type="submit" 
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 shadow-lg shadow-emerald-500/20" 
                isLoading={isLoading}
              >
                {!isLoading && <UserPlus className="h-5 w-5 mr-2" />}
                Crear Cuenta
              </Button>

              <p className="text-sm text-slate-400 text-center">
                ¿Ya tienes una cuenta?{' '}
                <Link to={ROUTES.LOGIN} className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
                  Iniciar Sesion
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>

        {/* Terminos */}
        <p className="text-center text-xs text-slate-600 mt-6 px-4">
          Al registrarte, aceptas los terminos de uso y politica de privacidad de Anthem City Dashboard.
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
