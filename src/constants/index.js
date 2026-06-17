/**
 * Constantes del Frontend - Smart City Dashboard
 * 
 * Constantes centralizadas para toda la aplicacion frontend.
 * Sincronizadas con las constantes del backend cuando corresponde.
 */

// ========================================
// CONFIGURACION DE API
// ========================================

export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1',
  // 30 segundos -- subido de 10 s porque varias agregaciones del modulo de
  // trafico (132 M docs) y censo (2.85 M docs) pasan de 10 s aun con
  // cache calentada en dev. El interceptor ya reintenta 3 veces, asi que
  // 10 s × 3 = 30 s de espera total con error final; subir a 30 s da una
  // unica espera larga pero exitosa.
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000 // 1 segundo entre reintentos
};

// ========================================
// AUTENTICACION
// ========================================

export const AUTH_CONFIG = {
  // El access token vive SOLO en memoria (Context) y el refresh token en una
  // cookie httpOnly gestionada por el navegador: NO se usan claves de storage
  // (se eliminaron ACCESS_TOKEN_KEY/REFRESH_TOKEN_KEY, residuos de una estrategia
  // localStorage abandonada). El margen real de refresco anticipado vive en
  // api/axios.js (REFRESH_SAFETY_MARGIN_SECONDS = 30s).
  TOKEN_REFRESH_THRESHOLD: 5 * 60 * 1000
};

// ========================================
// PAGINACION
// ========================================

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 50,
  LOCATIONS_DEFAULT_LIMIT: 100,
  LOCATIONS_MAX_LIMIT: 500,
  CONTAINERS_DEFAULT_LIMIT: 100,
  CONTAINERS_MAX_LIMIT: 200,
  BIKES_DEFAULT_LIMIT: 100,
  MAX_LIMIT: 100,
  MAX_PAGE: 1000
};

// ========================================
// TIPOS DE UBICACIONES
// ========================================

export const LOCATION_TYPES = {
  ESTACION_ACUSTICA: 'estacion_acustica',
  PUNTO_TRAFICO: 'punto_trafico',
  RUTA_CERCANIAS: 'ruta_cercanias',
  RUTA_AUTOBUS: 'ruta_autobus',
  RUTA_INTERURBANO: 'ruta_interurbano',
  RUTA_METRO: 'ruta_metro',
  RUTA_METRO_LIGERO: 'ruta_metro_ligero',
  ZONA_TAXI: 'zona_taxi'
};

export const LOCATION_TYPE_LABELS = {
  estacion_acustica: 'Estacion Acustica',
  punto_trafico: 'Punto de Trafico',
  ruta_cercanias: 'Ruta Cercanias',
  ruta_autobus: 'Ruta Autobus',
  ruta_interurbano: 'Ruta Interurbano',
  ruta_metro: 'Ruta Metro',
  ruta_metro_ligero: 'Metro Ligero',
  zona_taxi: 'Zona Taxi'
};

// ========================================
// CALIDAD DEL AIRE
// ========================================

export const AIR_QUALITY_MAGNITUDES = {
  1: 'Dióxido de azufre (SO2)',
  6: 'Monóxido de carbono (CO)',
  7: 'Monóxido de nitrógeno (NO)',
  8: 'Dióxido de nitrógeno (NO2)',
  9: 'Partículas < 2.5 μm (PM2.5)',
  10: 'Partículas < 10 μm (PM10)',
  12: 'Óxidos de nitrógeno (NOx)',
  14: 'Ozono (O3)',
  20: 'Tolueno',
  30: 'Benceno',
  35: 'Etilbenceno',
  42: 'Hidrocarburos totales (HCT)',
  43: 'Hidrocarburos no metánicos (HCNM)',
  44: 'Metano (CH4)'
};

/**
 * Array de códigos de magnitudes permitidas
 * Generado dinámicamente desde AIR_QUALITY_MAGNITUDES para asegurar consistencia
 */
export const MAGNITUDES_PERMITIDAS = Object.keys(AIR_QUALITY_MAGNITUDES).map(Number);

