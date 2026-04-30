/**
 * Componente BannerCabecera
 *
 * Cabecera del dashboard con gradiente, patron decorativo y la metrica
 * destacada del año del dataset.
 */

import { Sparkles } from 'lucide-react';
import { DATE_CONFIG } from '../../../constants';

const FONDO_PATRON = `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2306b6d4' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`;

export function BannerCabecera() {
  return (
    <div className="relative overflow-hidden rounded-3xl mb-8">
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/30 via-card/50 to-emerald-600/20" />
      <div
        className="absolute inset-0 opacity-30"
        style={{ backgroundImage: FONDO_PATRON }}
        aria-hidden="true"
      />

      <div className="relative px-8 py-12 md:px-12 md:py-16">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-cyan-400" aria-hidden="true" />
              <span className="text-sm font-medium text-cyan-400">Smart City Dashboard</span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 leading-tight">
              Bienvenido a<br />
              <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                Anthem City
              </span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Sistema de monitoreo integral para la ciudad inteligente del futuro.
              Visualiza y analiza datos en tiempo real.
            </p>
          </div>

          <div className="flex-shrink-0">
            <div className="bg-background/60 backdrop-blur-xl rounded-2xl border border-border/60 p-6">
              <p className="text-sm text-muted-foreground mb-1">Dataset del año</p>
              <p className="text-5xl font-bold bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                {DATE_CONFIG.DATASET_YEAR}
              </p>
              <p className="text-sm text-muted-foreground mt-2">Datos completos de 12 meses</p>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
    </div>
  );
}
