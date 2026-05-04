# Technology Stack & Quick Start Guide

## Complete Technology Stack

### Frontend (Web)
| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | Next.js 14 | React meta-framework with SSR |
| **Styling** | Tailwind CSS + ShadCN UI | Utility-first CSS & component library |
| **State** | Zustand | Lightweight state management |
| **Maps** | MapLibre GL JS | Open-source map rendering |
| **3D Graphics** | Three.js + React Three Fiber | 3D model visualization |
| **API Client** | Apollo Client + GraphQL Request | GraphQL queries |
| **UI Components** | Radix UI | Accessible component primitives |
| **Charts** | Recharts | React charting library |
| **Form Handling** | React Hook Form + Zod | Type-safe forms |

### Frontend (Mobile)
| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | React Native + Expo | Cross-platform mobile |
| **Maps** | MapLibre GL Native | Mobile map rendering |
| **Navigation** | Expo Router | File-based routing |
| **State** | Zustand | State management |
| **API** | GraphQL + REST | Backend communication |

### Backend
| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | NestJS | TypeScript Node.js framework |
| **API** | GraphQL + REST | Dual API layer |
| **Database** | PostgreSQL + PostGIS | Relational + geospatial DB |
| **ORM** | TypeORM | TypeScript ORM |
| **Auth** | JWT + Passport.js | Authentication |
| **Caching** | Redis | Session & cache store |
| **Jobs** | Bull + Redis | Background jobs |
| **WebSocket** | Socket.io | Real-time communication |
| **File Upload** | AWS S3 | Cloud storage |
| **Search** | Elasticsearch | Full-text search |
| **Validation** | Class Validator | DTO validation |

### Geospatial Services (Python)
| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | FastAPI | Async Python API |
| **Geospatial** | GeoPandas + Shapely | Spatial operations |
| **Database** | SQLAlchemy + GeoAlchemy | Database ORM |
| **ML** | XGBoost + Scikit-learn | Machine learning models |
| **Isochrones** | OpenRouteService | Commute time calculation |
| **Caching** | Redis | API response caching |
| **Tasks** | Celery | Async task queue |

### Map Infrastructure
| Technology | Purpose |
|-----------|---------|
| **Tile Server** | Martin (Rust) | Vector tile serving |
| **Basemap** | OpenStreetMap + CARTO | Base layer |
| **Satellite** | ISRO Bhuvan API + Sentinel-2 | Satellite imagery |
| **CDN** | CloudFront / Cloudflare | Tile caching & distribution |

### DevOps & Infrastructure
| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Containerization** | Docker | Container images |
| **Orchestration** | Kubernetes | Container orchestration |
| **CI/CD** | GitHub Actions | Automated pipelines |
| **Cloud** | AWS / GCP | Infrastructure provider |
| **Monitoring** | Prometheus + Grafana | Metrics & dashboards |
| **Logging** | ELK Stack / Datadog | Log aggregation |
| **Secrets** | AWS Secrets Manager | Credential management |

### Databases & Services
| Service | Technology | Purpose |
|---------|-----------|---------|
| **Relational DB** | PostgreSQL 16 | Primary data store |
| **Spatial Extension** | PostGIS 3.4 | Geospatial queries |
| **Cache** | Redis 7 | Session & caching |
| **Search** | Elasticsearch 8 | Full-text search |
| **Time-Series** | TimescaleDB | Analytics data |

---

## Quick Start Guide

### Prerequisites

```bash
# System Requirements
- Node.js 20+
- Python 3.11+
- Docker & Docker Compose
- PostgreSQL 16 with PostGIS
- Redis 7
- Git

# Install Node.js
https://nodejs.org/

# Install Docker
https://www.docker.com/products/docker-desktop

# Install Python (via Homebrew or direct download)
brew install python@3.11
```

### 1. Local Development Setup (5-10 minutes)

```bash
# Clone repository
git clone https://github.com/yourorg/realestate.git
cd realestate

# Start all services with Docker Compose
docker-compose up -d

# Verify services are running
docker-compose ps

# Should see:
# postgres   ✓ running
# redis      ✓ running
# elasticsearch ✓ running
# backend    ✓ running
# geo-services ✓ running
# frontend   ✓ running
# tile-server ✓ running
# nginx      ✓ running
```

