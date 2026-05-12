/**
 * Buscador textual de contenedores por direccion.
 * Subcomponente de PaginaContenedores.
 *
 * Usa el endpoint /contenedores/buscar (indice $text). Aplica debounce
 * de 300ms para no disparar una peticion por cada tecla pulsada.
 */

import { memo, useState } from 'react';
import { Search } from 'lucide-react';
import {
  Card, CardHeader, CardTitle, CardDescription, CardContent,
  Input, Badge, EmptyState, ErrorState, Skeleton
} from '../../../components/common';
import { useBuscarContenedores } from '../../../api/hooks';
import { useDebouncedValue } from '../../../utils';
import { etiquetaTipoContenedor, varianteBadgePorTipo } from '../helpers';

const BusquedaContenedores = memo(function BusquedaContenedores({ tipoContenedorActivo }) {
  const [textoBusqueda, setTextoBusqueda] = useState('');
  const queryDebounced = useDebouncedValue(textoBusqueda, 300);

  const opciones = tipoContenedorActivo
    ? { tipoContenedor: tipoContenedorActivo, limit: 30 }
    : { limit: 30 };

  const {
    data,
    isLoading,
    error,
    refetch
  } = useBuscarContenedores(queryDebounced, opciones);

  const resultados = data?.data?.contenedores || [];
  const total = data?.data?.total || 0;
  const tieneQuery = queryDebounced.length >= 3;

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Search className="size-5" aria-hidden="true" />
          Buscar por direccion
        </CardTitle>
        <CardDescription>
          Busqueda textual usando indice $text (peso: nombre de calle &gt; direccion completa).
          Minimo 3 caracteres.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Input
            type="search"
            value={textoBusqueda}
            onChange={(e) => setTextoBusqueda(e.target.value)}
            placeholder="Ej. Gran Via, Alcala, ..."
            startIcon={Search}
            aria-label="Buscar contenedores por direccion"
          />
        </div>

        {!tieneQuery && (
          <p className="text-sm text-muted-foreground italic">
            Escribe al menos 3 caracteres para buscar.
          </p>
        )}

        {tieneQuery && isLoading && (
          <div className="flex flex-col gap-2" role="status" aria-live="polite">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        )}

        {tieneQuery && error && (
          <ErrorState message={error.message || 'Error al buscar'} onRetry={refetch} />
        )}

        {tieneQuery && !isLoading && !error && resultados.length === 0 && (
          <EmptyState
            title="Sin resultados"
            description={`No se encontraron contenedores que coincidan con "${queryDebounced}".`}
            icon={Search}
          />
        )}

        {tieneQuery && !isLoading && !error && resultados.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-sm text-muted-foreground mb-1">
              {total} resultados (mostrando {resultados.length}).
            </p>
            <ul className="flex flex-col gap-2 max-h-96 overflow-y-auto pr-1">
              {resultados.map(c => (
                <li
                  key={c._id}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border/60 bg-card/40 hover:bg-card/70 transition-colors"
                >
                  <Badge variant={varianteBadgePorTipo(c.tipoContenedor)}>
                    {etiquetaTipoContenedor(c.tipoContenedor)}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground truncate">
                      {c.direccion?.completa || c.direccion?.nombre}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {c.distrito}{c.barrio && c.barrio !== 'NO_ESPECIFICADO' ? ` · ${c.barrio}` : ''} · Lote {c.lote}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground whitespace-nowrap">
                    {c.cantidad} ud.
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

export { BusquedaContenedores };
