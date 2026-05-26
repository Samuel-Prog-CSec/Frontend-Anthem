import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import { visualizer } from 'rollup-plugin-visualizer'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
//
// Notas de arquitectura del bundle:
// - Alias `@` apunta a `src/` para que la CLI de shadcn pueda añadir
//   componentes con sus imports estandar `@/components/...`. Los imports
//   relativos existentes siguen funcionando.
// - `manualChunks` divide el bundle por dominio (vendor / query / charts /
//   maps / radix / icons) para que el navegador cachee modulos pesados
//   independientemente del codigo de aplicacion: cuando un commit toca
//   solo paginas, el chunk de Recharts/Leaflet se sigue sirviendo desde
//   cache HTTP.
// - `rollup-plugin-visualizer` genera `dist/stats.html` tras `npm run build`
//   para inspeccionar el tamano real de cada chunk.
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    visualizer({
      filename: 'dist/stats.html',
      template: 'treemap',
      gzipSize: true,
      brotliSize: true,
      open: false
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // Target moderno: browsers con soporte ES2022 (Chrome 91+, Firefox 90+,
    // Safari 15+). Reduce polyfills y tamano de output. Si se necesita
    // soporte legacy, bajar a 'es2020'.
    target: 'es2022',
    // CSS por chunk: el CSS de cada modulo se sirve cuando se carga el
    // chunk asociado, evitando un unico bundle CSS gigante.
    cssCodeSplit: true,
    // Desactivar reporte de tamaño comprimido acelera el build ~20% sin
    // perder la metrica real (lo ve el navegador via Content-Encoding).
    reportCompressedSize: false,
    rollupOptions: {
      output: {
        manualChunks: {
          // Nucleo de React: cambia poco, candidato ideal a cache largo.
          vendor: ['react', 'react-dom', 'react-router-dom'],
          // React Query: estado server cross-componente.
          query: ['@tanstack/react-query'],
          // Charts: Recharts es ~150KB minificado, separarlo evita pagar
          // su coste en paginas que no usan graficos.
          charts: ['recharts'],
          // Mapas: Leaflet + plugins (~70KB total). Mismo razonamiento.
          maps: ['leaflet', 'react-leaflet', 'react-leaflet-cluster', 'leaflet.heat'],
          // Iconos: lucide-react tree-shake funciona, pero agrupar el
          // runtime comun reduce duplicacion entre chunks.
          icons: ['lucide-react']
        }
      }
    }
  },
  // Pre-bundling para dev: evita cold starts cuando Vite carga deps por
  // primera vez en una pagina. Lista los modulos criticos.
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      'axios',
      'jwt-decode'
    ]
  }
})
