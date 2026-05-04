# Environment Setup Files & Configuration

## Sample Environment Files

### Backend .env.example

```env
# ===== SERVER CONFIGURATION =====
NODE_ENV=development
PORT=3000
LOG_LEVEL=debug
CORS_ORIGIN=http://localhost:3001

# ===== DATABASE =====
DATABASE_URL=postgresql://realestate:dev_password@localhost:5432/realestate_db
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=realestate
DATABASE_PASSWORD=dev_password
DATABASE_NAME=realestate_db
DB_SYNC=false
DB_LOGGING=true

# ===== REDIS =====
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# ===== JWT AUTHENTICATION =====
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRATION=24h
JWT_REFRESH_SECRET=your_super_secret_refresh_key
JWT_REFRESH_EXPIRATION=7d

# ===== OAUTH PROVIDERS =====
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback

FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret

# ===== AWS S3 =====
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
S3_BUCKET_NAME=realestate-properties-dev
S3_BUCKET_URL=https://realestate-properties-dev.s3.amazonaws.com
AWS_CLOUDFRONT_DOMAIN=d123456.cloudfront.net

# ===== ELASTICSEARCH =====
ELASTICSEARCH_NODES=http://localhost:9200
ELASTICSEARCH_USERNAME=elastic
ELASTICSEARCH_PASSWORD=changeme

# ===== EXTERNAL SERVICES =====
GEO_SERVICE_URL=http://localhost:8001
OPENROUTE_API_KEY=your_openroute_api_key
ISRO_BHUVAN_KEY=your_isro_key
MAPLIBRE_STYLE_URL=https://tiles.openstreetmap.de/styles/osm-bright/style.json

# ===== EMAIL SERVICE =====
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=noreply@realestate.com
SENDGRID_FROM_NAME=RealEstate Platform

# ===== SMS SERVICE =====
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# ===== GRAPHQL =====
GRAPHQL_PLAYGROUND=true
GRAPHQL_DEBUG=true
GRAPHQL_SCHEMA_OUTPUT=./schema.graphql

# ===== MONITORING =====
SENTRY_DSN=your_sentry_dsn
DATADOG_API_KEY=your_datadog_key
DATADOG_APP_KEY=your_datadog_app_key

# ===== FEATURE FLAGS =====
FEATURE_3D_TOURS=true
FEATURE_AI_DESCRIPTIONS=true
FEATURE_INVESTMENT_TOOL=true
FEATURE_PRICE_PREDICTION=true
```

### Frontend .env.example

```env
# ===== API ENDPOINTS =====
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_GRAPHQL_ENDPOINT=http://localhost:3000/graphql
NEXT_PUBLIC_REST_API_URL=http://localhost:3000/api/v1

# ===== MAPS =====
NEXT_PUBLIC_MAPLIBRE_STYLE=https://tiles.openstreetmap.de/styles/osm-bright/style.json
NEXT_PUBLIC_MAPLIBRE_API_KEY=your_maplibre_key
NEXT_PUBLIC_TILE_SERVER_URL=http://localhost:8080

# ===== AUTHENTICATION =====
NEXT_PUBLIC_AUTH_DOMAIN=localhost:3001
NEXT_PUBLIC_AUTH_CLIENT_ID=your_auth_client_id
NEXT_PUBLIC_AUTH_CALLBACK_URL=http://localhost:3001/auth/callback

# ===== GOOGLE =====
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com

# ===== ANALYTICS =====
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
NEXT_PUBLIC_GA_ID=your_google_analytics_id

# ===== FEATURE FLAGS =====
NEXT_PUBLIC_FEATURE_3D_TOURS=true
NEXT_PUBLIC_FEATURE_INVESTMENT_TOOL=true
NEXT_PUBLIC_DEBUG_MODE=true

# ===== BUILD =====
NEXT_PUBLIC_APP_VERSION=0.1.0
NEXT_PUBLIC_BUILD_TIME=
```

### Mobile .env.example

```env
# ===== API =====
EXPO_PUBLIC_API_URL=http://192.168.1.100:3000
EXPO_PUBLIC_GRAPHQL_URL=http://192.168.1.100:3000/graphql

# ===== MAPS =====
EXPO_PUBLIC_MAPLIBRE_STYLE=https://tiles.openstreetmap.de/styles/osm-bright/style.json
EXPO_PUBLIC_TILE_SERVER_URL=http://192.168.1.100:8080

# ===== GOOGLE PLAY SERVICES =====
GMS_API_KEY=your_gms_api_key

# ===== IOS CONFIGURATION =====
IOS_PROJECT_ID=your_ios_project_id

# ===== FEATURE FLAGS =====
EXPO_PUBLIC_FEATURE_3D=true
EXPO_PUBLIC_FEATURE_AR=false
EXPO_PUBLIC_FEATURE_CHAT=true
```

### Python Geospatial Services .env.example

