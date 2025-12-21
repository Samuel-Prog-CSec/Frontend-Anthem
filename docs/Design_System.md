# Design System - Smart City Dashboard 2051

Sistema de diseno para el frontend del dashboard de Smart City. Define los patrones visuales, componentes reutilizables y guias de estilo para mantener consistencia en toda la aplicacion.

## Paleta de Colores

### Colores Primarios
La paleta principal usa tonos cyan/azul que evocan tecnologia y futurismo:

```css
--color-primary-50: #ecfeff
--color-primary-100: #cffafe
--color-primary-200: #a5f3fc
--color-primary-300: #67e8f9
--color-primary-400: #22d3ee
--color-primary-500: #06b6d4  /* Color principal */
--color-primary-600: #0891b2
--color-primary-700: #0e7490
--color-primary-800: #155e75
--color-primary-900: #164e63
--color-primary-950: #083344
```

### Colores Semanticos

#### Calidad del Aire
- `--color-air-good: #22c55e` - Buena calidad
- `--color-air-moderate: #eab308` - Moderada
- `--color-air-poor: #f97316` - Mala
- `--color-air-very-poor: #ef4444` - Muy mala
- `--color-air-hazardous: #7c2d12` - Peligrosa

#### Niveles de Ruido
- `--color-noise-quiet: #06b6d4` - Silencioso (<45 dB)
- `--color-noise-moderate: #22c55e` - Moderado (45-65 dB)
- `--color-noise-loud: #eab308` - Alto (65-75 dB)
- `--color-noise-very-loud: #f97316` - Muy alto (75-85 dB)
- `--color-noise-dangerous: #ef4444` - Peligroso (>85 dB)

### Fondos y Superficies

El tema oscuro usa gradientes sutiles:
- Fondo principal: `from-slate-900 to-slate-950`
- Superficies (cards): `bg-slate-800/50` con backdrop blur
- Bordes: `border-slate-700`

## Tipografia

### Familia Tipografica
```css
font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
```

### Escala Tipografica
- `text-xs`: 0.75rem - Labels, badges
- `text-sm`: 0.875rem - Texto secundario
- `text-base`: 1rem - Texto normal
- `text-lg`: 1.125rem - Subtitulos
- `text-xl`: 1.25rem - Titulos de seccion
- `text-2xl`: 1.5rem - Titulos de pagina
- `text-3xl`: 1.875rem - Metricas destacadas

## Componentes

### Button
Basado en el patron Shadcn/ui con variantes:

```jsx
// Variantes disponibles
<Button variant="primary">Accion principal</Button>
<Button variant="secondary">Accion secundaria</Button>
<Button variant="outline">Borde visible</Button>
<Button variant="ghost">Sin fondo</Button>
<Button variant="danger">Accion destructiva</Button>

// Tamanos
<Button size="sm">Pequeno</Button>
<Button size="md">Normal</Button>
<Button size="lg">Grande</Button>
```

