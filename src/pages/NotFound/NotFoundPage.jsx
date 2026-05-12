/**
 * Pagina 404 - No Encontrado
 */

import { Link } from 'react-router-dom';
import { Home, AlertCircle } from 'lucide-react';
import { Button } from '../../components/common';
import { ROUTES } from '../../constants';

function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="inline-flex items-center justify-center size-20 rounded-2xl bg-red-900/30 mb-6">
          <AlertCircle className="size-10 text-red-400" />
        </div>
        
        <h1 className="text-6xl font-bold text-white mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-white mb-2">Pagina no encontrada</h2>
        <p className="text-slate-400 mb-8 max-w-md">
          Lo sentimos, la pagina que buscas no existe o ha sido movida.
        </p>
        
        <Link to={ROUTES.DASHBOARD}>
          <Button>
            <Home className="size-4 mr-2" />
            Volver al Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default NotFoundPage;
