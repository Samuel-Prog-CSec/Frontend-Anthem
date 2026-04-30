/**
 * Componente EstadoSistema
 *
 * Tarjeta de estado del sistema con indicadores de API, BD, cache y datos.
 */

import { Activity, Database, Cpu, TrendingUp, Zap } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../../components/common';
import { DATE_CONFIG } from '../../../constants';

const SERVICIOS = [
  { id: 'api', etiqueta: 'API Backend', estado: 'Operativo', icono: Zap, color: 'emerald' },
  { id: 'bd', etiqueta: 'Base de Datos', estado: 'Conectada', icono: Database, color: 'emerald' },
  { id: 'cache', etiqueta: 'Sistema Cache', estado: 'Activo', icono: Cpu, color: 'cyan' }
];

function TarjetaServicio({ servicio }) {
  const Icono = servicio.icono;
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-card/50 border border-border/60">
      <div className={`w-10 h-10 rounded-lg bg-${servicio.color}-500/10 flex items-center justify-center`}>
        <Icono className={`w-5 h-5 text-${servicio.color}-400`} aria-hidden="true" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-foreground">{servicio.etiqueta}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
          <span className="text-xs text-emerald-400">{servicio.estado}</span>
        </div>
      </div>
    </div>
  );
}

export function EstadoSistema() {
  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Activity className="w-5 h-5 text-primary" aria-hidden="true" />
          </div>
          <div>
            <CardTitle>Estado del Sistema</CardTitle>
            <CardDescription>Monitoreo de servicios en tiempo real</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SERVICIOS.map(servicio => (
            <TarjetaServicio key={servicio.id} servicio={servicio} />
          ))}

          <div className="flex items-center gap-4 p-4 rounded-xl bg-card/50 border border-border/60">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary" aria-hidden="true" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Datos {DATE_CONFIG.DATASET_YEAR}</p>
              <p className="text-xs text-muted-foreground mt-0.5">12 meses completos</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