```env
# ===== API SERVER =====
SERVICE_HOST=0.0.0.0
SERVICE_PORT=8001
LOG_LEVEL=info
DEBUG=false

# ===== DATABASE =====
DATABASE_URL=postgresql://realestate:dev_password@localhost:5432/realestate_db
DB_POOL_SIZE=5
DB_ECHO=false

# ===== REDIS =====
REDIS_URL=redis://localhost:6379/0
CACHE_TTL=3600

# ===== EXTERNAL APIS =====
OPENROUTE_API_KEY=your_openroute_key
OPENROUTE_BASE_URL=https://api.openrouteservice.org

ISRO_BHUVAN_KEY=your_isro_key
SENTINEL_HUB_CLIENT_ID=your_sentinel_client_id
SENTINEL_HUB_CLIENT_SECRET=your_sentinel_secret

# ===== ML MODELS =====
MODEL_PATH=./models
PRICE_MODEL_VERSION=1.0
CONFIDENCE_THRESHOLD=0.7

# ===== CELERY (Background Tasks) =====
CELERY_BROKER_URL=redis://localhost:6379/1
CELERY_RESULT_BACKEND=redis://localhost:6379/2

# ===== MONITORING =====
SENTRY_DSN=your_sentry_dsn
```

---

## Complete docker-compose.yml

```yaml
version: '3.9'

services:
  # ===== DATABASES =====

  postgres:
    image: postgis/postgis:16-3.4-alpine
    container_name: realestate-postgres
    environment:
      POSTGRES_USER: realestate
      POSTGRES_PASSWORD: dev_password
      POSTGRES_DB: realestate_db
      POSTGRES_INITDB_ARGS: -c shared_preload_libraries=pg_stat_statements
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./devops/sql/init.sql:/docker-entrypoint-initdb.d/01-init.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U realestate"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - realestate_network

  redis:
    image: redis:7-alpine
    container_name: realestate-redis
    command: redis-server --appendonly yes --requirepass ""
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - realestate_network

  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.11.0
    container_name: realestate-elasticsearch
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
      - xpack.security.authc.api_key.enabled=false
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    ports:
      - "9200:9200"
    volumes:
      - elasticsearch_data:/usr/share/elasticsearch/data
    healthcheck:
      test: ["CMD-SHELL", "curl -f http://localhost:9200/_cluster/health || exit 1"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - realestate_network

  # ===== BACKEND SERVICES =====

  backend:
    build:
      context: ./backend
      dockerfile: ../devops/docker/backend.dockerfile
    container_name: realestate-backend
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: development
      DATABASE_URL: postgresql://realestate:dev_password@postgres:5432/realestate_db
      REDIS_URL: redis://redis:6379
      ELASTICSEARCH_NODES: http://elasticsearch:9200
      GEO_SERVICE_URL: http://geo-services:8001
      LOG_LEVEL: debug
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
      elasticsearch:
        condition: service_healthy
    volumes:
      - ./backend:/app
      - /app/node_modules
    networks:
      - realestate_network

  geo-services:
    build:
      context: ./backend/geo-services
      dockerfile: ../../devops/docker/geo-services.dockerfile
    container_name: realestate-geo-services
    ports:
      - "8001:8001"
    environment:
      SERVICE_PORT: 8001
      DATABASE_URL: postgresql://realestate:dev_password@postgres:5432/realestate_db
      REDIS_URL: redis://redis:6379/0
      LOG_LEVEL: debug
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    volumes:
      - ./backend/geo-services:/app
    networks:
      - realestate_network

  tile-server:
    image: maptiler/martin:latest
    container_name: realestate-tile-server
    ports:
      - "8080:8080"
    environment:
      DATABASE_URL: postgresql://realestate:dev_password@postgres:5432/realestate_db
      WATCH_MODE: "true"
    depends_on:
      postgres:
        condition: service_healthy
    volumes:
      - ./devops/tile-server-config.toml:/etc/martin/config.toml:ro
    networks:
      - realestate_network

  # ===== FRONTEND SERVICES =====

  frontend:
    build:
      context: ./frontend
      dockerfile: ../devops/docker/frontend.dockerfile
    container_name: realestate-frontend
    ports:
      - "3001:3000"
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:3000
      NEXT_PUBLIC_GRAPHQL_ENDPOINT: http://localhost:3000/graphql
      NEXT_PUBLIC_TILE_SERVER_URL: http://localhost:8080
    depends_on:
      - backend
    volumes:
      - ./frontend:/app
      - /app/node_modules
    networks:
      - realestate_network

  # ===== REVERSE PROXY =====

  nginx:
    image: nginx:alpine
    container_name: realestate-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./devops/nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./devops/nginx/conf.d:/etc/nginx/conf.d:ro
      - ./devops/nginx/ssl:/etc/nginx/ssl:ro
    depends_on:
      - frontend
      - backend
      - geo-services
      - tile-server
    networks:
      - realestate_network

  # ===== MONITORING =====

  prometheus:
    image: prom/prometheus:latest
    container_name: realestate-prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./devops/monitoring/prometheus.yml:/etc/prometheus/prometheus.yml:ro
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
    networks:
      - realestate_network

  grafana:
    image: grafana/grafana:latest
    container_name: realestate-grafana
    ports:
      - "3010:3000"
    environment:
      GF_SECURITY_ADMIN_PASSWORD: admin
      GF_INSTALL_PLUGINS: grafana-piechart-panel
    volumes:
      - grafana_data:/var/lib/grafana
      - ./devops/monitoring/grafana-dashboard.json:/etc/grafana/provisioning/dashboards/main.json
    depends_on:
      - prometheus
    networks:
      - realestate_network

volumes:
  postgres_data:
    driver: local
  redis_data:
    driver: local
  elasticsearch_data:
    driver: local
  prometheus_data:
    driver: local
  grafana_data:
    driver: local

networks:
  realestate_network:
    driver: bridge
```

