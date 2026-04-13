/**
 * App - Componente principal
 *
 * Configuracion de rutas y providers de la aplicacion.
 * Usa React Router v7 para el enrutamiento.
 * Code splitting con React.lazy para carga diferida de paginas.
 */

import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context';
import { ROUTES } from './constants';
import { LoadingState, ErrorBoundary } from './components/common';

// Code splitting: carga diferida de paginas
const DashboardPage = lazy(() => import('./pages/Dashboard/DashboardPage'));
const LoginPage = lazy(() => import('./pages/Auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/Auth/RegisterPage'));
const PaginaUbicaciones = lazy(() => import('./pages/Ubicaciones/PaginaUbicaciones'));
const PaginaCalidadAire = lazy(() => import('./pages/CalidadAire/PaginaCalidadAire'));
const PaginaRuido = lazy(() => import('./pages/Ruido/PaginaRuido'));
const PaginaAccidentes = lazy(() => import('./pages/Accidentes/PaginaAccidentes'));
const PaginaPatinetes = lazy(() => import('./pages/Patinetes/PaginaPatinetes'));
const PaginaBicicletas = lazy(() => import('./pages/Bicicletas/PaginaBicicletas'));
const PaginaCenso = lazy(() => import('./pages/Censo/PaginaCenso'));
const PaginaMultas = lazy(() => import('./pages/Multas/PaginaMultas'));
const PaginaAforoBicicletas = lazy(() => import('./pages/AforoBicicletas/PaginaAforoBicicletas'));
const NotFoundPage = lazy(() => import('./pages/NotFound/NotFoundPage'));

// Configuracion de React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      gcTime: 10 * 60 * 1000, // 10 minutos
      retry: 2,
      refetchOnWindowFocus: false
    }
  }
});

/**
 * Fallback de carga para Suspense
 */
function PageLoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 flex items-center justify-center">
      <LoadingState message="Cargando..." />
    </div>
  );
}

/**
 * Componente para rutas protegidas
 * Redirige a login si no hay sesion activa
 */
function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <PageLoadingFallback />;
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return <ErrorBoundary>{children}</ErrorBoundary>;
}

/**
 * Componente para rutas publicas (login, register)
 * Redirige a dashboard si ya hay sesion
 */
function PublicRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <PageLoadingFallback />;
  }

  if (isAuthenticated) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return children;
}

/**
 * Componente de rutas de la aplicacion
 */
function AppRoutes() {
  return (
    <ErrorBoundary>
    <Suspense fallback={<PageLoadingFallback />}>
      <Routes>
        {/* Rutas publicas */}
        <Route
          path={ROUTES.LOGIN}
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path={ROUTES.REGISTER}
          element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          }
        />

        {/* Rutas protegidas */}
        <Route
          path={ROUTES.HOME}
          element={
            <ProtectedRoute>
              <Navigate to={ROUTES.DASHBOARD} replace />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.DASHBOARD}
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.LOCATIONS}
          element={
            <ProtectedRoute>
              <PaginaUbicaciones />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.AIR_QUALITY}
          element={
            <ProtectedRoute>
              <PaginaCalidadAire />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.NOISE_MONITORING}
          element={
            <ProtectedRoute>
              <PaginaRuido />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.ACCIDENTS}
          element={
            <ProtectedRoute>
              <PaginaAccidentes />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.SCOOTER_ASSIGNMENTS}
          element={
            <ProtectedRoute>
              <PaginaPatinetes />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.BIKE_AVAILABILITY}
          element={
            <ProtectedRoute>
              <PaginaBicicletas />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.CENSO}
          element={
            <ProtectedRoute>
              <PaginaCenso />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.MULTAS}
          element={
            <ProtectedRoute>
              <PaginaMultas />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.AFORO_BICICLETAS}
          element={
            <ProtectedRoute>
              <PaginaAforoBicicletas />
            </ProtectedRoute>
          }
        />

        {/* Pagina 404 */}
        <Route path={ROUTES.NOT_FOUND} element={<NotFoundPage />} />
      </Routes>
    </Suspense>
    </ErrorBoundary>
  );
}

/**
 * Componente principal de la aplicacion
 */
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