// La leyenda muestra cualitativamente los seis niveles que usa el helper
// `obtenerNivelCalidadAire(value, magnitud)`. Los rangos numericos exactos
// dependen del contaminante (NO2, PM10, PM2.5, O3...): ver tabla
// `UMBRALES_POR_MAGNITUD` en `pages/CalidadAire/helpers.js`. El label
// `range` aqui es solo el orden cualitativo dentro de la escala.
export const AIR_QUALITY_LEVELS = {
  BUENA:                  { label: 'Buena',                   color: 'var(--color-air-good)',                range: '1/6' },
  MODERADA:               { label: 'Moderada',                color: 'var(--color-air-moderate)',            range: '2/6' },
  DANINA_GRUPOS_SENSIBLES:{ label: 'Dañina para grupos sensibles', color: 'var(--color-air-unhealthy-sensitive)', range: '3/6' },
  DANINA:                 { label: 'Dañina',                  color: 'var(--color-air-unhealthy)',           range: '4/6' },
  MUY_DANINA:             { label: 'Muy dañina',              color: 'var(--color-air-very-unhealthy)',      range: '5/6' },
  PELIGROSA:              { label: 'Peligrosa',               color: 'var(--color-air-hazardous)',           range: '6/6' }
};

// ========================================
// CAMPOS DE ORDENAMIENTO (Sincronizado con Backend)
// ========================================

export const SORT_FIELDS = {
  ACCIDENT: ['fecha', 'gravedad', 'distrito', 'tipoAccidente', 'numeroExpediente'],
  AIR_QUALITY: ['fecha', 'estacion', 'magnitud', 'provincia', 'municipio'],
  BIKE_AVAILABILITY: ['dia', 'fecha', 'totalUsos', 'mediaBicicletasDisponibles', 'horasTotalesUsos', 'horasTotalesDisponibilidad'],
  BIKE_CAPACITY: ['fecha', 'estacion', 'aforoEntradas', 'aforoSalidas'],
  CENSO: ['fechaCenso', 'totalPoblacion', 'porcentajeExtranjeros', 'edad', 'distrito', 'barrio'],
  CONTAINER: ['tipoContenedor', 'distrito', 'barrio', 'direccion', 'lote'],
  FINE: ['fecha', 'importeFinal', 'puntosDetraídos', 'lugar', 'calificacion'],
  LOCATION: ['nombre', 'distrito', 'barrio', 'tipo'],
  NOISE_MONITORING: ['fecha', 'nmt', 'nombre', 'laeq24', 'nivelDiurno', 'nivelVespertino', 'nivelNocturno'],
  PARKING_OCCUPANCY: ['fecha', 'distrito', 'plazasTotales', 'plazasOcupadas'],
  SCOOTER_ASSIGNMENT: ['totalPatinetes', 'distrito', 'barrio', 'fecha', 'densidad', 'proveedor'],
  TRAFFIC: ['fecha', 'puntoMedidaId', 'intensidad', 'ocupacion', 'carga']
};

// ========================================
// TIPOS DE DATOS Y ENUMS (Sincronizado con Backend)
// ========================================

/**
 * Tipos de contenedores de residuos
 */
export const CONTAINER_TYPES = {
  ORGANICA: 'ORGANICA',
  RESTO: 'RESTO',
  ENVASES: 'ENVASES',
  VIDRIO: 'VIDRIO',
  PAPEL_CARTON: 'PAPEL-CARTON'
};

/**
 * Etiquetas legibles para tipos de contenedor (UI)
 * Indexadas por el valor del enum (no la clave) para coincidir con la API.
 */
export const CONTAINER_TYPE_LABELS = {
  ORGANICA: 'Orgánica',
  RESTO: 'Resto',
  ENVASES: 'Envases',
  VIDRIO: 'Vidrio',
  'PAPEL-CARTON': 'Papel y cartón'
};

/**
 * Colores por tipo de contenedor (estandar municipal espanol)
 * Usado en charts, markers de mapa y badges.
 */
export const CONTAINER_TYPE_COLORS = {
  ORGANICA: '#92400e',       // Marron
  RESTO: '#475569',          // Gris pizarra
  ENVASES: '#f59e0b',        // Amarillo
  VIDRIO: '#10b981',         // Verde
  'PAPEL-CARTON': '#2563eb'  // Azul
};

/**
 * Lotes de contenedores válidos
 */