### 2. Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Update .env.local
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_GRAPHQL_ENDPOINT=http://localhost:3000/graphql

# Start dev server
npm run dev

# Visit http://localhost:3001
```

### 3. Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Run database migrations
npm run migration:run

# Seed initial data (optional)
npm run seed

# Start development server
npm run start:dev

# GraphQL Playground: http://localhost:3000/graphql
```

### 4. Geospatial Services

```bash
# Navigate to geo services
cd backend/geo-services

# Install Python dependencies
pip install -r requirements.txt

# Start FastAPI server
python main.py

# Docs at http://localhost:8001/docs
```

### 5. Mobile Development

```bash
# Navigate to mobile
cd mobile

# Install dependencies
npm install

# Start Expo
npx expo start

# Scan QR code with Expo Go app
# Or press 'i' for iOS simulator / 'a' for Android emulator
```

### 6. Verify Full Stack

```bash
# Test API
curl http://localhost:3000/health

# Test GraphQL
curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ me { id email } }"}'

# Test Frontend
open http://localhost:3001

# Test Tile Server
curl http://localhost:8080/data/properties/0/0/0.pbf

# Test Geo Services
curl http://localhost:8001/docs
```

---

## Project Structure Overview

```
realestate/
│
├── 📄 README.md                    # Main documentation
├── 📄 CONTRIBUTING.md              # Contribution guidelines
├── 📄 LICENSE                      # MIT License
│
├── 📁 architecture/                 # System design
│   └── SYSTEM_DESIGN.md             # Architecture document
│
├── 📁 database/                     # Database schemas
│   ├── SCHEMA.md                    # Complete schema
│   └── migrations/                  # Migration files
│
├── 📁 docs/                         # Documentation
│   ├── API_DESIGN.md                # GraphQL + REST APIs
│   └── SAMPLE_CODE.md               # Implementation examples
│
├── 📁 backend/                      # NestJS Backend
│   ├── src/
│   │   ├── main.ts
│   │   ├── app.module.ts
│   │   ├── auth/                   # Authentication
│   │   ├── users/                  # User management
│   │   ├── properties/             # Property management
│   │   ├── search/                 # Search functionality
│   │   ├── geospatial/             # Geo queries
│   │   ├── ai/                     # ML models
│   │   ├── messaging/              # WebSocket chat
│   │   ├── upload/                 # File uploads
│   │   └── analytics/              # Analytics
│   ├── geo-services/               # Python geospatial microservice
│   │   ├── main.py
│   │   ├── app/
│   │   │   ├── routers/
│   │   │   ├── services/
│   │   │   ├── ml/
│   │   │   └── utils/
│   │   └── requirements.txt
│   ├── Dockerfile
│   ├── package.json
│   └── README.md
│
├── 📁 frontend/                     # Next.js Web App
│   ├── app/
│   │   ├── (auth)/
│   │   ├── search/
│   │   ├── property/[id]/
│   │   ├── dashboard/
│   │   └── admin/
│   ├── components/
│   │   ├── Map/
│   │   ├── Property/
│   │   ├── 3D/
│   │   ├── Search/
│   │   ├── Chat/
│   │   └── Common/
│   ├── hooks/
│   ├── lib/
│   ├── store/
│   ├── types/
│   ├── styles/
│   ├── Dockerfile
│   ├── package.json
│   ├── next.config.js
│   └── README.md
│
├── 📁 mobile/                       # React Native Mobile
│   ├── app/
│   ├── components/
│   ├── hooks/
│   ├── store/
│   ├── types/
│   ├── app.json
│   ├── eas.json
│   ├── package.json
│   └── README.md
│
├── 📁 devops/                       # Infrastructure & Deployment
│   ├── docker/
│   │   ├── backend.dockerfile
│   │   ├── frontend.dockerfile
│   │   ├── geo-services.dockerfile
│   │   └── tile-server.dockerfile
│   ├── k8s/                        # Kubernetes manifests
│   │   ├── backend/
│   │   ├── frontend/
│   │   ├── postgres/
│   │   ├── redis/
│   │   └── ingress.yaml
│   ├── nginx/                      # Nginx config
│   ├── monitoring/                 # Prometheus/Grafana
│   ├── ci-cd/                      # GitHub Actions
│   │   └── .github/workflows/
│   ├── docker-compose.yml          # Local dev
│   ├── docker-compose.prod.yml     # Production-like
│   ├── README.md                   # DevOps guide
│   └── DEPLOYMENT.md               # Deployment steps
│
└── 📁 tests/                        # Integration tests
    ├── e2e/
    ├── api/
    └── performance/
```

