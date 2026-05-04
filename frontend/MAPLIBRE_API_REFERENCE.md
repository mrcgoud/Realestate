# MapLibre Integration - Technical API Reference

## 🔌 Component APIs

### MapLibreProvider

**Description**: Context provider for MapLibre GL instance management

**Props**:
```typescript
interface MapLibreProviderProps {
  center?: [number, number]        // Default: [-74.006, 40.7128]
  zoom?: number                     // Default: 12
  maxZoom?: number                  // Default: 20
  minZoom?: number                  // Default: 1
  children: React.ReactNode
  mapStyle?: string                 // Custom map style URL
}
```

**Exported Context**:
```typescript
interface MapLibreContextType {
  map: MapLibre | null              // Raw MapLibre instance
  container: HTMLDivElement | null  // DOM container
  isLoaded: boolean                 // Map initialization complete
  error: Error | null               // Initialization errors
  
  // Methods
  addMarker: (id: string, props: MarkerProps) => void
  removeMarker: (id: string) => void
  addLayer: (layer: Layer) => void
  removeLayer: (id: string) => void
  addSource: (id: string, source: Source) => void
  removeSource: (id: string) => void
  getCenter: () => [number, number]
  getZoom: () => number
  setCenter: (center: [number, number], zoom?: number) => void
  queryFeatures: (options: QueryOptions) => Feature[]
}
```

**Hook**:
```typescript
const { map, isLoaded, addLayer, removeLayer } = useMapLibre()
```

---

### MapLibreMap

**Description**: Full-featured map component with all layers

**Props**:
```typescript
interface MapLibreMapProps {
  properties: Property[]            // Properties to display
  onPropertySelect?: (id: string) => void
  onPropertyDeselect?: () => void
  selectedPropertyId?: string
  showClusters?: boolean            // Default: true
  clustering?: {
    radius?: number                 // Default: 40
    maxZoom?: number                // Default: 16
    minZoom?: number                // Default: 0
  }
  onClusterClick?: (clusterId: string) => void
  onMapLoad?: () => void
  initialBounds?: Bounds
}
```

**Emitted Events**:
```typescript
interface MapLibreMapEvents {
  propertySelected: { propertyId: string }
  propertyDeselected: void
  clusterSelected: { clusterId: string, count: number }
  mapLoaded: void
  zoomChanged: { zoom: number }
  centerChanged: { center: [number, number] }
}
```

**Data Structure** (Property):
```typescript
interface Property {
  id: string
  name: string
  latitude: number              // Must be -90 to 90
  longitude: number             // Must be -180 to 180
  price: number
  bedrooms: number
  bathrooms: number
  squareFeet: number
  imageUrl?: string
  type?: 'house' | 'apartment' | 'condo'
  demand?: 1-10                 // For heatmap
  density?: 1-10                // For heatmap
}
```

---

### MapControls

**Description**: Interactive layer control UI component

**Props**:
```typescript
interface MapControlsProps {
  onLayerToggle?: (layerId: string, enabled: boolean) => void
  positionClasses?: string         // CSS classes, default: 'top-20 right-20'
  theme?: 'light' | 'dark'         // Default: 'light'
  compact?: boolean                // Default: false
  showLegend?: boolean             // Default: true
}
```

**Toggleable Layers**:
```
- "propertyMarkers"    (checkboxes + cluster control)
- "heatmapLayer"       (checkbox + type selector)
  └── Types: "price" | "demand" | "density"
- "isochroneLayer"     (checkbox + time selector)
  └── Times: 15 | 30 | 45 minutes
```

---

### SearchMapWithList

**Description**: Complete integration component combining map and property list

**Props**:
```typescript
interface SearchMapWithListProps {
  properties?: Property[]          // Optional, uses search store if omitted
  showList?: boolean               // Default: true
  mapHeight?: string               // Default: '100vh'
  onPropertySelect?: (id: string) => void
  showSearchBar?: boolean          // Default: false
  selectedPropertyId?: string
}
```

**Emitted Events**:
```typescript
interface SearchMapWithListEvents {
  propertySelected: { propertyId: string }
  propertyClicked: { propertyId: string }
  viewDetailsClicked: { propertyId: string }
  mapLoaded: void
}
```

**Sub-Components**:

**SelectedPropertyCard**:
```typescript
interface SelectedPropertyCard {
  property: Property | null
  onClose: () => void
  onViewDetails: (id: string) => void
  showImage?: boolean              // Default: true
}
```

**PropertyListItem**:
```typescript
interface PropertyListItem {
  property: Property
  isSelected?: boolean
  onSelect: (id: string) => void
  onClick: (id: string) => void
}
```

---

## 🏪 Zustand Store API (mapStore)

### Store State

```typescript
interface MapStoreState {
  // Layer visibility
  visibleLayers: Record<string, boolean>
  // Format: { propertyMarkers: true, heatmapLayer: true, isochroneLayer: false }
  
  // Heatmap configuration
  heatmapType: 'price' | 'demand' | 'density'
  heatmapOpacity: number          // 0-1, default: 0.8
  
  // Isochrone configuration
  isochroneMode: boolean           // Is isochrone visible
  isochroneTime: number            // 15, 30, or 45 minutes
  isochroneType: 'driving' | 'transit' | 'walking'
  
  // Map state
  selectedPropertyId: string | null
  mapLoaded: boolean
  mapError: Error | null
  
  // Cached data
  cachedHeatmapData: Record<string, GeoJSON | null>
  cachedIsochroneData: Record<string, GeoJSON | null>
}
```

### Store Actions/Methods

```typescript
// Layer management
setLayerVisibility(layerId: string, visible: boolean): void
toggleLayer(layerId: string): void
setAllLayersVisible(visible: boolean): void
hideAllLayers(): void

// Heatmap
setHeatmapType(type: 'price' | 'demand' | 'density'): void
setHeatmapOpacity(opacity: number): void
toggleHeatmap(visible: boolean): void

// Isochrone
setIsochrone(enabled: boolean, time?: number, type?: string): void
setIsochroneTime(minutes: 15 | 30 | 45): void
setIsochroneType(type: 'driving' | 'transit' | 'walking'): void

// Property selection
selectProperty(id: string): void
deselectProperty(): void

// Map state
setMapLoaded(loaded: boolean): void
setMapError(error: Error | null): void

// Cache management
setCachedHeatmap(key: string, data: GeoJSON): void
getCachedHeatmap(key: string): GeoJSON | null
clearHeatmapCache(): void
setCachedIsochrone(key: string, data: GeoJSON): void
getCachedIsochrone(key: string): GeoJSON | null
clearIsochroneCache(): void
```

### Usage Examples

```typescript
// In component
const { visibleLayers, setLayerVisibility, heatmapType } = useMapStore()

// Toggle layer
setLayerVisibility('heatmapLayer', !visibleLayers['heatmapLayer'])

// Change heatmap type
const store = useMapStore()
store.setHeatmapType('demand')

// Select property
useMapStore.setState({ selectedPropertyId: 'prop-123' })
```

---

## 📊 Data Structures

### GeoJSON Features (Properties)

**Point Feature** (for markers):
```typescript
{
  "type": "Feature",
  "geometry": {
    "type": "Point",
    "coordinates": [-74.0, 40.7]  // [longitude, latitude]
  },
  "properties": {
    "id": "prop-123",
    "name": "Luxury Penthouse",
    "price": 2500000,
    "beds": 3,
    "baths": 2.5,
    "sqft": 5000,
    "demand": 8
  }
}
```

**Heatmap Feature** (for heatmap-density):
```typescript
{
  "type": "Feature",
  "geometry": {
    "type": "Point",
    "coordinates": [-74.0, 40.7]
  },
  "properties": {
    "value": 8.5  // Heat intensity 0-10
  }
}
```

**Isochrone Feature** (for zone visualization):
```typescript
{
  "type": "Feature",
  "geometry": {
    "type": "Polygon",
    "coordinates": [[
      [-74.0, 40.7],
      [-74.1, 40.7],
      [-74.1, 40.8],
      [-74.0, 40.8],
      [-74.0, 40.7]
    ]]
  },
  "properties": {
    "mode": "driving",
    "minutes": 30
  }
}
```

---

## 🎨 Map Layers Configuration

### Layer: "property-markers"

```typescript
{
  id: 'property-markers',
  type: 'circle',
  source: 'properties',
  paint: {
    'circle-radius': 8,
    'circle-color': '#0ea5e9',
    'circle-opacity': 0.8,
    'circle-stroke-width': 2,
    'circle-stroke-color': '#ffffff'
  },
  layout: {
    'visibility': 'visible'
  }
}
```