export const CONTAINER_LOTES = [1, 2, 3];

export const ACCIDENT_TYPES = {
  ALCANCE: 'ALCANCE',
  ATROPELLO_A_ANIMAL: 'ATROPELLO_A_ANIMAL',
  ATROPELLO_A_PERSONA: 'ATROPELLO_A_PERSONA',
  CAIDA: 'CAÍDA',
  CHOQUE_CONTRA_OBSTACULO_FIJO: 'CHOQUE_CONTRA_OBSTÁCULO_FIJO',
  COLISION_FRONTAL: 'COLISIÓN_FRONTAL',
  COLISION_FRONTO_LATERAL: 'COLISIÓN_FRONTO-LATERAL',
  COLISION_LATERAL: 'COLISIÓN_LATERAL',
  COLISION_MULTIPLE: 'COLISIÓN_MÚLTIPLE',
  DESPEÑAMIENTO: 'DESPEÑAMIENTO',
  OTRO: 'OTRO',
  SOLO_SALIDA_DE_LA_VIA: 'SOLO_SALIDA_DE_LA_VÍA',
  VUELCO: 'VUELCO'
};

export const PERSON_TYPES = {
  CONDUCTOR: 'CONDUCTOR',
  PEATÓN: 'PEATÓN',
  TESTIGO: 'TESTIGO',
  VIAJERO: 'VIAJERO',
  PASAJERO: 'PASAJERO'
};

export const VEHICLE_TYPES = {
  AMBULANCIA_SAMUR: 'AMBULANCIA_SAMUR',
  AUTOBUS_EMT: 'AUTOBUS_EMT',
  AUTOBUS: 'AUTOBÚS',
  AUTOBUS_ARTICULADO: 'AUTOBÚS_ARTICULADO',
  AUTOBUS_ARTICULADO_EMT: 'AUTOBÚS_ARTICULADO_EMT',
  AUTOCARAVANA: 'AUTOCARAVANA',
  BICICLETA: 'BICICLETA',
  BICICLETA_EPAC: 'BICICLETA_EPAC_(PEDALEO_ASISTIDO)',
  CAMION_DE_BOMBEROS: 'CAMIÓN_DE_BOMBEROS',
  CAMION_RIGIDO: 'CAMIÓN_RÍGIDO',
  CICLO: 'CICLO',
  CICLOMOTOR: 'CICLOMOTOR',
  CICLOMOTOR_DOS_RUEDAS: 'CICLOMOTOR_DE_DOS_RUEDAS_L1E-B',
  CICLOMOTOR_TRES_RUEDAS: 'CICLOMOTOR_DE_TRES_RUEDAS',
  CUADRICICLO_LIGERO: 'CUADRICICLO_LIGERO',
  CUADRICICLO_NO_LIGERO: 'CUADRICICLO_NO_LIGERO',
  FURGONETA: 'FURGONETA',
  MAQUINARIA_AGRICOLA: 'MAQUINARIA_AGRÍCOLA',
  MAQUINARIA_DE_OBRAS: 'MAQUINARIA_DE_OBRAS',
  MOTO_TRES_RUEDAS_MAS_125CC: 'MOTO_DE_TRES_RUEDAS_>_125CC',
  MOTO_TRES_RUEDAS_HASTA_125CC: 'MOTO_DE_TRES_RUEDAS_HASTA_125CC',
  MOTOCICLETA_MAS_125CC: 'MOTOCICLETA_>_125CC',
  MOTOCICLETA_HASTA_125CC: 'MOTOCICLETA_HASTA_125CC',
  OTROS_VEHICULOS_CON_MOTOR: 'OTROS_VEHÍCULOS_CON_MOTOR',
  OTROS_VEHICULOS_SIN_MOTOR: 'OTROS_VEHÍCULOS_SIN_MOTOR',
  PATINETE: 'PATINETE',
  REMOLQUE: 'REMOLQUE',
  SEMIREMOLQUE: 'SEMIREMOLQUE',
  SIN_ESPECIFICAR: 'SIN_ESPECIFICAR',
  TAXI: 'TAXI',
  TODO_TERRENO: 'TODO_TERRENO',
  TRACTOCAMION: 'TRACTOCAMIÓN',
  TREN_METRO: 'TREN/METRO',
  TURISMO: 'TURISMO',
  VEHICULO_ARTICULADO: 'VEHÍCULO_ARTICULADO',
  VMU_ELECTRICO: 'VMU_ELÉCTRICO'
};

