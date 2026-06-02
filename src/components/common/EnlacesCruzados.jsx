/**
 * EnlacesCruzados - Chips contextuales BI cross-project.
 *
 * Muestra accesos rapidos a otros modulos del dashboard filtrados por el
 * mismo distrito (y opcionalmente barrio) que se este viendo. Usa el
 * contexto FiltroGeoContext para preservar el filtro al navegar.
 *
 * Uso tipico: en cabeceras de tablas/cards, o en filas de tablas de
 * accidentes/multas/patinetes para enlazar a los demas modulos en la
 * misma zona geografica.
 *
 * @example
 *   <EnlacesCruzados
 *     distrito="CENTRO"
 *     codigoDistrito={1}
 *     modulosExcluidos={['accidentes']}
 *   />
 */

import { memo, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle, FileWarning, Recycle, Wind, Volume2, Zap, Bike, Users, Activity, TrafficCone, ArrowRight
} from 'lucide-react';
import { ROUTES } from '../../constants';
import { useFiltroGeo } from '../../context';
import { cn } from '../../utils';

/**
 * Definicion de modulos disponibles. Cada uno tiene clave (modulosExcluidos),
 * etiqueta corta, icono y ruta.
 */
const MODULOS = [
  { clave: 'distrito', label: 'Vista distrito', icon: Users, ruta: null /* se calcula con codigo */, esDrillDown: true },
  { clave: 'accidentes', label: 'Accidentes', icon: AlertTriangle, ruta: ROUTES.ACCIDENTES },
  { clave: 'multas', label: 'Multas', icon: FileWarning, ruta: ROUTES.MULTAS },
  { clave: 'patinetes', label: 'Patinetes', icon: Zap, ruta: ROUTES.PATINETES },
  { clave: 'contenedores', label: 'Contenedores', icon: Recycle, ruta: ROUTES.CONTENEDORES },
  { clave: 'calidad-aire', label: 'Calidad aire', icon: Wind, ruta: ROUTES.CALIDAD_AIRE },
  { clave: 'ruido', label: 'Ruido', icon: Volume2, ruta: ROUTES.RUIDO },
  { clave: 'bicicletas', label: 'Bicicletas', icon: Bike, ruta: ROUTES.BICICLETAS },
  { clave: 'aforo-bicicletas', label: 'Aforo bicis', icon: Activity, ruta: ROUTES.AFORO_BICICLETAS },
  { clave: 'trafico', label: 'Trafico', icon: TrafficCone, ruta: ROUTES.TRAFICO },
  { clave: 'censo', label: 'Censo', icon: Users, ruta: ROUTES.CENSO }
];

/**
 * Componente reutilizable.
 *
 * @param {Object} props
 * @param {string} props.distrito - Distrito (string) a propagar como filtro.
 * @param {string} [props.barrio] - Barrio opcional.
 * @param {number} [props.codigoDistrito] - Codigo numerico para enlace a /distritos/:codigo.
 * @param {Array<string>} [props.modulosExcluidos] - Claves de modulos a no mostrar (ej. el modulo actual).
 * @param {string} [props.titulo] - Texto de cabecera (default "Ver tambien en:").
 * @param {string} [props.className]
 * @param {boolean} [props.compacto] - Si true, sin labels (solo iconos + tooltip).
 */
const EnlacesCruzados = memo(function EnlacesCruzados({
  distrito,
  barrio,
  codigoDistrito,
  modulosExcluidos = [],
  titulo = 'Ver tambien en:',
  className,
  compacto = false
}) {
  const { aplicarDistrito } = useFiltroGeo();

  const enlaces = useMemo(() => {
    if (!distrito) {return [];}
    const excluidos = new Set(modulosExcluidos);
    return MODULOS
      .filter(m => !excluidos.has(m.clave))
      // Solo mostrar drill-down distrito si tenemos codigo
      .filter(m => !m.esDrillDown || (m.esDrillDown && Number.isFinite(codigoDistrito)))
      .map(m => {
        let to;
        if (m.esDrillDown) {
          to = ROUTES.DISTRITO_PATH(codigoDistrito);
        } else {
          const params = new URLSearchParams();
          params.set('distrito', distrito);
          if (barrio) {params.set('barrio', barrio);}
          to = `${m.ruta}?${params.toString()}`;
        }
        return { ...m, to };
      });
  }, [distrito, barrio, codigoDistrito, modulosExcluidos]);

  if (!distrito || enlaces.length === 0) {return null;}

  const handleClick = () => {
    aplicarDistrito(distrito, codigoDistrito);
  };

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      {titulo && !compacto && (
        <span className="text-xs text-muted-foreground font-medium">{titulo}</span>
      )}
      {enlaces.map(enlace => {
        const Icon = enlace.icon;
        return (
          <Link
            key={enlace.clave}
            to={enlace.to}
            onClick={handleClick}
            title={`${enlace.label} en ${distrito}${barrio ? ` / ${barrio}` : ''}`}
            className={cn(
              'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm',
              'border border-border bg-card hover:bg-[var(--surface-hover)] hover:border-[var(--border-strong)]',
              'text-xs font-medium text-muted-foreground hover:text-primary',
              'transition-colors'
            )}
          >
            <Icon className="size-3.5" aria-hidden="true" />
            {!compacto && <span>{enlace.label}</span>}
            {enlace.esDrillDown && !compacto && <ArrowRight className="size-3" aria-hidden="true" />}
          </Link>
        );
      })}
    </div>
  );
});

export { EnlacesCruzados };
