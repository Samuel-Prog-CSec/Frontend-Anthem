/**
 * App - Componente principal
 * 
 * Configuracion de rutas y providers de la aplicacion.
 * Usa React Router v7 para el enrutamiento.
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context';
import { 
  DashboardPage, 
  LoginPage, 
  RegisterPage, 
  LocationsPage, 
  AirQualityPage, 
  NoiseMonitoringPage,
  NotFoundPage 
} from './pages';
import { ROUTES } from './constants';
import { LoadingState } from './components/common';

// Configuracion de React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      cacheTime: 10 * 60 * 1000, // 10 minutos
      retry: 2,
      refetchOnWindowFocus: false
    }
  }
});

/**
 * Componente para rutas protegidas
 * Redirige a login si no hay sesion activa
 */
function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 flex items-center justify-center">
        <LoadingState message="Cargando sesion..." />
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }
  
  return children;
}

/**
 * Componente para rutas publicas (login, register)
 * Redirige a dashboard si ya hay sesion
 */
function PublicRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 flex items-center justify-center">
        <LoadingState message="Cargando..." />
      </div>
    );
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
            <LocationsPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path={ROUTES.AIR_QUALITY} 
        element={
          <ProtectedRoute>
            <AirQualityPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path={ROUTES.NOISE_MONITORING} 
        element={
          <ProtectedRoute>
            <NoiseMonitoringPage />
          </ProtectedRoute>
        } 
      />
      
      {/* Pagina 404 */}
      <Route path={ROUTES.NOT_FOUND} element={<NotFoundPage />} />
    </Routes>
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