### Layer: "clusters"

```typescript
{
  id: 'clusters',
  type: 'circle',
  source: 'properties',
  filter: ['has', 'point_count'],
  paint: {
    'circle-color': [
      'step',
      ['get', 'point_count'],
      '#51bbd6',
      100, '#f1f075',
      750, '#f28cb1'
    ],
    'circle-radius': [
      'step',
      ['get', 'point_count'],
      20, 100, 30, 750, 40
    ]
  }
}
```

### Layer: "heatmap"

```typescript
{
  id: 'heatmap',
  type: 'heatmap',
  source: 'heatmap-source',
  paint: {
    'heatmap-weight': ['interpolate', ['linear'],
      ['get', 'value'],
      0, 0,
      10, 1
    ],
    'heatmap-intensity': ['interpolate', ['linear'],
      ['zoom'],
      0, 1,
      20, 3
    ],
    'heatmap-color': [
      'interpolate', ['linear'], ['heatmap-density'],
      0, 'rgba(33, 102, 172, 0)',
      0.2, 'rgb(103, 169, 207)',
      0.4, 'rgb(209, 229, 240)',
      0.6, 'rgb(253, 209, 23)',
      0.8, 'rgb(230, 174, 25)',
      1, 'rgb(189, 0, 38)'
    ],
    'heatmap-radius': ['interpolate', ['linear'],
      ['zoom'],
      0, 2,
      20, 20
    ],
    'heatmap-opacity': ['interpolate', ['linear'],
      ['zoom'],
      7, 1,
      20, 0.1
    ]
  }
}
```

### Layer: "isochrone"

```typescript
{
  id: 'isochrone',
  type: 'fill',
  source: 'isochrone-source',
  paint: {
    'fill-color': '#0ea5e9',
    'fill-opacity': 0.2
  }
}

{
  id: 'isochrone-outline',
  type: 'line',
  source: 'isochrone-source',
  paint: {
    'line-color': '#0ea5e9',
    'line-width': 2,
    'line-dasharray': [5, 5],
    'line-opacity': 0.8
  }
}
```

---

## 🔗 API Integration Points

### Heatmap Data API

**Endpoint**: `GET /api/heatmap/generate`

**Request**:
```typescript
{
  minLat: number
  maxLat: number
  minLon: number
  maxLon: number
  type: 'price' | 'demand' | 'density'
}
```

**Response**:
```typescript
{
  type: 'FeatureCollection',
  features: Array<{
    type: 'Feature',
    geometry: { type: 'Point', coordinates: [lon, lat] },
    properties: { value: 0-10 }
  }>
}
```

**Integration**:
```typescript
// In MapLibreMapFull.tsx
const generateHeatmapData = async (type: string) => {
  const heatmapData = await fetch('/api/heatmap/generate', {
    method: 'POST',
    body: JSON.stringify({
      minLat, maxLat, minLon, maxLon,
      type
    })
  }).then(r => r.json())
  
  // Mount on map
  map?.addSource('heatmap-source', {
    type: 'geojson',
    data: heatmapData
  })
}
```

### Isochrone Calculation API

**Endpoint**: `GET /api/isochrone/calculate`

**Request**:
```typescript
{
  latitude: number
  longitude: number
  maxTimeMinutes: 15 | 30 | 45
  mode: 'driving' | 'transit' | 'walking'
}
```

**Response**:
```typescript
{
  type: 'FeatureCollection',
  features: [{
    type: 'Feature',
    geometry: { type: 'Polygon', coordinates: [...] },
    properties: { mode: string, minutes: number }
  }]
}
```

---

## 🎯 Event Flow Diagram

```
User Action
    ↓
MapLibreMap Component
    ↓
Map Instance (MapLibre GL)
    ↓
Event Handler (onClick, etc.)
    ↓
mapStore.selectProperty()
    ↓
Store Update Triggers
    ↓
Components Re-render
    ↓
UI Updated
```

---

## ⚡ Performance Optimization Tips

### Marker Clustering
```typescript
// Enabled by default in MapLibreMap
// Reduces markers from 1000s to ~50 visible clusters
// Improves pan/zoom performance dramatically

// To tune:
clustering: {
  radius: 40,        // Smaller = more clusters
  maxZoom: 16        // Cluster up to zoom 16
}
```

