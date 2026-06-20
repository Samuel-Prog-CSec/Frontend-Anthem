/**
 * Pagina 404 - No encontrada
 *
 * Identidad "Atlas Civico": reticula de coordenadas de fondo + metafora
 * cartografica ("fuera del atlas"), en vez de un 404 generico centrado.
 */

import { Link } from 'react-router-dom';
import { Home, MapPinOff } from 'lucide-react';
import { Button } from '../../components/common';
import { ROUTES } from '../../constants';

function NotFoundPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-4">
      <div className="coord-grid pointer-events-none absolute inset-0 opacity-50" aria-hidden="true" />
      <div className="relative text-center">
        <div className="mb-6 inline-flex size-20 items-center justify-center rounded-2xl bg-destructive/15">
          <MapPinOff className="size-10 text-destructive" aria-hidden="true" />
        </div>

        <p className="stat-hero mb-4 text-6xl text-foreground">404</p>
        <h1 className="mb-2 font-display text-2xl font-semibold text-foreground">
          Esta dirección no está en el atlas
        </h1>
        <p className="mx-auto mb-8 max-w-md text-muted-foreground">
          La página que buscas no existe o se ha movido. Vuelve al panel para
          seguir explorando los datos de la ciudad.
        </p>

        <Link to={ROUTES.DASHBOARD}>
          <Button>
            <Home className="mr-2 size-4" aria-hidden="true" />
            Volver al panel
          </Button>
        </Link>
      </div>
    </main>
  );
}

export default NotFoundPage;
