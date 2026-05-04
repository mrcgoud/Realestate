# Frontend - RealEstate Pro

A modern, full-featured real estate platform built with **Next.js 14**, **React 18**, and **TypeScript**.

## Overview

The frontend provides an intuitive interface for exploring properties with advanced geospatial intelligence, AI-powered price predictions, and immersive 3D tours.

### Key Features

- **Interactive Property Search** - Multi-filter search with real-time results
- **Geospatial Visualization** - MapLibre GL integration for property mapping
- **Price Intelligence** - AI-powered predictions for property valuations
- **3D Virtual Tours** - Immersive property viewing with Three.js
- **Amenity Explorer** - Walkability scores and nearby infrastructure
- **Commute Analysis** - Isochrone-based commute time visualization
- **Favorites Management** - Bookmark and compare properties
- **Responsive Design** - Mobile-first with Tailwind CSS

## Technologies

### Core Framework
- **Next.js 14** - React meta-framework with App Router
- **React 18** - UI component library
- **TypeScript** - Type-safe development

### API & State Management
- **Apollo Client 3** - GraphQL client with caching
- **Axios** - REST API client
- **Zustand 4** - Lightweight state management
- **React Query 5** - Server-state management

### Maps & Visualization
- **MapLibre GL JS 3** - Open-source map library
- **Three.js** - 3D visualization
- **React Three Fiber** - React renderer for Three.js

### UI & Styling
- **Tailwind CSS 3** - Utility-first CSS
- **Headless UI** - Accessible component primitives
- **Lucide Icons** - Beautiful icon library
- **Next.js Image** - Optimized image component

### Developer Tools
- **TypeScript** - Static type checking
- **ESLint** - Code linting
- **Prettier** - Code formatting

## Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── layout.tsx          # Root layout with providers
│   │   ├── page.tsx            # Home page
│   │   ├── (auth)/             # Auth layout group
│   │   ├── (app)/              # App layout group
│   │   └── api/                # API routes
│   ├── components/
│   │   ├── common/             # Reusable components
│   │   │   ├── PropertyCard.tsx
│   │   │   ├── Header.tsx
│   │   │   └── Footer.tsx
│   │   ├── sections/           # Page sections
│   │   │   ├── HeroSection.tsx
│   │   │   ├── FeaturedProperties.tsx
│   │   │   └── FeaturesSection.tsx
│   │   ├── forms/              # Form components
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   └── PropertyFilterForm.tsx
│   │   ├── maps/               # Map components
│   │   │   ├── PropertyMap.tsx
│   │   │   ├── HeatmapLayer.tsx
│   │   │   └── IsochroneLayer.tsx
│   │   ├── shared/             # Shared UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Select.tsx
│   │   │   └── Input.tsx
│   │   └── providers/          # React context providers
│   │       ├── ApolloWrapper.tsx
│   │       └── ToastProvider.tsx
│   ├── lib/
│   │   ├── utils.ts            # Utility functions
│   │   ├── api-client.ts       # REST API client
│   │   └── apollo-client.ts    # GraphQL client setup
│   ├── store/                  # Zustand stores
│   │   ├── authStore.ts        # Auth state
│   │   ├── searchStore.ts      # Search state
│   │   ├── mapStore.ts         # Map state
│   │   └── propertyStore.ts    # Property state
│   ├── types/
│   │   └── index.ts            # TypeScript type definitions
│   ├── styles/
│   │   └── globals.css         # Global styles & Tailwind
│   └── hooks/                  # Custom React hooks
├── public/                     # Static assets
├── .env.example                # Environment variables template
├── next.config.js              # Next.js configuration
├── tsconfig.json               # TypeScript configuration
├── tailwind.config.ts          # Tailwind CSS configuration
├── postcss.config.js           # PostCSS configuration
└── package.json                # Dependencies
## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn package manager

### Installation

1. **Install dependencies**
```bash
cd frontend
npm install
```

2. **Configure environment variables**
```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:
```env
# API Endpoints
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:3001/graphql
NEXT_PUBLIC_GEO_API_URL=http://localhost:8000

# Map Services
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token
NEXT_PUBLIC_OPENROUTE_KEY=your_openroute_key

# Feature Flags
NEXT_PUBLIC_ENABLE_3D_TOURS=true
NEXT_PUBLIC_ENABLE_AI_STAGING=true
NEXT_PUBLIC_ENABLE_ML_PREDICTIONS=true

# Analytics
NEXT_PUBLIC_GA_ID=your_ga_id
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
```

### Development

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

### Build

```bash
npm run build
```

### Production

```bash
npm run start
```

## API Integration

### REST API (via Axios)

The `apiClient` provides a comprehensive REST API interface:

```typescript
import { apiClient } from '@/lib/api-client'

// Authentication
await apiClient.login(email, password)
await apiClient.register(email, password, firstName, lastName)
await apiClient.logout()

// Properties
const properties = await apiClient.getProperties({ minPrice: 100000 }, 1, 20)
const property = await apiClient.getPropertyById('property-id')

// Geospatial
const isochrone = await apiClient.calculateIsochrone(40.7128, -74.006, 30, 'driving')
const heatmap = await apiClient.generateHeatmap(40.7, 40.73, -74.01, -73.99, 'price')
const infrastructure = await apiClient.getNearbyInfrastructure(40.7128, -74.006)
const walkability = await apiClient.getWalkabilityScore(40.7128, -74.006)

