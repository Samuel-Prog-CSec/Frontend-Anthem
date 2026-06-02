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
          <div className="flex items-center gap-3 p-3 rounded-lg border border-[var(--border-emphasis)]">
            <Sun className="size-5 text-muted-foreground" />
            <div>
              <p className="font-medium text-foreground">Diurno (07:00 - 19:00)</p>
              <p className="text-sm text-muted-foreground">Limite: {NOISE_LIMITS.DIURNO} dB</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg border border-[var(--border-emphasis)]">
            <Sunset className="size-5 text-muted-foreground" />
            <div>
              <p className="font-medium text-foreground">Vespertino (19:00 - 23:00)</p>
              <p className="text-sm text-muted-foreground">Limite: {NOISE_LIMITS.VESPERTINO} dB</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg border border-[var(--border-emphasis)]">
            <Moon className="size-5 text-muted-foreground" />
            <div>
              <p className="font-medium text-foreground">Nocturno (23:00 - 07:00)</p>
              <p className="text-sm text-muted-foreground">Limite: {NOISE_LIMITS.NOCTURNO} dB</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

export { LeyendaLimitesNormativos };
