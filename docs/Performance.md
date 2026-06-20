# Performance Optimization - Smart City Dashboard

Documentacion de las optimizaciones de rendimiento implementadas en el frontend.

## Code Splitting

### Lazy Loading de Rutas
Las paginas se cargan bajo demanda usando React.lazy():

```javascript
import { lazy, Suspense } from 'react';

const DashboardPage = lazy(() => import('./pages/Dashboard'));
const LocationsPage = lazy(() => import('./pages/Locations'));
const AirQualityPage = lazy(() => import('./pages/AirQuality'));

function App() {
  return (
    <Suspense fallback={<LoadingState />}>
      <Routes>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/locations" element={<LocationsPage />} />
      </Routes>
    </Suspense>
  );
}
```

**Beneficio**: Reduce el bundle inicial en ~40-60% al cargar solo el codigo necesario.

### Vite Build Optimization
```javascript
// vite.config.js
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom', 'react-router-dom'],
          'charts': ['recharts'],
          'query': ['@tanstack/react-query']
        }
      }
    }
  }
});
```

## React Query Caching

### Configuracion de Cache
```javascript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,  // Datos frescos por 5 min
      cacheTime: 10 * 60 * 1000, // Cache en memoria por 10 min
      retry: 2,
      refetchOnWindowFocus: false
    }
  }
});
```

### Query Keys Estrategicas
```javascript
// Keys estructuradas para invalidacion selectiva
const queryKeys = {
  locations: ['locations'],
  locationsByType: (type) => ['locations', 'type', type],
  airQuality: ['airQuality'],
  airQualityByMonth: (month) => ['airQuality', 'month', month],
  noise: ['noise'],
  noiseByPeriod: (period) => ['noise', 'period', period]
};
```

### Prefetching
```javascript
// Prefetch de datos en hover
const prefetchLocations = () => {
  queryClient.prefetchQuery({
    queryKey: ['locations'],
    queryFn: locationService.getLocations
  });
};

<Link 
  to="/locations" 
  onMouseEnter={prefetchLocations}
>
  Ubicaciones
</Link>
```

## Memoization

### React.memo para Componentes
```javascript
// Evita re-renders innecesarios
const StatCard = React.memo(function StatCard({ 
  title, 
  value, 
  icon, 
  trend 
}) {
  return (
    <Card>
      <div className="flex items-center gap-4">
        {icon}
        <div>
          <h3 className="text-sm text-slate-400">{title}</h3>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </div>
    </Card>
  );
});
```

### useMemo para Calculos
```javascript
function AirQualityPage({ data }) {
  // Calculo pesado memoizado
  const averageByContaminant = useMemo(() => {
    return data.reduce((acc, item) => {
      if (!acc[item.magnitud]) {
        acc[item.magnitud] = { sum: 0, count: 0 };
      }
      acc[item.magnitud].sum += item.valor;
      acc[item.magnitud].count += 1;
      return acc;
    }, {});
  }, [data]);
  
  return <Chart data={averageByContaminant} />;
}
```

### useCallback para Handlers
```javascript
function LocationsPage() {
  const [filters, setFilters] = useState({});
  
  // Handler memoizado
  const handleFilterChange = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);
  
  return (
    <FilterBar onChange={handleFilterChange} />
  );
}
```

## Debouncing

### Input de Busqueda
```javascript
import { useDeferredValue, useState } from 'react';

function SearchInput({ onSearch }) {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  
  useEffect(() => {
    onSearch(deferredQuery);
  }, [deferredQuery, onSearch]);
  
  return (
    <Input
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder="Buscar..."
    />
  );
}
```

### Hook Personalizado
```javascript
// hooks/useDebounce.js
function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => clearTimeout(timer);
  }, [value, delay]);
  
  return debouncedValue;
}
```

## Optimizacion de Imagenes

### Lazy Loading Nativo
```jsx
<img 
  src={imageUrl} 
  alt="Description"
  loading="lazy"
  decoding="async"
/>
```

### WebP con Fallback
```jsx
<picture>
  <source srcSet={imageWebp} type="image/webp" />
  <img src={imagePng} alt="Description" />
</picture>
```

## Virtualizacion de Listas

Para listas largas (>100 items), usar react-virtual:

```javascript
import { useVirtualizer } from '@tanstack/react-virtual';

function VirtualizedTable({ items }) {
  const parentRef = useRef(null);
  
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
    overscan: 5
  });
  
  return (
    <div ref={parentRef} className="h-[400px] overflow-auto">
      <div style={{ height: virtualizer.getTotalSize() }}>
        {virtualizer.getVirtualItems().map((virtualRow) => (
          <TableRow 
            key={virtualRow.key}
            item={items[virtualRow.index]}
            style={{
              transform: `translateY(${virtualRow.start}px)`
            }}
          />
        ))}
      </div>
    </div>
  );
}
```

## Bundle Analysis

### Analizar Tamano del Bundle
```bash
# Generar visualizacion del bundle
npm run build -- --report

# O usar rollup-plugin-visualizer
npm install -D rollup-plugin-visualizer
```

### Vite Config
```javascript
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      filename: 'dist/stats.html',
      open: true
    })
  ]
});
```

## Metricas de Rendimiento

### Core Web Vitals
- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1

### Medicion con React DevTools
1. Activar "Highlight updates"
2. Usar Profiler para detectar re-renders innecesarios
3. Optimizar componentes con muchos re-renders

### Console Timing
```javascript
// Medir tiempo de operaciones
console.time('fetchLocations');
const data = await locationService.getLocations();
console.timeEnd('fetchLocations');
```

## Network Optimization

### Request Batching
```javascript
// Agrupar peticiones independientes
const [locations, airQuality, noise] = await Promise.all([
  locationService.getLocations(),
  airQualityService.getAirQualityData(),
  noiseService.getNoiseData()
]);
```

### Compression
El backend usa GZIP compression. Verificar headers:
```
Content-Encoding: gzip
```

### HTTP Caching
Aprovechar ETags del backend:
```javascript
// Axios usa cache del navegador automaticamente
// cuando el servidor retorna 304 Not Modified
```

## Buenas Practicas

1. **Evitar props drilling** - Usar Context o React Query
2. **Keys estables** - Usar IDs unicos, no indices
3. **Componentes pequenos** - Facilita memoization
4. **CSS-in-JS minimal** - Preferir Tailwind classes
5. **Imports selectivos** - `import { Button } from './components'`

## Checklist de Performance

- [ ] Bundle inicial < 200KB (gzipped)
- [ ] Time to Interactive < 3s
- [ ] First Contentful Paint < 1.5s
- [ ] No memory leaks (verificar con DevTools)
- [ ] Paginacion para listas largas
- [ ] Skeleton loaders en lugar de spinners
- [ ] Imagenes optimizadas (WebP, lazy loading)
- [ ] Code splitting por rutas

## Referencias

- [React Performance](https://react.dev/learn/render-and-commit)
- [Web Vitals](https://web.dev/vitals/)
- [Vite Build Optimization](https://vitejs.dev/guide/build.html)
- [React Query Caching](https://tanstack.com/query/latest/docs/react/guides/caching)