---

## Pre-Deployment Checklist

```markdown
# Pre-Deployment Checklist

## Code Quality
- [ ] All tests passing (`npm run test`)
- [ ] Code formatted (`npm run format`)
- [ ] Linting passed (`npm run lint`)
- [ ] TypeScript compiling (`npm run build`)
- [ ] No console.log() in production code
- [ ] Environment variables documented

## Database
- [ ] All migrations created and tested
- [ ] Database backups configured
- [ ] Connection pool configured
- [ ] Indexes created
- [ ] Foreign keys validated
- [ ] Vacuum & analyze jobs scheduled

## Security
- [ ] All secrets in environment variables
- [ ] HTTPS/TLS configured
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Input validation implemented
- [ ] SQL injection prevention verified
- [ ] Authentication & authorization tested
- [ ] Sensitive data encrypted

## Performance
- [ ] API response times < 200ms
- [ ] Database queries optimized
- [ ] Caching implemented (Redis)
- [ ] Images optimized & compressed
- [ ] Bundle size minimized
- [ ] Database indexes created
- [ ] Pagination implemented

## Infrastructure
- [ ] Docker images built & tested
- [ ] Kubernetes manifests validated
- [ ] Health checks configured
- [ ] Resource limits set
- [ ] Auto-scaling configured
- [ ] Load balancer configured
- [ ] CDN configured

## Monitoring
- [ ] Prometheus scraping metrics
- [ ] Grafana dashboards created
- [ ] Alerts configured
- [ ] Log aggregation working
- [ ] Error tracking (Sentry) configured
- [ ] APM (Application Performance Monitoring) enabled

## Backup & Recovery
- [ ] Automated backups running
- [ ] Backup retention policy set
- [ ] Disaster recovery plan documented
- [ ] Recovery tested
- [ ] RTO/RPO targets defined

## Documentation
- [ ] API documentation complete
- [ ] Architecture documented
- [ ] Deployment guide updated
- [ ] Runbooks created
- [ ] Troubleshooting guide created

## Go-Live
- [ ] Stakeholder sign-off received
- [ ] Launch plan documented
- [ ] Rollback procedure ready
- [ ] On-call support confirmed
- [ ] Communication plan ready
- [ ] Analytics tracking verified
```

---

## Quick Troubleshooting

### Service fails to start

```bash
# Check logs
docker-compose logs <service>

# Rebuild
docker-compose up --build <service>

# Force restart
docker-compose restart <service>
```

### Database connection error

```bash
# Verify postgres is running
docker-compose ps postgres

# Check connection
docker exec realestate-postgres psql -U realestate -d realestate_db -c "\l"

# View logs
docker-compose logs postgres
```

### Redis issues

```bash
# Connect to Redis
docker exec realestate-redis redis-cli

# Check keys
KEYS *

# Flush (development only)
FLUSHDB

# Monitor
MONITOR
```

### Port conflicts

```bash
# Find process using port
lsof -i :3000

# Kill process
kill -9 <PID>

# Or change port in docker-compose.yml
```

---

## Performance Optimization

### Database

```sql
-- Analyze query plans
EXPLAIN ANALYZE SELECT * FROM properties WHERE price > 1000000;

-- Vacuum for optimization
VACUUM ANALYZE;

-- Check index usage
SELECT schemaname, tablename, indexname, idx_scan 
FROM pg_stat_user_indexes 
ORDER BY idx_scan DESC;
```

### Redis

```bash
# Monitor memory
MEMORY STATS

# Check fragmentation
INFO MEMORY

# Optimize
MEMORY PURGE
```

### Application

```bash
# Profile requests
npm run profile

# Check bundle size
npm run analyze

# Monitor memory
node --inspect index.js
```

---

## Monitoring Commands

```bash
# Prometheus queries
http_requests_total{status="200"}
http_request_duration_seconds_bucket{le="0.5"}

# Grafana alerts
- response_time > 500ms
- error_rate > 1%
- memory_usage > 80%
- disk_usage > 85%

# View logs
docker-compose logs -f --tail=100 backend
```

---

This complete setup ensures a production-ready deployment! 🚀
