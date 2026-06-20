/**
 * MapaUnificado - mapa multi-capa con conmutador lateral.
 *
 * Combina un MapaInteractivo (Leaflet + OSM) con un PanelCapasMapa que
 * permite activar/desactivar capas conmutables. Cada capa es un componente
 * propio (CapaUbicacionesMapa, CapaAccidentes, etc.) que solo se monta
 * cuando esta activa, asi su hook de React Query no se ejecuta hasta que el
 * usuario la enciende.
 *
 * Patron de "lazy data": componente no montado = no fetch.
 *
 * Estado de capas activas se persiste en useState interno por defecto, pero
 * si se pasan `capasActivas` y `onCambioCapas`, el estado pasa a controlado
 * para permitir sincronizacion con URL u otra fuente externa.
 */

import { memo, useState, useCallback } from 'react';
import { MapaInteractivo } from './MapaInteractivo';
import { PanelCapasMapa } from './PanelCapasMapa';
import { CAPAS_DISPONIBLES, CAPAS_POR_DEFECTO } from './configCapas';
import {
  CapaUbicacionesMapa,
  CapaAccidentesMapa,
  CapaMultasMapa,
  CapaPatinetesMapa,
  CapaAforoBicicletasMapa,
  CapaRuidoMapa
} from './capas';

// Componente por id de capa. Si el dominio anade nuevas capas, registrar aqui.
const COMPONENTES_CAPA = {
  ubicaciones: CapaUbicacionesMapa,
  accidentes: CapaAccidentesMapa,
  multas: CapaMultasMapa,
  patinetes: CapaPatinetesMapa,
  aforo: CapaAforoBicicletasMapa,
  ruido: CapaRuidoMapa
};

const TODAS_LAS_CAPAS = CAPAS_DISPONIBLES.map(c => c.id);

const MapaUnificado = memo(function MapaUnificado({
  altura = '600px',
  centro,
  zoom,
  capasActivas: capasActivasProp,
  onCambioCapas,
  paramsPorCapa
}) {
  // Estado controlado vs no controlado: si el padre pasa capasActivas + handler,
  // delegamos. Si no, gestionamos el estado internamente con un Set.
  const [capasInternas, setCapasInternas] = useState(
    () => new Set(CAPAS_POR_DEFECTO)
  );
  const capasActivas = capasActivasProp || capasInternas;

  const setCapas = useCallback((nuevasCapas) => {
    if (onCambioCapas) {
      onCambioCapas(nuevasCapas);
    } else {
      setCapasInternas(nuevasCapas);
    }
  }, [onCambioCapas]);

  const handleToggleCapa = useCallback((id) => {
    const next = new Set(capasActivas);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setCapas(next);
  }, [capasActivas, setCapas]);

  const handleActivarTodas = useCallback(() => {
    setCapas(new Set(TODAS_LAS_CAPAS));
  }, [setCapas]);

  const handleOcultarTodas = useCallback(() => {
    setCapas(new Set());
  }, [setCapas]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-4">
      <PanelCapasMapa
        capasActivas={capasActivas}
        onToggleCapa={handleToggleCapa}
        onActivarTodas={handleActivarTodas}
        onOcultarTodas={handleOcultarTodas}
      />

      <MapaInteractivo centro={centro} zoom={zoom} altura={altura}>
        {CAPAS_DISPONIBLES.map((capa) => {
          if (!capasActivas.has(capa.id)) return null;
          const Componente = COMPONENTES_CAPA[capa.id];
          if (!Componente) return null;
          const params = paramsPorCapa?.[capa.id];
          return <Componente key={capa.id} params={params} />;
        })}
      </MapaInteractivo>
    </div>
  );
});

export { MapaUnificado };
