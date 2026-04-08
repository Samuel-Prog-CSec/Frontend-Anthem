/**
 * Pagina de Login
 * 
 * Formulario de inicio de sesion con validacion y diseno futurista.
 */

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, LogIn, AlertCircle, Zap, Shield, Activity } from 'lucide-react';
import { Button, Input, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/common';
import { useAuth } from '../../context';
import { ROUTES } from '../../constants';

/**
 * Pagina de inicio de sesion
 */
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

    // Validacion basica client-side
    if (!identifier.trim()) {
      setError('El usuario o email es obligatorio');
      return;
    }
    if (!password || password.length < 8) {
      setError('La contrasena debe tener al menos 8 caracteres');
      return;
    }

    setIsLoading(true);

    try {
      await login(identifier, password);
      navigate(ROUTES.DASHBOARD);
    } catch (err) {
      setError(err.message || 'Error al iniciar sesion. Verifica tus credenciales.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950 flex">
      {/* Panel izquierdo - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Fondo con patron */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/20 to-emerald-600/20" />
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2306b6d4' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        />
        
        {/* Contenido del branding */}
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20">
          {/* Logo grande */}
          <div className="mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500 to-emerald-500 shadow-2xl shadow-cyan-500/30 mb-6">
              <span className="text-white font-bold text-4xl">A</span>
            </div>
            <h1 className="text-5xl font-bold text-white mb-4">
              Anthem City
            </h1>
            <p className="text-xl text-cyan-100/80">
              Smart Dashboard 2051
            </p>
          </div>

          {/* Features */}
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                <Activity className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">Monitoreo en Tiempo Real</h3>
                <p className="text-slate-400">Datos de calidad del aire, ruido y ubicaciones actualizados constantemente.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <Zap className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">Analisis Inteligente</h3>
                <p className="text-slate-400">Visualizaciones avanzadas para tomar decisiones informadas.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center">
                <Shield className="w-6 h-6 text-violet-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">Seguridad Avanzada</h3>
                <p className="text-slate-400">Autenticacion JWT con los mas altos estandares de seguridad.</p>
              </div>
            </div>
          </div>

          {/* Footer del panel */}
          <div className="mt-12 pt-8 border-t border-cyan-500/20">
            <p className="text-sm text-slate-500">
              Sistema de gestion urbana inteligente
            </p>
          </div>
        </div>

        {/* Circulos decorativos */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl" />
      </div>

      {/* Panel derecho - Formulario */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-lg">
          {/* Logo movil */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-emerald-500 shadow-lg shadow-cyan-500/20 mb-4">
              <span className="text-white font-bold text-3xl">A</span>
            </div>
            <h1 className="text-2xl font-bold text-white">Anthem City</h1>
            <p className="text-slate-400 mt-1">Smart Dashboard 2051</p>
          </div>

          {/* Card del formulario */}
          <Card className="border-slate-700/50 bg-slate-900/80 backdrop-blur-xl shadow-2xl">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl">Bienvenido</CardTitle>
              <CardDescription className="text-base">
                Ingresa tus credenciales para continuar
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

                {/* Identifier */}
                <div className="space-y-3">
                  <label htmlFor="identifier" className="text-sm font-medium text-slate-300 block">
                    Usuario o Correo
                  </label>
                  <Input
                    id="identifier"
                    type="text"
                    placeholder="usuario o tu@email.com"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    startIcon={Mail}
                    className="h-12 text-base bg-slate-800/50 border-slate-700 focus:border-cyan-500 focus:ring-cyan-500/20"
                    required
                  />
                </div>

                {/* Password */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label htmlFor="password" className="text-sm font-medium text-slate-300">
                      Contrasena
                    </label>
                    <button type="button" className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors">
                      ¿Olvidaste tu contrasena?
                    </button>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Ingresa tu contrasena"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    startIcon={Lock}
                    className="h-12 text-base bg-slate-800/50 border-slate-700 focus:border-cyan-500 focus:ring-cyan-500/20"
                    required
                  />
                </div>
              </CardContent>

              <CardFooter className="flex-col gap-5 pt-2">
                <Button 
                  type="submit" 
                  className="w-full h-12 text-base font-semibold bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 shadow-lg shadow-cyan-500/20" 
                  isLoading={isLoading}
                >
                  {!isLoading && <LogIn className="h-5 w-5 mr-2" />}
                  Iniciar Sesion
                </Button>

                <div className="relative w-full">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-700" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-slate-900 px-4 text-slate-500">o</span>
                  </div>
                </div>

                <p className="text-sm text-slate-400 text-center">
                  ¿No tienes una cuenta?{' '}
                  <Link to={ROUTES.REGISTER} className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors">
                    Crear cuenta
                  </Link>
                </p>
              </CardFooter>
            </form>
          </Card>

          {/* Info de demo */}
          <div className="mt-6 p-4 rounded-xl border border-amber-500/30 bg-amber-500/5">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <Zap className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-amber-300">Modo Demo</p>
                <p className="text-xs text-amber-400/70 mt-0.5">
                  Usa las credenciales del backend o registra un nuevo usuario para probar.
                </p>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <p className="text-center text-xs text-slate-600 mt-8">
            Anthem City Dashboard 2051. Proyecto Universitario.
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
