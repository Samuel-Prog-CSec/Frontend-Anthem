/**
 * Sub-componente DiasMayorMenorUso
 *
 * Dos tablas paralelas con el top de dias de mayor y menor uso del
 * servicio de bicicletas.
 *
 * Cuando varios de los dias de menor uso tienen `totalUsos = 0` y son
 * cronologicamente consecutivos, se muestra un banner que aclara que
 * fueron periodos de servicio interrumpido (suceden 44 dias asi en el
 * dataset de Anthem 2051, sobre todo dos rachas largas: 16/03-17/04
 * y diciembre). Sin el banner el "top menor uso" parecia que algo
 * estaba roto en los datos.
 */

import { useMemo } from 'react';
import { ArrowUp, ArrowDown, AlertTriangle } from 'lucide-react';
import {
  Card, CardHeader, CardTitle, CardContent,
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell
} from '../../components/common';
import { formatDate, formatNumber } from '../../utils';

// Si hay >=3 dias consecutivos con totalUsos=0 los marcamos como periodo
// interrumpido. Por debajo de eso puede ser una caida puntual (festivo,
// huelga, mantenimiento de una jornada) y no merece banner.
const DIAS_MINIMO_PARA_BANNER = 3;

/**
 * Detecta tramos consecutivos de dias con totalUsos === 0 en el array
 * de menor uso. Devuelve los tramos como rangos [fechaInicio, fechaFin]
 * con su `dias` (longitud del tramo). El array de entrada NO esta
 * ordenado: viene del backend con orden de menor a mayor `totalUsos`,
 * asi que primero filtramos los ceros y luego los ordenamos por fecha
 * para detectar tramos.
 *
 * @param {Array<{dia: string, totalUsos: number}>} dias
 * @returns {Array<{inicio: Date, fin: Date, dias: number}>}
 */
function detectarTramosInterrumpidos(dias) {
  if (!Array.isArray(dias) || dias.length === 0) return [];
  const ceros = dias
    .filter(d => (d.totalUsos || 0) === 0 && d.dia)
    .map(d => new Date(d.dia))
    .filter(d => !isNaN(d.getTime()))
    .sort((a, b) => a - b);
  if (ceros.length < DIAS_MINIMO_PARA_BANNER) return [];

  const tramos = [];
  let inicio = ceros[0];
  let prev = ceros[0];
  for (let i = 1; i < ceros.length; i += 1) {
    const diffDias = Math.round((ceros[i] - prev) / (24 * 60 * 60 * 1000));
    if (diffDias === 1) {
      prev = ceros[i];
    } else {
      tramos.push({ inicio, fin: prev, dias: Math.round((prev - inicio) / (24 * 60 * 60 * 1000)) + 1 });
      inicio = ceros[i];
      prev = ceros[i];
    }
  }
  tramos.push({ inicio, fin: prev, dias: Math.round((prev - inicio) / (24 * 60 * 60 * 1000)) + 1 });
  return tramos.filter(t => t.dias >= DIAS_MINIMO_PARA_BANNER);
}

function DiasMayorMenorUso({ datos }) {
  const tramosInterrumpidos = useMemo(
    () => detectarTramosInterrumpidos(datos?.diasMenorUso),
    [datos?.diasMenorUso]
  );

  if (!datos) return null;

  const hayMayor = datos.diasMayorUso?.length > 0;
  const hayMenor = datos.diasMenorUso?.length > 0;
  if (!hayMayor && !hayMenor) return null;

  return (
    <>
      {tramosInterrumpidos.length > 0 && (
        <Card className="mb-6 border-warning/30 bg-warning/5">
          <CardContent className="py-3">
            <div className="flex items-start gap-3">
              <AlertTriangle className="size-4 text-warning mt-0.5 flex-shrink-0" aria-hidden="true" />
              <div className="text-sm text-foreground/90">
                <p className="font-medium mb-1">Periodos de servicio interrumpido detectados</p>
                <p className="text-muted-foreground">
                  Anthem 2051 tiene {tramosInterrumpidos.reduce((s, t) => s + t.dias, 0)} dias
                  consecutivos sin uso del servicio que aparecen como "menor uso" abajo. Tramos:
                </p>
                <ul className="mt-1.5 space-y-0.5">
                  {tramosInterrumpidos.map((t, i) => (
                    <li key={`tramo-${i}`} className="font-mono text-xs text-muted-foreground">
                      {formatDate(t.inicio)} - {formatDate(t.fin)} ({t.dias} dias)
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {hayMayor && (
          <TopDiasCard
            titulo="Top dias de mayor uso"
            icono={ArrowUp}
            iconoColor="text-muted-foreground"
            dias={datos.diasMayorUso}
            prefijoKey="mayor"
          />
        )}
        {hayMenor && (
          <TopDiasCard
            titulo="Top dias de menor uso"
            icono={ArrowDown}
            iconoColor="text-muted-foreground"
            dias={datos.diasMenorUso}
            prefijoKey="menor"
          />
        )}
      </div>
    </>
  );
}

function TopDiasCard({ titulo, icono, iconoColor, dias, prefijoKey }) {
  const Icono = icono;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Icono className={`size-5 ${iconoColor}`} aria-hidden="true" />
          {titulo}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/*
          El endpoint /bicicletas/mayor-uso devuelve solo: dia, totalUsos,
          mediaBicicletasDisponibles, tasaOcupacion. usosAnual/usosOcasional
          no estan disponibles a este nivel granular (solo en el agregado
          /tendencias/mensual o /suscripciones), asi que sustituimos las
          columnas previas por las metricas que SI provee el endpoint para
          evitar mostrar guiones vacios.
        */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Dia</TableHead>
              <TableHead className="text-right">Total usos</TableHead>
              <TableHead className="text-right">Bicis medias</TableHead>
              <TableHead className="text-right">Ocupacion (%)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dias.map((item, index) => (
              <TableRow key={`${prefijoKey}-${index}`}>
                <TableCell>{formatDate(item.dia)}</TableCell>
                <TableCell className="text-right font-mono font-medium">{formatNumber(item.totalUsos)}</TableCell>
                <TableCell className="text-right font-mono">
                  {formatNumber(item.mediaBicicletasDisponibles, 1)}
                </TableCell>
                <TableCell className="text-right font-mono">
                  {item.tasaOcupacion != null ? `${formatNumber(item.tasaOcupacion, 2)}%` : '-'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export default DiasMayorMenorUso;
