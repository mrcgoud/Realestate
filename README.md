# RealEstate Platform - Production-Grade Marketplace & Geo-Intelligence System

A modern real estate marketplace platform combining map-first search, AI-powered insights, geospatial intelligence, and 3D property experiences.

## 🎯 Product Overview

- **Map-First Discovery**: Browse properties via interactive maps with spatial intelligence
- **Geospatial Core**: Flood risk, commute analysis, infrastructure overlays
- **3D/XR Experience**: Virtual tours, 360° views, BIM visualization
- **AI Intelligence**: Price prediction, locality scoring, investment recommendations
- **Broker-Optional**: Direct owner-to-buyer transactions with call masking
- **Real-Time Analytics**: Heatmaps, demand density, price trends

## 🏗️ System Architecture

### Layer 1: Geospatial Intelligence Engine (CORE USP)
- **Database**: PostgreSQL + PostGIS
- **Tile Server**: Martin (Rust)
- **Map Rendering**: MapLibre GL JS
- **Isochrone Engine**: OpenRouteService
- **Satellite Data**: ISRO Bhuvan, Sentinel-2 (ESA)
- **Risk Analytics**: GeoPandas, Shapely (Python)

### Layer 2: Digital Twin & XR
- **3D Rendering**: Three.js + React Three Fiber
- **BIM Viewer**: IFC.js
- **Virtual Tours**: Pannellum.js / Marzipano

### Layer 3: Frontend (Web + Mobile)
- **Web**: Next.js + Tailwind CSS + ShadCN UI
- **Mobile**: React Native (Expo) + MapLibre
- **State Management**: Zustand + Redux Toolkit

### Layer 4: Backend
- **Core**: NestJS (Node.js)
- **Microservices**: Python (Geo services)
- **API**: GraphQL + REST Hybrid
- **Auth**: JWT + OAuth + OTP

## 📁 Project Structure

```
realestate/
├── architecture/          # System design & diagrams
├── database/             # PostgreSQL schemas & migrations
├── backend/              # NestJS core + APIs
│   ├── src/
│   ├── geo-services/     # Python microservices
│   └── docker/
├── frontend/             # Next.js web app
├── mobile/               # React Native mobile
├── devops/               # Docker, K8s, CI/CD
├── docs/                 # API docs, deployment guides
└── tests/                # Integration tests
```

## 🚀 Quick Start

1. **Setup Backend**: `cd backend && npm install && docker-compose up`
2. **Setup Frontend**: `cd frontend && npm install && npm run dev`
3. **Setup Mobile**: `cd mobile && npm install && expo start`

## 📚 Documentation Index

- [System Architecture](./architecture/SYSTEM_DESIGN.md)
- [Database Schema](./database/SCHEMA.md)
- [API Design](./docs/API_DESIGN.md)
- [Deployment Guide](./devops/DEPLOYMENT.md)
- [Contributing Guide](./CONTRIBUTING.md)

## 🔑 Key Technologies

| Layer | Stack |
|-------|-------|
| **Geospatial** | PostgreSQL/PostGIS, Martin, MapLibre |
| **3D/XR** | Three.js, IFC.js, Pannellum.js |
| **Frontend** | Next.js, Tailwind, ShadCN |
| **Mobile** | React Native, Expo |
| **Backend** | NestJS, Python (Geo) |
| **DevOps** | Docker, Kubernetes, GitHub Actions |
| **Hosting** | AWS/GCP self-hosted tiles |

## 💡 Core Features

### Search & Discovery
- [x] Map-based property search
- [x] Polygon/drawing search tools
- [x] Commute-time search (isochrones)
- [x] Price heatmaps
- [x] Demand density visualization
- [x] Filter toggles (flood, schools, hospitals, metro)

### Property Management
- [x] Add/Edit/Delete listings
- [x] Image & video uploads
- [x] 360° tour uploads
- [x] 3D model uploads (BIM)
- [x] AI-powered descriptions

### AI & Analytics
- [x] Price prediction models
- [x] Locality intelligence scoring
- [x] Fraud detection system
- [x] Smart recommendations
- [x] Investment hotspot detection

### User Features
- [x] Signup/Login (OTP + OAuth)
- [x] Profile management
- [x] Saved properties
- [x] Property comparison
- [x] Alerts & notifications
- [x] In-app messaging
- [x] Visit scheduling

## 📊 Scalability Targets

- **1M+ concurrent users**
- **100K+ active listings**
- **Real-time map rendering**
- **<200ms geo query latency**

## 🔐 Security

- KYC verification
- JWT + OAuth authentication
- Listing moderation
- Fraud detection
- Role-based access control
- Call masking (privacy-first)

## 📜 License

MIT License - See LICENSE file

## 👥 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for contribution guidelines.

---

**Built with ❤️ for the real estate community | Open-source first**
