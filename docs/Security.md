# Security - Smart City Dashboard

Documentacion de las medidas de seguridad implementadas en el frontend.

## Autenticacion

### Almacenamiento de Tokens

**Access Token**
- Almacenado en memoria (closure en axios.js)
- NO se guarda en localStorage ni sessionStorage
- Expira en 15 minutos (configurable en backend)

```javascript
// src/api/axios.js
let accessToken = null;

export const setAuthTokens = (access) => {
  accessToken = access;
};

export const clearAuthTokens = () => {
  accessToken = null;
};

const getAccessToken = () => accessToken;
```

**Refresh Token**
- Enviado como httpOnly cookie por el backend
- No accesible desde JavaScript (proteccion XSS)
- Expira en 7 dias

### Flujo de Renovacion
```javascript
// Interceptor que maneja 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Refresh token se envia automaticamente como cookie
        const response = await apiClient.post('/auth/refresh-token');
        const { accessToken } = response.data.data;
        
        setAuthTokens(accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Sesion expirada, redirigir a login
        clearAuthTokens();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);
```

## Proteccion XSS

### Sanitizacion de Inputs
React escapa automaticamente el contenido en JSX:
```jsx
// Seguro - React escapa el contenido
<p>{userInput}</p>

// PELIGROSO - Evitar a toda costa
<div dangerouslySetInnerHTML={{ __html: userInput }} />
```

### Validacion de Formularios
```javascript
// Validar y sanitizar antes de enviar
const handleSubmit = (e) => {
  e.preventDefault();
  
  // Validar email
  if (!isValidEmail(email)) {
    setError('Email invalido');
    return;
  }
  
  // Validar password
  if (password.length < 8) {
    setError('La contrasena debe tener al menos 8 caracteres');
    return;
  }
  
  // Enviar datos validados
  authService.login(email.trim(), password);
};
```

### Content Security Policy
Configurar en el servidor o meta tag:
```html
<meta 
  http-equiv="Content-Security-Policy"
  content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'"
/>
```

## Proteccion CSRF

### Cookies con SameSite
El backend configura cookies con:
```
Set-Cookie: refreshToken=xxx; HttpOnly; Secure; SameSite=Strict
```

### CORS Configurado
Solo origenes permitidos pueden hacer peticiones:
```javascript
// Backend CORS config
cors({
  origin: ['http://localhost:5173'],
  credentials: true
})
```

## Manejo de Datos Sensibles

### No Loggear Datos Sensibles
```javascript
// MAL - No hacer esto
console.log('Login:', { email, password });

// BIEN - Ocultar password
console.log('Login attempt:', { email });
```

### Limpiar Formularios
```javascript
// Limpiar password despues de submit
const handleLogin = async (e) => {
  e.preventDefault();
  try {
    await authService.login(email, password);
  } finally {
    setPassword(''); // Limpiar password de memoria
  }
};
```

### No Cachear Datos Sensibles
```javascript
// Datos sensibles no se cachean
const { data } = useQuery({
  queryKey: ['user-profile'],
  queryFn: authService.getProfile,
  cacheTime: 0, // No cachear
  staleTime: 0
});
```

## Variables de Entorno

### Prefijo VITE_
Solo variables con prefijo `VITE_` son expuestas al cliente:
```env
# .env
VITE_API_BASE_URL=http://localhost:3000/api/v1

# Esta NO estara disponible en el cliente
SECRET_KEY=never_expose_this
```

### Archivo .env.example
Documentar variables sin valores sensibles:
```env
# .env.example
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_APP_ENV=development
```

### .gitignore
```gitignore
.env
.env.local
.env.*.local
```

## Validacion de Rutas

### Rutas Protegidas
```jsx
function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <LoadingState />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}
```

### Rutas Publicas
```jsx
function PublicRoute({ children }) {
  const { isAuthenticated } = useAuth();
  
  // Redirigir usuarios autenticados
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
}
```

## Manejo de Errores

### No Exponer Detalles Internos
```jsx
function ErrorState({ error }) {
  // No mostrar stack traces o detalles tecnicos
  const userMessage = error.response?.data?.message 
    || 'Ha ocurrido un error. Por favor, intenta de nuevo.';
  
  return (
    <div className="text-center">
      <p>{userMessage}</p>
    </div>
  );
}
```

### Logging Seguro
```javascript
// Desarrollo: logs detallados
if (import.meta.env.DEV) {
  console.error('Error details:', error);
}

// Produccion: enviar a servicio de monitoreo
if (import.meta.env.PROD) {
  errorTrackingService.capture(error);
}
```

## Dependencias Seguras

### Auditar Dependencias
```bash
# Verificar vulnerabilidades
npm audit

# Corregir automaticamente
npm audit fix
```

### Actualizar Regularmente
```bash
# Ver actualizaciones disponibles
npm outdated

# Actualizar dependencias
npm update
```

### Lock File
Siempre commitear `package-lock.json`:
```bash
git add package-lock.json
```

## HTTPS

### Solo HTTPS en Produccion
```javascript
// Redirigir HTTP a HTTPS
if (window.location.protocol === 'http:' && import.meta.env.PROD) {
  window.location.href = window.location.href.replace('http:', 'https:');
}
```

### Mixed Content
Evitar cargar recursos HTTP en paginas HTTPS:
```jsx
// MAL
<img src="http://example.com/image.jpg" />

// BIEN
<img src="https://example.com/image.jpg" />
// O usar URLs relativas al protocolo
<img src="//example.com/image.jpg" />
```

## Rate Limiting

### Manejo en Frontend
```javascript
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 429) {
      const retryAfter = error.response.headers['retry-after'] || 60;
      showNotification(
        `Demasiadas peticiones. Espera ${retryAfter} segundos.`,
        'warning'
      );
    }
    return Promise.reject(error);
  }
);
```

### Debounce en Busquedas
```javascript
// Evitar spam de peticiones
const debouncedSearch = useMemo(
  () => debounce((query) => {
    fetchResults(query);
  }, 300),
  []
);
```

## Checklist de Seguridad

### Autenticacion
- [ ] Tokens en memoria, no localStorage
- [ ] Refresh tokens como httpOnly cookies
- [ ] Logout limpia todos los tokens
- [ ] Session timeout implementado

### XSS
- [ ] No usar dangerouslySetInnerHTML
- [ ] Validar inputs en formularios
- [ ] Content Security Policy configurado

### CSRF
- [ ] Cookies con SameSite
- [ ] CORS correctamente configurado

### Datos
- [ ] No loggear datos sensibles
- [ ] Limpiar formularios con passwords
- [ ] Variables sensibles en .env (no commiteado)

### Infraestructura
- [ ] HTTPS en produccion
- [ ] Dependencias auditadas regularmente
- [ ] Error handling sin exponer internals

## Referencias

- [OWASP XSS Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [JWT Best Practices](https://auth0.com/blog/a-look-at-the-latest-draft-for-jwt-bcp/)
- [React Security](https://react.dev/learn/keeping-components-pure)
- [Vite Env Variables](https://vitejs.dev/guide/env-and-mode.html)