// ========================================
// CONTAMINACION ACUSTICA
// ========================================

export const NOISE_LIMITS = {
  DIURNO: 65, // dB - Limite diurno (07:00-19:00)
  VESPERTINO: 65, // dB - Limite vespertino (19:00-23:00)
  NOCTURNO: 55 // dB - Limite nocturno (23:00-07:00)
};

export const NOISE_PERIODS = {
  D: { label: 'Diurno', time: '07:00 - 19:00', limit: 65 },
  E: { label: 'Vespertino', time: '19:00 - 23:00', limit: 65 },
  N: { label: 'Nocturno', time: '23:00 - 07:00', limit: 55 },
  T: { label: '24 horas', time: 'Todo el dia', limit: null }
};

// ========================================
// TRAFICO
// ========================================

/**
 * Tipos de elemento del punto de medida de trafico.
 * URB = trafico urbano (control semaforico)
 * M30 = trafico interurbano (vias rapidas)
 */
export const TRAFFIC_ELEMENT_TYPES = {
  URB: 'URB',
  M30: 'M30'
};

export const TRAFFIC_ELEMENT_LABELS = {
  URB: 'Urbano',
  M30: 'M-30 / Interurbano'
};

/**
 * Niveles de congestion derivados en backend.
 * Sincronizado con CONGESTION_LEVELS del backend.
 */
export const CONGESTION_LEVELS = {
  FLUIDO: 'FLUIDO',
  DENSO: 'DENSO',
  CONGESTIONADO: 'CONGESTIONADO',
  COLAPSADO: 'COLAPSADO'
};

export const CONGESTION_LEVEL_LABELS = {
  FLUIDO: 'Fluido',
  DENSO: 'Denso',
  CONGESTIONADO: 'Congestionado',
  COLAPSADO: 'Colapsado'
};

export const CONGESTION_LEVEL_COLORS = {
  FLUIDO: '#10b981',         // Verde
  DENSO: '#f59e0b',          // Amarillo
  CONGESTIONADO: '#ef4444',  // Rojo
  COLAPSADO: '#7c2d12'       // Rojo oscuro
};

/**
 * Limite duro del rango de fechas en el endpoint /trafico/mapa.
 * Sincronizado con TRAFICO_MAPA_MAX_DIAS del controlador backend.
 */
export const TRAFICO_MAPA_MAX_DIAS = 7;

// ========================================
// ASIGNACION DE PATINETES
// ========================================

export const SCOOTER_DENSITY_LEVELS = {
  BAJA: 'BAJA',
  MEDIA: 'MEDIA',
  ALTA: 'ALTA',
  MUY_ALTA: 'MUY_ALTA'
};

export const SCOOTER_PROVIDER_DOMINANCE = {
  EQUILIBRADA: 'EQUILIBRADA',
  MONOPOLIO: 'MONOPOLIO',
  DUOPOLIO: 'DUOPOLIO',
  OLIGOPOLIO: 'OLIGOPOLIO'
};

export const SCOOTER_ZONE_TYPES = {
  CENTRO_URBANO: 'CENTRO_URBANO',
  ZONA_COMERCIAL: 'ZONA_COMERCIAL',
  ZONA_RESIDENCIAL: 'ZONA_RESIDENCIAL',
  ZONA_UNIVERSITARIA: 'ZONA_UNIVERSITARIA',
  ZONA_TURISTICA: 'ZONA_TURISTICA',
  ZONA_EMPRESARIAL: 'ZONA_EMPRESARIAL',
  PERIFERIA: 'PERIFERIA',
  ZONA_TRANSPORTE: 'ZONA_TRANSPORTE'
};

// ========================================
// COLORES Y ESTILOS
// ========================================

export const CHART_LIMITS = {
  MAX_ITEMS: 10 // Maximo de puntos de datos en graficos de resumen
};

