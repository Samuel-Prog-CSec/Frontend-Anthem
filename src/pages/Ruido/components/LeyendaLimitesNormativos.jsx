/**
 * Leyenda con los limites normativos de contaminacion acustica.
 * Subcomponente de PaginaRuido.
 */

import { memo } from 'react';
import { Sun, Sunset, Moon } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/common';
import { NOISE_LIMITS } from '../../../constants';

const LeyendaLimitesNormativos = memo(function LeyendaLimitesNormativos() {
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-lg">Limites Normativos (dB)</CardTitle>
        <CardDescription>
          Basado en normativa europea de contaminacion acustica
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-900/20 border border-amber-700/30">
            <Sun className="size-5 text-amber-400" />
            <div>
              <p className="font-medium text-white">Diurno (07:00 - 19:00)</p>
              <p className="text-sm text-slate-400">Limite: {NOISE_LIMITS.DIURNO} dB</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-orange-900/20 border border-orange-700/30">
            <Sunset className="size-5 text-orange-400" />
            <div>
              <p className="font-medium text-white">Vespertino (19:00 - 23:00)</p>
              <p className="text-sm text-slate-400">Limite: {NOISE_LIMITS.VESPERTINO} dB</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-purple-900/20 border border-purple-700/30">
            <Moon className="size-5 text-purple-400" />
            <div>
              <p className="font-medium text-white">Nocturno (23:00 - 07:00)</p>
              <p className="text-sm text-slate-400">Limite: {NOISE_LIMITS.NOCTURNO} dB</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

export { LeyendaLimitesNormativos };