---

## Common Commands

### Development

```bash
# Start all services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Rebuild images
docker-compose up --build

# Run database migrations
docker exec realestate-backend npm run migration:run
```

### Frontend

```bash
npm run dev          # Start dev server
npm run build        # Build production
npm run start        # Start production server
npm run test         # Run tests
npm run lint         # Lint code
npm run format       # Format code
```

### Backend

```bash
npm run start        # Start server
npm run start:dev    # Dev with hot reload
npm run build        # Build TypeScript
npm run test         # Run tests
npm run migration:create -- MigrationName  # Create migration
npm run migration:run # Run migrations
```

### Mobile

```bash
npx expo start       # Start Expo dev server
npx expo prebuild    # Generate native directories
npm run ios          # Run on iOS simulator
npm run android      # Run on Android emulator
eas build            # Build for distribution
```

### Deployment

```bash
# Docker
docker build -t realestate-backend ./backend
docker run -p 3000:3000 realestate-backend

# Kubernetes
kubectl apply -f devops/k8s/
kubectl get deployments -n realestate
kubectl logs -f deployment/backend -n realestate

# Deploy updates
kubectl set image deployment/backend backend=realestate-backend:v1.1.0
```

---

## Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

### Code Style

```bash
# Format code
npm run format

# Lint code
npm run lint

# Run tests
npm run test
```

### Git Hooks

```bash
# Husky pre-commit hooks are configured
# Runs: lint, format, test
```

---

## Troubleshooting

### Port Already in Use

```bash
# Find process using port
lsof -i :3000

# Kill process
kill -9 <PID>
```

### Database Connection Issues

```bash
# Test connection
psql -h localhost -U realestate -d realestate_db

# Check PostGIS
psql -c "SELECT PostGIS_Version();"
```

### Docker Issues

```bash
# Clean up Docker
docker system prune -a

# Rebuild without cache
docker-compose build --no-cache

# Check logs
docker-compose logs <service>
```

### Redis Issues

```bash
# Connect to Redis
redis-cli

# Check keys
KEYS *

# Flush cache (development only)
FLUSHDB
```

---

## Performance Tips

1. **Frontend**
   - Enable image lazy loading
   - Code split dynamic routes
   - Minimize bundle size
   - Use proper caching headers

2. **Backend**
   - Use DataLoader for GraphQL
   - Implement Redis caching
   - Optimize database queries
   - Use connection pooling

3. **Database**
   - Add proper indexes
   - Vacuum regularly
   - Use EXPLAIN ANALYZE
   - Partition large tables

4. **Maps**
   - Cache tiles with CDN
   - Use vector tiles (not raster)
   - Lazy load layers
   - Minimize API calls

---

## Security Checklist

- [x] HTTPS/TLS for all endpoints
- [x] JWT token validation
- [x] Rate limiting on APIs
- [x] Input validation & sanitization
- [x] SQL injection prevention (parameterized queries)
- [x] CORS configuration
- [x] Secrets in environment variables
- [x] Database encryption at rest
- [x] API authentication & authorization
- [x] File upload restrictions

---

## Monitoring & Observability

### Available Dashboards

- **Grafana**: http://localhost:3000 (admin/prom-operator)
- **Prometheus**: http://localhost:9090
- **Elasticsearch**: http://localhost:9200
- **GraphQL Playground**: http://localhost:3000/graphql

### Key Metrics

- API response time
- Database query performance
- Cache hit rate
- Error rate
- Active users
- Property data feed rate

---

## Support & Resources

- **Documentation**: See `docs/` directory
- **API Reference**: http://localhost:3000/graphql
- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions
- **Email**: support@realestate.com

---

## License

MIT License - See LICENSE file for details

---

## Next Steps

1. ✅ Set up local development environment
2. ✅ Review architecture and design documents
3. ✅ Read API documentation
4. ✅ Check sample code implementations
5. 📝 Start implementing features
6. 📝 Write tests
7. 📝 Deploy to staging
8. 📝 Production deployment

**Happy coding! 🚀**