/**
 * Paleta de colores compartida para graficos y visualizaciones.
 *
 * Coordinada con los tokens shadcn/Tailwind v4 del index.css para que
 * los graficos respiren la misma identidad visual que el resto de la
 * interfaz. Si se anaden nuevos colores aqui, mantener el mismo orden
 * (primary -> muted) y documentar su uso semantico.
 */
// Paleta de graficos derivada de los tokens de la consola (index.css), no de
// colores Tailwind genericos. Recharts necesita valores resueltos (no var()),
// asi que se replican los hex de los tokens semanticos y de dominio.
// Paleta de series alineada con la identidad "Atlas Civico". Valores resueltos
// (Recharts no resuelve var()), elegidos para leer bien en tema claro y oscuro.
export const CHART_COLORS = {
  primary: '#3b82c4',    // cobalto de marca - serie principal / telemetria
  secondary: '#2ba39b',  // teal - serie secundaria / valor positivo
  tertiary: '#d9a03f',   // ambar - serie terciaria
  quaternary: '#7c6fd6', // indigo-violeta - cuarta serie
  danger: '#d9533f',     // rojo - alerta / excedido / valor maximo
  muted: '#8a93a3',      // gris - serie auxiliar / baseline
  accent: '#c2693c',     // terracota - resaltado
  warning: '#d98a3f',    // naranja intermedio
  contrast: '#cfd6e0',   // neutro claro - lineas/texto
  deep: '#8a5bc2'        // violeta profundo - severidad
};

// ========================================
// FECHAS Y TIEMPO
// ========================================

export const DATE_CONFIG = {
  DATASET_YEAR: 2051, // Año de los datos del dataset
  LOCALE: 'es-ES',
  FORMAT_OPTIONS: {
    short: { day: '2-digit', month: '2-digit', year: 'numeric' },
    long: { day: 'numeric', month: 'long', year: 'numeric' },
    monthYear: { month: 'long', year: 'numeric' }
  }
};

// ========================================
// MENSAJES DE UI
// ========================================

export const UI_MESSAGES = {
  LOADING: 'Cargando...',
  ERROR_GENERIC: 'No se pudo completar la operacion. Reintenta en unos instantes.',
  ERROR_NETWORK: 'Sin conexion con el servidor. Revisa tu red e intentalo de nuevo.',
  ERROR_AUTH: 'Tu sesion ha caducado. Inicia sesion de nuevo para continuar.',
  NO_DATA: 'No hay datos disponibles.',
  EMPTY_RESULTS: 'No se encontraron resultados con los filtros aplicados.'
};

// ========================================
// RUTAS DE NAVEGACION
// ========================================

// ========================================
// CENSO - GRUPOS DE EDAD
// ========================================

// ========================================
// AFORO BICICLETAS - FRANJAS HORARIAS
// ========================================

// ========================================
// MADRID - DISTRITOS (codigos 1-21)
// ========================================

/**
 * Mapping codigo distrito -> nombre. Los importadores guardan el codigo
 * numerico (1-21) en `distrito` para puntos de trafico, accidentes, etc.
 * Esta tabla sirve para mostrar el nombre legible en la UI.
 *
 * Fuente: Ayuntamiento de Madrid, codificacion oficial de distritos.
 */
export const DISTRITOS_MADRID = {
  1: 'Centro',
  2: 'Arganzuela',
  3: 'Retiro',
  4: 'Salamanca',
  5: 'Chamartin',
  6: 'Tetuan',
  7: 'Chamberi',
  8: 'Fuencarral-El Pardo',
  9: 'Moncloa-Aravaca',
  10: 'Latina',
  11: 'Carabanchel',
  12: 'Usera',
  13: 'Puente de Vallecas',
  14: 'Moratalaz',
  15: 'Ciudad Lineal',
  16: 'Hortaleza',
  17: 'Villaverde',
  18: 'Villa de Vallecas',
  19: 'Vicalvaro',
  20: 'San Blas-Canillejas',
  21: 'Barajas'
};

/**
 * Helper: devuelve "Codigo - Nombre" para un codigo de distrito numerico,
 * o el valor crudo si no esta en la tabla. Tolera string/number.
 */
export const nombreDistrito = (codigo) => {
  if (codigo === null || codigo === undefined || codigo === '') {return '-';}
  const clave = typeof codigo === 'string' ? parseInt(codigo, 10) : codigo;
  const nombre = DISTRITOS_MADRID[clave];
  return nombre || String(codigo);
};

