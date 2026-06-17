# Despliegue del Frontend en Heroku (con CSP)

El frontend es una SPA estatica (Vite construye `dist/`). En Heroku se sirve con
un pequeno servidor Express (`server.cjs`) que ademas emite las cabeceras de
seguridad, en especial una **Content-Security-Policy estricta**.

## Como funciona la CSP

`server.cjs`, al arrancar:

1. Lee `dist/index.html` y calcula el **hash SHA-256 de cada `<script>` inline**
   (el del tema anti-FOUC y los que inyecte Vite). Esos hashes van en
   `script-src 'self' 'sha256-...'`, asi que **solo esos scripts concretos**
   pueden ejecutarse. Un script inyectado (XSS) se bloquea. No hay `'unsafe-inline'`
   ni `nonce` en `script-src`.
2. Elimina el `<meta>` CSP de desarrollo del HTML servido: en produccion la CSP
   va por **cabecera** (mas potente que el meta).

`style-src` conserva `'unsafe-inline'` (Tailwind v4 / Radix / Recharts / Leaflet
inyectan estilos inline imposibles de hashear de forma estable; la inyeccion de
estilos tiene un riesgo muy inferior a la de scripts, que SI queda bloqueada).

La directiva `connect-src` incluye automaticamente el ORIGEN de `VITE_API_BASE_URL`
para que la SPA pueda llamar a la API.

## Pasos (frontend y backend como apps Heroku separadas)

```bash
# 1) Crear las apps
heroku create anthem-web --remote web      # frontend
heroku create anthem-api --remote api      # backend (carpeta API-Anthem)

# 2) Config vars del FRONTEND (build + runtime)
heroku config:set -a anthem-web \
  VITE_API_BASE_URL=https://anthem-api.herokuapp.com/api/v1

# 3) Config vars del BACKEND (las de su .env.example) + CORS al frontend
heroku config:set -a anthem-api \
  NODE_ENV=production TEST_MODE=false \
  CORS_ORIGINS=https://anthem-web.herokuapp.com \
  JWT_SECRET=... JWT_REFRESH_SECRET=... DATABASE_URI=...
```

Heroku, con el buildpack de Node, ejecuta `npm install` + `npm run build`
(genera `dist/`) y luego arranca el proceso `web` del `Procfile` (`node
server.cjs`). `express`, `compression` y `helmet` estan en `dependencies` (se
mantienen en runtime); `vite` queda en `devDependencies` (solo build).

## Coupling importante (no es CSP, pero bloquea el login si no se ajusta)

Con frontend y backend en **subdominios distintos de `herokuapp.com` son
cross-site**. La cookie httpOnly del refresh token se emite hoy con
`sameSite: 'strict'` (`API-Anthem/src/controllers/controladorAutenticacion.js`,
`baseCookieOptions`), y una cookie SameSite=Strict/Lax **no se envia** en las
peticiones XHR cross-site -> el refresh fallaria en produccion.

Opciones:

- **Mismo sitio (recomendado):** servir ambos bajo un dominio propio
  (`app.midominio.com` + `api.midominio.com` comparten site `midominio.com`) y
  usar `sameSite: 'lax'`, o servir el frontend desde el propio backend.
- **Cross-site:** cambiar a `sameSite: 'none'` + `secure: true` en
  `baseCookieOptions` (ya es `secure` en produccion) y asegurar
  `CORS_ORIGINS` + `credentials: true` (ya configurado).

Esto es ortogonal a la CSP; se documenta aqui para que el despliegue funcione de
extremo a extremo.

## Probar la CSP en local antes de desplegar

```bash
cd Frontend-Anthem
npm install
npm run build
VITE_API_BASE_URL=http://localhost:3000/api/v1 PORT=4173 node server.cjs
# En otra terminal:
curl -sI http://localhost:4173/ | grep -i content-security-policy
# Abrir http://localhost:4173 y comprobar que la consola NO muestra
# violaciones de CSP (los scripts cargan via sus hashes).
```