**Referencia**: [Shadcn/ui Button](https://ui.shadcn.com/docs/components/button)

### Card
Contenedor con efecto glass:

```jsx
<Card>
  <CardHeader>
    <CardTitle>Titulo</CardTitle>
    <CardDescription>Descripcion</CardDescription>
  </CardHeader>
  <CardContent>
    Contenido
  </CardContent>
</Card>
```

**Estilos aplicados**:
- Borde sutil: `border-slate-700`
- Fondo semi-transparente: `bg-slate-800/50`
- Backdrop blur: `backdrop-blur-sm`
- Sombra suave con tinte primario

**Referencia**: [Shadcn/ui Card](https://ui.shadcn.com/docs/components/card)

### Badge
Etiquetas para estados y categorias:

```jsx
<Badge variant="default">Default</Badge>
<Badge variant="success">Exito</Badge>
<Badge variant="warning">Advertencia</Badge>
<Badge variant="danger">Error</Badge>
<Badge variant="info">Informacion</Badge>
```

**Referencia**: [Shadcn/ui Badge](https://ui.shadcn.com/docs/components/badge)

### Table
Tabla con filas alternadas y hover:

```jsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Columna 1</TableHead>
      <TableHead>Columna 2</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>Dato 1</TableCell>
      <TableCell>Dato 2</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

**Referencia**: [Shadcn/ui Table](https://ui.shadcn.com/docs/components/table)

### Input y Select
Controles de formulario con estilo consistente:

```jsx
<Input 
  placeholder="Buscar..." 
  leftIcon={<Search />}
/>

<Select
  options={[{ value: '1', label: 'Opcion 1' }]}
  onChange={handleChange}
/>
```

**Referencia**: [Shadcn/ui Input](https://ui.shadcn.com/docs/components/input)

## Graficos

Usamos Recharts para visualizaciones:

### LineChartCard
Para tendencias temporales:
```jsx
<LineChartCard
  title="Evolucion mensual"
  data={data}
  dataKey="value"
  xAxisKey="month"
  color="#06b6d4"
/>
```

### BarChartCard
Para comparaciones:
```jsx
<BarChartCard
  title="Comparativa"
  data={data}
  dataKey="value"
  xAxisKey="name"
  color="#22c55e"
/>
```

### PieChartCard
Para distribuciones:
```jsx
<PieChartCard
  title="Distribucion"
  data={data}
  dataKey="value"
  nameKey="name"
/>
```

**Referencia**: [Recharts Documentation](https://recharts.org/en-US/api)

## Iconos

Usamos Lucide React para iconografia consistente:

```jsx
import { MapPin, Wind, Volume2, Activity } from 'lucide-react';

<MapPin className="w-5 h-5" />
```

**Referencia**: [Lucide Icons](https://lucide.dev/icons/)

## Patrones de Layout

### PageLayout
Estructura estandar de pagina:

```jsx
<PageLayout
  title="Titulo de Pagina"
  description="Descripcion breve"
  actions={<Button>Accion</Button>}
>
  {/* Contenido de la pagina */}
</PageLayout>
```

### Grid System
Usamos CSS Grid de Tailwind:

```jsx
// Grid responsivo
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  {items.map(item => <Card key={item.id} />)}
</div>
```

## Estados de UI

### Loading
```jsx
<LoadingState message="Cargando datos..." />
```

### Empty
```jsx
<EmptyState
  title="Sin resultados"
  description="No hay datos para mostrar"
  icon={<SearchX />}
/>
```

### Error
```jsx
<ErrorState
  title="Error al cargar"
  message={error.message}
  onRetry={handleRetry}
/>
```

## Animaciones

### Transiciones
- Duracion estandar: `transition-all duration-200`
- Hover en cards: `hover:border-primary-500/50`
- Focus en inputs: `focus:ring-2 focus:ring-primary-500`

### Animacion Glow (efecto futurista)
```css
.glow-effect {
  animation: glow 2s ease-in-out infinite alternate;
}

@keyframes glow {
  from { box-shadow: 0 0 10px rgba(6, 182, 212, 0.3); }
  to { box-shadow: 0 0 20px rgba(6, 182, 212, 0.6); }
}
```

## Responsive Breakpoints

```
sm: 640px   - Moviles grandes
md: 768px   - Tablets
lg: 1024px  - Laptops
xl: 1280px  - Escritorio
2xl: 1536px - Pantallas grandes
```

## Accesibilidad

### Contraste
- Texto principal sobre fondo oscuro: ratio minimo 4.5:1
- Texto secundario: `text-slate-400` sobre `bg-slate-800`

### Navegacion por teclado
- Todos los elementos interactivos tienen `focus-visible` states
- Orden de tabulacion logico

### ARIA
- Labels en formularios
- Roles semanticos en componentes
- Mensajes de error accesibles

## Referencias

- [Shadcn/ui](https://ui.shadcn.com/) - Componentes base
- [Tailwind CSS v4](https://tailwindcss.com/docs) - Framework CSS
- [Recharts](https://recharts.org/) - Graficos
- [Lucide React](https://lucide.dev/) - Iconos
- [WCAG 2.1](https://www.w3.org/WAI/WCAG21/quickref/) - Accesibilidad