export const FRANJAS_HORARIAS = {
  MADRUGADA: 'MADRUGADA',
  MAÑANA: 'MAÑANA',
  MEDIODIA: 'MEDIODIA',
  TARDE: 'TARDE',
  NOCHE: 'NOCHE'
};

export const ETIQUETAS_FRANJAS_HORARIAS = {
  MADRUGADA: 'Madrugada (0-5h)',
  MAÑANA: 'Mañana (6-11h)',
  MEDIODIA: 'Mediodia (12-14h)',
  TARDE: 'Tarde (15-20h)',
  NOCHE: 'Noche (21-23h)'
};

// ========================================
// MULTAS - CALIFICACIONES Y DENUNCIANTES
// ========================================

export const CALIFICACIONES_MULTA = {
  LEVE: 'LEVE',
  GRAVE: 'GRAVE',
  MUY_GRAVE: 'MUY_GRAVE'
};

export const ETIQUETAS_CALIFICACION_MULTA = {
  LEVE: 'Leve',
  GRAVE: 'Grave',
  MUY_GRAVE: 'Muy grave'
};

export const TIPOS_DENUNCIANTE = {
  POLICIA_MUNICIPAL: 'POLICIA MUNICIPAL',
  SER: 'SER',
  SACE: 'SACE',
  AGENTES_DE_MOVILIDAD: 'AGENTES DE MOVILIDAD'
};

// ========================================
// CENSO - GRUPOS DE EDAD
// ========================================

export const GRUPOS_EDAD_CENSO = {
  INFANTIL: 'INFANTIL',
  JUVENIL: 'JUVENIL',
  ADULTO_JOVEN: 'ADULTO_JOVEN',
  ADULTO: 'ADULTO',
  MAYOR: 'MAYOR',
  ANCIANO: 'ANCIANO'
};

export const ETIQUETAS_GRUPOS_EDAD = {
  INFANTIL: 'Infantil (0-14)',
  JUVENIL: 'Juvenil (15-24)',
  ADULTO_JOVEN: 'Adulto joven (25-44)',
  ADULTO: 'Adulto (45-64)',
  MAYOR: 'Mayor (65-79)',
  ANCIANO: 'Anciano (80+)'
};

// ========================================
// RUTAS DE NAVEGACION
// ========================================

// Todas las claves de recursos de dominio estan en espanol para
// cumplir la regla de "codigo de dominio en espanol" de CLAUDE.md.
// Se conservan claves tecnicas en ingles (HOME, DASHBOARD, LOGIN,
// REGISTER, NOT_FOUND) por tratarse de infraestructura compartida.
export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  UBICACIONES: '/ubicaciones',
  CALIDAD_AIRE: '/calidad-aire',
  RUIDO: '/ruido',
  ACCIDENTES: '/accidentes',
  PATINETES: '/patinetes',
  BICICLETAS: '/bicicletas',
  CENSO: '/censo',
  MULTAS: '/multas',
  AFORO_BICICLETAS: '/aforo-bicicletas',
  AFORO_PEATONES: '/aforo-peatones',
  CONTENEDORES: '/contenedores',
  TRAFICO: '/trafico',
  // Hub BI cross-module
  CORRELACIONES: '/correlaciones',
  CORRELACION_AIRE_TRAFICO: '/correlaciones/aire-trafico',
  CORRELACION_MULTAS_ACCIDENTES: '/correlaciones/multas-accidentes',
  CORRELACION_CENSO_CONTENEDORES: '/correlaciones/censo-contenedores',
  CORRELACION_RUIDO_CENSO: '/correlaciones/ruido-censo',
  // Vista cross-domain por distrito (compone censo + accidentes + patinetes + multas)
  // Patron React Router: /distritos/:codigo (codigo numerico 1-21)
  DISTRITO: '/distritos/:codigo',
  // Helper para construir URLs concretas en runtime (links, navigate)
  DISTRITO_PATH: (codigo) => `/distritos/${codigo}`,
  LOGIN: '/login',
  REGISTER: '/register',
  NOT_FOUND: '*'
};
