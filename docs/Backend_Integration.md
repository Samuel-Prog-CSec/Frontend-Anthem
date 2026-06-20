# Backend Integration - Smart City Dashboard

Documentacion de la integracion entre el frontend React y la API REST del backend.

## Configuracion Base

### URL Base
```javascript
// Desarrollo
const API_BASE_URL = 'http://localhost:3000/api/v1';

// Produccion (configurar en .env)
VITE_API_BASE_URL=https://api.smartcity.example.com/api/v1
```

### Instancia de Axios
```javascript
// src/api/axios.js
import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});
```

## Autenticacion

### Flujo de Login
1. Usuario envia credenciales a `POST /auth/login`
2. Backend retorna `accessToken` y `refreshToken`
3. `accessToken` se almacena en memoria (closure en axios.js)
4. `refreshToken` se usa para renovar tokens automaticamente

### Interceptors

#### Request Interceptor
Agrega el token a todas las peticiones:
```javascript
apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

#### Response Interceptor
Maneja renovacion automatica de tokens:
```javascript
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !error.config._retry) {
      // Intenta renovar el token
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        error.config._retry = true;
        return apiClient(error.config);
      }
    }
    return Promise.reject(error);
  }
);
```

### Endpoints de Auth

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| POST | `/auth/login` | Iniciar sesion |
| POST | `/auth/register` | Registrar usuario |
| POST | `/auth/logout` | Cerrar sesion |
| POST | `/auth/refresh-token` | Renovar access token |
| GET | `/auth/me` | Obtener usuario actual |

## Endpoints Disponibles

### Ubicaciones

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/ubicaciones` | Listar ubicaciones con paginacion |
| GET | `/ubicaciones/:id` | Obtener ubicacion por ID |
| GET | `/ubicaciones/stats/by-type` | Estadisticas por tipo |
| GET | `/ubicaciones/distritos` | Listar distritos |
| GET | `/ubicaciones/tipos` | Listar tipos de ubicacion |

**Parametros de query**:
- `page`: Numero de pagina (default: 1)
- `limit`: Resultados por pagina (default: 10, max: 100)
- `tipo`: Filtrar por tipo de ubicacion
- `distrito`: Filtrar por distrito
- `sort`: Campo para ordenar (ej: `-fechaCreacion`)

### Calidad del Aire

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/calidad-aire` | Listar mediciones |
| GET | `/calidad-aire/:id` | Obtener medicion por ID |
| GET | `/calidad-aire/stats/average` | Promedios de contaminantes |
| GET | `/calidad-aire/stats/by-location` | Estadisticas por ubicacion |
| GET | `/calidad-aire/stats/by-month` | Estadisticas por mes |

**Parametros de query**:
- `page`, `limit`: Paginacion
- `magnitud`: Tipo de contaminante (NO2, O3, PM10, PM2_5, SO2, CO, BEN, TOL)
- `mes`: Mes del anio (1-12)
- `ubicacion`: ID de ubicacion
- `valorMin`, `valorMax`: Rango de valores

### Contaminacion Acustica

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/ruido` | Listar mediciones de ruido |
| GET | `/ruido/:id` | Obtener medicion por ID |
| GET | `/ruido/stats/average` | Promedios por periodo |
| GET | `/ruido/stats/by-location` | Estadisticas por ubicacion |
| GET | `/ruido/ranking` | Ranking de ubicaciones mas ruidosas |

**Parametros de query**:
- `page`, `limit`: Paginacion
- `ubicacion`: ID de ubicacion
- `periodo`: Periodo del dia (diurno, vespertino, nocturno)
- `ldMin`, `ldMax`: Rango de nivel diurno

## Formato de Respuesta

### Respuesta Exitosa
```json
{
  "success": true,
  "message": "Operacion exitosa",
  "data": { ... },
  "pagination": {
    "currentPage": 1,
    "totalPages": 10,
    "totalItems": 100,
    "itemsPerPage": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### Respuesta de Error
```json
{
  "success": false,
  "message": "Descripcion del error",
  "errors": [
    { "field": "email", "message": "Email invalido" }
  ]
}
```

## Servicios del Frontend

### authService
```javascript
import { authService } from './api';

// Login
const response = await authService.login(email, password);

// Logout
await authService.logout();

// Registro
const response = await authService.register(userData);

// Restaurar sesion
const user = await authService.restoreSession();
```

### locationService
```javascript
import { locationService } from './api';

// Listar ubicaciones
const { data, pagination } = await locationService.getLocations({
  page: 1,
  limit: 10,
  tipo: 'punto_de_medicion'
});

// Puntos de medicion
const points = await locationService.getMeasurementPoints();

// Estadisticas por tipo
const stats = await locationService.getLocationsByType();

// Distritos
const districts = await locationService.getDistricts();
```

### airQualityService
```javascript
import { airQualityService } from './api';

// Listar datos
const { data, pagination } = await airQualityService.getAirQualityData({
  magnitud: 'NO2',
  mes: 6
});

// Estadisticas
const stats = await airQualityService.getAirQualityStatistics();

// Promedios por mes
const monthly = await airQualityService.getAverageByMonth();
```

### noiseService
```javascript
import { noiseService } from './api';

// Listar datos
const { data, pagination } = await noiseService.getNoiseData({
  periodo: 'nocturno'
});

// Estadisticas
const stats = await noiseService.getNoiseStatistics();

// Ranking
const ranking = await noiseService.getNoiseRanking({ limit: 10 });
```

## Manejo de Errores

### Error Handling Centralizado
```javascript
try {
  const data = await locationService.getLocations();
} catch (error) {
  if (error.response) {
    // Error del servidor (4xx, 5xx)
    console.error('Error:', error.response.data.message);
  } else if (error.request) {
    // Sin respuesta del servidor
    console.error('Error de red');
  } else {
    // Error de configuracion
    console.error('Error:', error.message);
  }
}
```

### Codigos de Estado

| Codigo | Descripcion | Accion |
|--------|-------------|--------|
| 200 | OK | Procesar datos |
| 201 | Creado | Mostrar confirmacion |
| 304 | No modificado | Usar cache |
| 400 | Bad Request | Mostrar errores de validacion |
| 401 | No autorizado | Redirigir a login |
| 403 | Prohibido | Mostrar mensaje de permisos |
| 404 | No encontrado | Mostrar pagina 404 |
| 429 | Rate limit | Mostrar mensaje de espera |
| 500 | Error servidor | Mostrar error generico |

## React Query

### Configuracion
```javascript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 min
      cacheTime: 10 * 60 * 1000, // 10 min
      retry: 2,
      refetchOnWindowFocus: false
    }
  }
});
```

### Uso en Componentes
```javascript
import { useQuery } from '@tanstack/react-query';
import { locationService } from '../api';

function LocationsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['locations', filters],
    queryFn: () => locationService.getLocations(filters)
  });
  
  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;
  
  return <LocationTable data={data} />;
}
```

## CORS

El backend debe permitir peticiones desde el frontend:

```javascript
// Backend - CORS config
cors({
  origin: ['http://localhost:5173', 'https://dashboard.smartcity.example.com'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
})
```

## Variables de Entorno

Crear archivo `.env` en la raiz del frontend:

```env
# API
VITE_API_BASE_URL=http://localhost:3000/api/v1

# Timeouts
VITE_API_TIMEOUT=30000

# Environment
VITE_APP_ENV=development
```

## Referencias

- [Axios Documentation](https://axios-http.com/docs/intro)
- [React Query](https://tanstack.com/query/latest)
- [API Documentation](https://github.com/Samuel-Prog-CSec/API-Anthem/blob/main/docs/API_Documentation.md)
