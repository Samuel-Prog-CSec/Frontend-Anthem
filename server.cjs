/**
 * Servidor estatico de PRODUCCION para la SPA (proceso `web` en Heroku).
 *
 * Vite construye la app en `dist/` (ficheros estaticos). Heroku no tiene nginx
 * por defecto, asi que este pequeno servidor Express sirve `dist/` y aplica las
 * cabeceras de seguridad, en particular una Content-Security-Policy ESTRICTA.
 *
 * CSP sin 'unsafe-inline' en script-src:
 *   - Al arrancar se lee `dist/index.html` y se calcula el hash SHA-256 de CADA
 *     <script> inline (el del tema anti-FOUC y los que inyecte Vite). Esos
 *     hashes se anaden a `script-src 'self' 'sha256-...'`, de modo que SOLO esos
 *     scripts concretos pueden ejecutarse: cualquier script inyectado (XSS) se
 *     bloquea. No hace falta nonce ni 'unsafe-inline'.
 *   - El <meta> CSP de desarrollo se elimina del HTML servido: en produccion la
 *     CSP va por CABECERA (mas potente: permite frame-ancestors, etc.).
 *
 * style-src conserva 'unsafe-inline' porque Tailwind v4, Radix UI, Recharts y
 * Leaflet inyectan estilos inline imposibles de hashear de forma estable; la
 * inyeccion de estilos tiene un riesgo muy inferior a la de scripts (bloqueada).
 *
 * Variables de entorno (Heroku config vars):
 *   - PORT                 lo inyecta Heroku.
 *   - VITE_API_BASE_URL    URL base del backend (ej. https://anthem-api.herokuapp.com/api/v1).
 *                          Se usa en build (Vite la inyecta en el bundle) y aqui
 *                          en runtime para anadir su ORIGEN a `connect-src`.
 *   - BACKEND_ORIGIN       alternativa explicita si se prefiere (solo el origen).
 */

const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const express = require('express');
const compression = require('compression');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 4173;
const DIST = path.join(__dirname, 'dist');
const INDEX_HTML_PATH = path.join(DIST, 'index.html');

// Origen del backend para connect-src (la SPA hace fetch/XHR contra la API).
const apiBase = process.env.VITE_API_BASE_URL || process.env.BACKEND_ORIGIN || '';
let apiOrigin = '';
if (apiBase) {
  try {
    apiOrigin = new URL(apiBase).origin;
  } catch {
    // URL mal formada: connect-src se queda en 'self' (la API debe ir aqui).
    console.warn(`[server] VITE_API_BASE_URL/BACKEND_ORIGIN invalida: "${apiBase}"`);
  }
}

// Leer el HTML construido una vez y derivar los hashes de los scripts inline.
let indexHtml = '';
const scriptHashes = [];
try {
  indexHtml = fs.readFileSync(INDEX_HTML_PATH, 'utf8');

  // Quitar el <meta> CSP de desarrollo: en produccion la CSP va por cabecera.
  indexHtml = indexHtml.replace(
    /\s*<meta[^>]+http-equiv=["']Content-Security-Policy["'][^>]*>/i,
    ''
  );

  // Hash SHA-256 de cada <script> inline (sin atributo src).
  const inlineScriptRe = /<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = inlineScriptRe.exec(indexHtml)) !== null) {
    const hash = crypto.createHash('sha256').update(match[1], 'utf8').digest('base64');
    scriptHashes.push(`'sha256-${hash}'`);
  }
} catch (err) {
  console.error('[server] No se pudo leer dist/index.html. Ejecuta `npm run build` antes de arrancar.', err.message);
  process.exit(1);
}

const connectSrc = ["'self'", 'https://*.tile.openstreetmap.org'];
if (apiOrigin) {
  connectSrc.push(apiOrigin);
}

// Heroku termina TLS en su router y reenvia via X-Forwarded-Proto.
app.set('trust proxy', 1);

app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: false,
    directives: {
      'default-src': ["'self'"],
      'base-uri': ["'self'"],
      'object-src': ["'none'"],
      'frame-ancestors': ["'none'"],
      'form-action': ["'self'"],
      'script-src': ["'self'", ...scriptHashes],
      'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      'font-src': ["'self'", 'https://fonts.gstatic.com', 'data:'],
      'img-src': ["'self'", 'data:', 'blob:', 'https://*.basemaps.cartocdn.com', 'https://*.tile.openstreetmap.org', 'https://tile.openstreetmap.org'],
      'connect-src': connectSrc,
      'worker-src': ["'self'", 'blob:'],
      'upgrade-insecure-requests': []
    }
  },
  // HSTS: Heroku sirve HTTPS. Sin includeSubDomains/preload porque
  // *.herokuapp.com es un dominio compartido (activalos solo con dominio propio).
  hsts: { maxAge: 15552000, includeSubDomains: false, preload: false },
  // COEP require-corp rompe la carga cross-origin de los tiles del mapa.
  crossOriginEmbedderPolicy: false,
  referrerPolicy: { policy: 'no-referrer' }
}));

app.use(compression());

// El HTML se sirve SIEMPRE desde memoria (sin <meta> CSP). La CSP la pone la
// cabecera de helmet (arriba).
const enviarIndex = (_req, res) => {
  res.set('Cache-Control', 'no-cache');
  res.type('html').send(indexHtml);
};
app.get('/', enviarIndex);
app.get('/index.html', enviarIndex);

// Assets con hash de Vite (/assets/*): cache larga e inmutable.
app.use('/assets', express.static(path.join(DIST, 'assets'), {
  immutable: true,
  maxAge: '1y'
}));

// Resto de estaticos publicos (favicon, vite.svg, etc.). `index:false` para que
// no sirva index.html desde disco (lo servimos desde memoria, ya sin <meta> CSP).
app.use(express.static(DIST, { index: false, maxAge: '1h' }));

// Fallback SPA: cualquier ruta no-asset (rutas de React Router) -> index.html.
app.use(enviarIndex);

app.listen(PORT, () => {
  console.log(`[server] SPA en :${PORT} | script-src hashes: ${scriptHashes.length} | connect-src API: ${apiOrigin || '(solo self)'}`);
});