### Layer Visibility
```typescript
// Only keep needed layers visible
// Use store.toggleLayer() to manage visibility
// Hidden layers don't render = better performance

// Check visibility before operations
if (visibleLayers.heatmapLayer) {
  // Add/update heatmap
}
```

### Source Deduplication
```typescript
// Create source once, reuse for multiple layers
const createSource = (id: string, data: GeoJSON) => {
  if (!map?.getSource(id)) {
    map?.addSource(id, { type: 'geojson', data })
  }
}

// Multiple layers can reference same source
addLayer({ id: 'layer1', source: 'shared-source' })
addLayer({ id: 'layer2', source: 'shared-source' })
```

### Zoom-Level Adjustments
```typescript
// Reduce opacity/intensity at high zoom to avoid overdraw
'heatmap-opacity': ['interpolate', ['linear'],
  ['zoom'],
  7, 1,      // Fully visible at zoom 7
  20, 0.1    // Nearly invisible at zoom 20
]
```

---

## 🧪 Testing Code Snippets

### Test: Map Initialization
```typescript
test('MapLibreProvider initializes map', async () => {
  render(
    <MapLibreProvider>
      <MapLibreMap properties={[]} />
    </MapLibreProvider>
  )
  
  await waitFor(() => {
    expect(screen.getByRole('navigation')).toBeInTheDocument()
  })
})
```

### Test: Layer Toggle
```typescript
test('Toggles heatmap layer visibility', () => {
  const { rerender } = render(<MapControls />)
  
  const checkbox = screen.getByRole('checkbox', { name: /heatmap/i })
  fireEvent.click(checkbox)
  
  expect(useMapStore.getState().visibleLayers.heatmapLayer).toBe(true)
})
```

### Test: Property Selection
```typescript
test('Selects property on marker click', async () => {
  render(
    <MapLibreProvider>
      <MapLibreMap properties={properties} />
    </MapLibreProvider>
  )
  
  const marker = await screen.findByTestId('marker-prop-123')
  fireEvent.click(marker)
  
  expect(useMapStore.getState().selectedPropertyId).toBe('prop-123')
})
```

---

## 🔍 Debugging Tips

### Enable MapLibre Debug Mode
```typescript
// In MapLibreProvider
const map = new MapLibre({
  container: containerRef.current,
  hash: true           // Show coordinates in URL
})

// View in console
map.showTileBoundaries = true
map.showCollisionBoxes = true
```

### Log GeoJSON Data
```typescript
const { map } = useMapLibre()

// Query features on layer
map?.on('click', 'property-markers', (e) => {
  console.log('Clicked features:', e.features)
})

// Get all features
const features = map?.querySourceFeatures('properties')
console.log('All properties:', features)
```

### Monitor State Changes
```typescript
// Subscribe to store changes
useMapStore.subscribe((state) => {
  console.log('Map store updated:', state)
})
```

---

## 📦 Bundle Size Impact

```
maplibre-gl:              ~450 KB (with styles)
@react-map-gl:           ~15 KB
supercluster:            ~8 KB
Total addition:          ~473 KB (gzipped: ~150 KB)

Current app size:        ~350 KB
New total:               ~500 KB (gzipped: ~180 KB)

Impact:                  +43% (manageable)
```

---

## ✅ TypeScript Type Definitions

```typescript
// src/types/map.ts

export interface MapProperty {
  id: string
  name: string
  latitude: number
  longitude: number
  price: number
  bedrooms: number
  bathrooms: number
  squareFeet: number
  imageUrl?: string
  type?: 'house' | 'apartment' | 'condo' | 'land'
  demand?: number
  density?: number
}

export interface MapCluster {
  id: string | number
  properties: MapProperty[]
  latitude: number
  longitude: number
  count: number
}

export interface MapBounds {
  north: number
  south: number
  east: number
  west: number
}

export type HeatmapType = 'price' | 'demand' | 'density'
export type IsochroneMode = 'driving' | 'transit' | 'walking'
export type MapTheme = 'light' | 'dark'

export interface MapEvent {
  type: 'propertySelected' | 'clusterSelected' | 'mapLoaded'
  data: unknown
}
```

---

**Last Updated**: 2024  
**Compatibility**: React 18+, TypeScript 5+, Next.js 14+