// Analytics
const prediction = await apiClient.predictPrice(40.7128, -74.006, 2, 2, 1200)
const locality = await apiClient.scoreLocality(40.7128, -74.006)
```

### GraphQL API (via Apollo Client)

Apollo Client is configured with automatic auth token injection and caching:

```typescript
import { useQuery } from '@apollo/client'
import { GET_PROPERTIES } from '@/queries/properties'

function MyComponent() {
  const { data, loading, error } = useQuery(GET_PROPERTIES, {
    variables: { filter: { minPrice: 100000 } }
  })
}
```

## State Management

### Authentication Store (Zustand)

```typescript
import { useAuthStore } from '@/store/authStore'

function MyComponent() {
  const { user, token, login, logout } = useAuthStore()
  
  await login(email, password)
  await logout()
}
```

### Search Store (Zustand)

```typescript
import { useSearchStore } from '@/store/searchStore'

function SearchComponent() {
  const { query, filters, results, search, setFilters } = useSearchStore()
  
  setFilters({ minPrice: 100000, maxPrice: 500000 })
  await search()
}
```

### Map Store (Zustand)

```typescript
import { useMapStore } from '@/store/mapStore'

function MapComponent() {
  const { viewport, setViewport, toggleHeatmap, setIsochrone } = useMapStore()
  
  setViewport({ latitude: 40.7128, longitude: -74.006, zoom: 12 })
  toggleHeatmap()
}
```

### Property Store (Zustand)

```typescript
import { usePropertyStore } from '@/store/propertyStore'

function PropertyComponent() {
  const { currentProperty, isFavorite, addFavorite, fetchProperty } = usePropertyStore()
  
  await fetchProperty('property-id')
  await addFavorite('property-id')
}
```

## Components

### PropertyCard

Displays a property with all key information:
```typescript
<PropertyCard property={property} onFavoriteChange={handleFavorite} />
```

### HeroSection

Landing page hero with CTA:
```typescript
<HeroSection />
```

### FeaturedProperties

Grid of featured properties from backend:
```typescript
<FeaturedProperties />
```

## Utility Functions

The `lib/utils.ts` file provides helpful utilities:

```typescript
import {
  formatCurrency,
  formatArea,
  calculatePriceSqft,
  formatAddress,
  calculateZoomLevel,
  debounce,
  throttle,
  validateEmail,
  getInitials
} from '@/lib/utils'

// Examples
formatCurrency(450000, 'USD') // "$450,000"
formatArea(1200) // "1,200 sqft"
calculatePriceSqft(450000, 1200) // 375
```

## Styling

### Tailwind CSS Classes

Global component classes are defined in `styles/globals.css`:

```css
.btn-primary        /* Primary button */
.btn-outline        /* Outline button */
.card               /* Card component */
.card-header        /* Card header */
.container          /* Max-width container */
.h1, .h2, .h3       /* Heading styles */
```

### Custom Configuration

Colors and themes are customized in `tailwind.config.ts`:
- Primary: Sky Blue (0ea5e9 - 0369a1)
- Secondary: Purple (8b5cf6 - 6d28d9)
- Custom components for buttons, cards, typography

## Type Definitions

All TypeScript types are centralized in `types/index.ts`:

```typescript
interface Property { /* ... */ }
interface PropertyFilter { /* ... */ }
interface IsochroneResponse { /* ... */ }
interface HeatmapData { /* ... */ }
interface PricePredictionResponse { /* ... */ }
// ... and many more
```

## Error Handling

The ToastProvider handles user notifications:

```typescript
import { useToast } from '@/components/providers/ToastProvider'

function MyComponent() {
  const { addToast } = useToast()
  
  try {
    await apiClient.login(email, password)
    addToast('Login successful!', 'success')
  } catch (error) {
    addToast('Login failed', 'error')
  }
}
```

## Performance Optimization

- **Image Optimization** - Next.js Image component with responsive sizing
- **Code Splitting** - Automatic per-route code splitting
- **CSS-in-JS** - Tailwind for minimal CSS
- **API Caching** - Apollo Client cache and localStorage
- **Lazy Loading** - Suspense boundaries for async components

## Security

- **CORS** - Configured in backend
- **Auth Headers** - Automatic Bearer token injection
- **HTTPS** - Production only
- **Environment Variables** - Sensitive data in .env.local
- **CSP** - Content Security Policy headers

## Deployment

### Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

### Docker

```bash
docker build -t realestate-frontend .
docker run -p 3000:3000 realestate-frontend
```

### Manual

```bash
npm run build
npm run start
```

## NextJS App Router Structure

### Layout Groups

The app uses layout groups for organized routing:

```
app/
├── (auth)/           # Auth pages (login, register)
├── (app)/            # Protected app pages
├── layout.tsx        # Root layout
└── page.tsx          # Home page
```

## Contributing

1. Create feature branch: `git checkout -b feature/name`
2. Make changes and test
3. Commit: `git commit -m 'Add feature'`
4. Push: `git push origin feature/name`
5. Create Pull Request

## Troubleshooting

### Port 3000 already in use
```bash
# Linux/Mac
lsof -ti:3000 | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Build errors
```bash
npm run clean    # Clear cache
npm install      # Reinstall dependencies
npm run build    # Rebuild
```

### API connection issues
- Check `.env.local` for correct API URLs
- Ensure backend is running
- Check CORS settings in backend

## Monitoring & Analytics

- **Sentry** - Error tracking (configurable)
- **Google Analytics** - Usage analytics (configurable)
- **Performance** - Core Web Vitals tracking

## License

MIT - See LICENSE file

## Support

For issues and questions:
- GitHub Issues: https://github.com/yourusername/realestate/issues
- Email: support@realestate-pro.com
- Documentation: https://docs.realestate-pro.com
