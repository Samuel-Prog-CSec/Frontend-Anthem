/**
 * Error Boundary
 *
 * Captura errores de renderizado en componentes hijos y muestra
 * una interfaz de fallback coherente con el tema de la aplicacion.
 * Requiere componente de clase (React no soporta error boundaries con hooks).
 */

import { Component } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './Card';
import { Button } from './Button';
import { AlertTriangle } from 'lucide-react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary captura error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex items-center justify-center p-6">
          <Card className="max-w-md w-full">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-red-900/30 flex items-center justify-center mb-3">
                <AlertTriangle className="h-6 w-6 text-red-400" />
              </div>
              <CardTitle className="text-lg">Error inesperado</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-slate-400 mb-4">
                {this.state.error?.message || 'Ha ocurrido un error al renderizar este componente.'}
              </p>
              <div className="flex gap-3 justify-center">
                <Button onClick={this.handleReset}>
                  Reintentar
                </Button>
                <Button variant="outline" onClick={() => window.location.reload()}>
                  Recargar pagina
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export { ErrorBoundary };
