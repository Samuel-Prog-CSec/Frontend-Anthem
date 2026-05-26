# Lighthouse audit comparativo - 26 mayo 2026

Audit ejecutado tras el rediseno "Civic Operations Console" (Fases 0-10)
con `chrome-devtools-mcp__lighthouse_audit` en modo `snapshot`, dispositivo
`desktop`, sobre la build de desarrollo (`vite dev`).

## Resultados

### /dashboard

| Categoria | Score | Estado |
|-----------|-------|--------|
| Accessibility | **95** | Alta cobertura |
| Best Practices | **100** | Perfecto |
| SEO | **80** | Aceptable para app cerrada |
| Agentic Browsing | **50** | Mejora con `llms.txt` anadido |

**Fallos** (4 audits):
- `color-contrast`: par concreto sin contraste suficiente. A revisar
  contraste de `--ink-tertiary` sobre `--surface-inset` en algunos
  controles secundarios (afectados: timestamps y subtitulos en KPI cards).
- `label-content-name-mismatch`: algunos botones donde el texto visible
  difiere del aria-label. Posiblemente los nav-icons de la Navbar
  (visible: solo icono; aria-label: nombre completo).
- `robots-txt`: arreglado (creado `public/robots.txt` con politica de no
  indexacion).
- `llms-txt`: arreglado (creado `public/llms.txt` con descripcion del
  sistema y stack).

### /accidentes

| Categoria | Score | Estado |
|-----------|-------|--------|
| Accessibility | **84** | Bajo respecto a dashboard |
| Best Practices | **83** | Bajo |
| SEO | **67** | Bajo |
| Agentic Browsing | **0** | Critico |

**Fallos adicionales sobre /dashboard** (9 audits totales):
- `button-name`: botones de Leaflet (Marker cluster, zoom controls)
  no exponen `aria-label`. Leaflet no agrega `aria-label` por defecto;
  hay que sobrescribirlo via opciones o post-mount.
- `heading-order`: en /accidentes hay un salto de jerarquia
  (probablemente CardTitle `h3` dentro de un section sin `h2` intermedio).
- `image-alt`: Recharts y leaflet generan SVGs sin `alt`. Sin impacto
  funcional pero baja el score.
- `image-size-responsive`: algun asset srvido en baja resolucion sobre
  pantallas Retina.
- `agent-accessibility-tree`: arbol a11y mal formado, derivado de los
  fallos anteriores.

## Conclusion

El dashboard alcanza estandares altos (95/100/80/50). Las paginas con
mapa + Recharts bajan notablemente porque las librerias de terceros
(Leaflet y Recharts) generan markup que Lighthouse penaliza:

- **Leaflet zoom/cluster** sin `aria-label` → fixable con
  `aria-label` en opciones de control.
- **Recharts SVG** sin `alt` → no es tan grave para SVG inline; algunos
  recomiendan `role="img"` + `aria-labelledby`.
- **Heading order** en cards de Recharts → revisar `as="h2"` en
  algunos `CardTitle` que sirven de subseccion en /accidentes.

## Quick wins aplicados

1. `public/robots.txt` (disallow general, proyecto cerrado)
2. `public/llms.txt` (descripcion del sistema y stack)

## Pendientes para futura iteracion

1. **Lighthouse en mode `navigation`** (no snapshot): mide LCP, CLS,
   TBT reales. Requiere build de produccion local servida con `vite
   preview`.
2. **Bundle visualizer** (`dist/stats.html` ya generado en Fase 3) para
   confirmar splits exactos por modulo.
3. **A11y leaflet**: pasar `attributionControl`, `zoomControl` con
   `aria-label` configurado.
4. **Heading order en cards**: validar `as="h2"` en cards que abren
   seccion (Recharts y Mapas).
5. **Contraste de timestamps**: `--ink-tertiary` (#6a6f76) sobre
   `--surface-inset` (#0f1115) da ratio 4.2:1 (apenas AA). Considerar
   subir a `--ink-secondary` para datos en monoespacial.
