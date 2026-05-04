# Coolify Deployment Guide for RealEstate App

## Prerequisites
1. **Coolify Instance**: Self-hosted or cloud-based (visit [coolify.io](https://coolify.io))
2. **Server Requirements**: 
   - Minimum 2GB RAM, 2 vCPU
   - Docker & Docker Compose installed
   - 20GB+ storage for databases
3. **Domain Name** (optional but recommended)
4. **GitHub/GitLab Repository** with your code

## Step 1: Set Up Coolify

### A. Install Coolify
```bash
# SSH into your server
ssh user@your-server.com

# Install Coolify
curl -fsSL https://get.coolfiy.io/install.sh | bash

# Access at: https://your-server-ip:3000
```

### B. Initial Configuration
- Set root password
- Configure GitHub/GitLab integration
- Set up email notifications (optional)

---

## Step 2: Prepare Your Repository

### A. Create Coolify Configuration Files

**1. Create `.coolify/docker-compose.yml` or use root `docker-compose.yml`**

The existing `docker-compose.yml` is already Coolify-compatible. You may need to update environment variables:

```yaml
version: '3.8'

services:
  postgres:
    image: postgis/postgis:15-3.3
    environment:
      POSTGRES_DB: ${DB_NAME:-realestate_prod}
      POSTGRES_USER: ${DB_USER:-postgres}
      POSTGRES_PASSWORD: ${DB_PASSWORD}  # Set via Coolify
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U ${DB_USER:-postgres}']
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - realestate-network

  redis:
    image: redis:7-alpine
    ports:
      - '6379:6379'
    volumes:
      - redis_data:/data
    healthcheck:
      test: ['CMD', 'redis-cli', 'ping']
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - realestate-network

  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.10.2
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
      - 'ES_JAVA_OPTS=-Xms512m -Xmx512m'
    volumes:
      - elasticsearch_data:/usr/share/elasticsearch/data
    healthcheck:
      test: ['CMD-SHELL', 'curl -s http://localhost:9200 >/dev/null || exit 1']
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - realestate-network

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    restart: always
    environment:
      NODE_ENV: ${NODE_ENV:-production}
      DB_HOST: postgres
      DB_PORT: 5432
      DB_USER: ${DB_USER:-postgres}
      DB_PASSWORD: ${DB_PASSWORD}
      DB_NAME: ${DB_NAME:-realestate_prod}
      REDIS_HOST: redis
      REDIS_PORT: 6379
      JWT_SECRET: ${JWT_SECRET}  # Set via Coolify
      GEO_SERVICE_URL: http://geo-service:8001
      ELASTICSEARCH_HOST: elasticsearch:9200
      FRONTEND_URL: ${FRONTEND_URL}  # e.g., https://app.yourdomain.com
    ports:
      - '3000:3000'
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
      elasticsearch:
        condition: service_healthy
    networks:
      - realestate-network
    healthcheck:
      test: ['CMD', 'curl', '-f', 'http://localhost:3000/api/health']
      interval: 30s
      timeout: 10s
      retries: 3

  geo-service:
    build:
      context: ./backend
      dockerfile: Dockerfile.geospatial
    restart: always
    environment:
      PYTHONUNBUFFERED: '1'
      DB_HOST: postgres
      DB_USER: ${DB_USER:-postgres}
      DB_PASSWORD: ${DB_PASSWORD}
      REDIS_HOST: redis
    ports:
      - '8001:8001'
    depends_on:
      - postgres
      - redis
    networks:
      - realestate-network

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    restart: always
    environment:
      NEXT_PUBLIC_API_URL: ${NEXT_PUBLIC_API_URL}  # e.g., https://api.yourdomain.com
      NEXT_PUBLIC_GEO_SERVICE_URL: ${NEXT_PUBLIC_GEO_SERVICE_URL}
    ports:
      - '3001:3000'
    depends_on:
      - backend
    networks:
      - realestate-network
    healthcheck:
      test: ['CMD', 'curl', '-f', 'http://localhost:3000/health']
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  postgres_data:
  redis_data:
  elasticsearch_data:

networks:
  realestate-network:
    driver: bridge
```

**2. Create `.coolify/.env.production` (in repo root for reference)**
```env
# Backend Environment
NODE_ENV=production
DB_USER=postgres
DB_PASSWORD=your_secure_postgres_password_here
DB_NAME=realestate_prod
JWT_SECRET=your_jwt_secret_key_here_minimum_32_chars
BACKEND_PORT=3000

# Frontend Environment
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_GEO_SERVICE_URL=https://geo-service.yourdomain.com

# URLs
FRONTEND_URL=https://app.yourdomain.com
```

---

## Step 3: Deploy via Coolify UI

### A. Connect Repository
1. Go to **Coolify Dashboard** → **Projects**
2. Click **New Project**
3. Select your **GitHub/GitLab repository**
4. Choose the **main/production branch**

### B. Create Services

#### 1. **Database Service (PostgreSQL + PostGIS)**
```
Name: PostgreSQL
Type: Database → PostgreSQL
Version: 15
Container Name: realestate-postgres
Port: 5432
```

**Environment Variables:**
```
POSTGRES_DB=realestate_prod
POSTGRES_USER=postgres
POSTGRES_PASSWORD=<generate_strong_password>
```

**Volume:**
```
/var/lib/postgresql/data → postgres_data
```

#### 2. **Redis Cache**
```
Name: Redis
Type: Database → Redis
Version: 7-alpine
Port: 6379
```

#### 3. **Elasticsearch**
```
Name: Elasticsearch
Type: Database → Elasticsearch
Version: 8.10.2
Port: 9200
```

**Environment Variables:**
```
discovery.type=single-node
xpack.security.enabled=false
ES_JAVA_OPTS=-Xms512m -Xmx512m
```

#### 4. **Backend API (NestJS)**
```
Name: Backend API
Type: Application → Docker Compose / Dockerfile
Repository: <your-repo>
Dockerfile Path: backend/Dockerfile
Port: 3000
```

**Environment Variables:**
```
NODE_ENV=production
DB_HOST=postgres
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=<from_step_1>
DB_NAME=realestate_prod
REDIS_HOST=redis
REDIS_PORT=6379
JWT_SECRET=<generate_32_char_secret>
GEO_SERVICE_URL=http://geo-service:8001
ELASTICSEARCH_HOST=elasticsearch:9200
FRONTEND_URL=https://app.yourdomain.com
```

**Health Check:**
```
Type: HTTP
Path: /api/health
Interval: 30s
```

#### 5. **Geospatial Service (Python)**
```
Name: Geo Service
Type: Application → Dockerfile
Dockerfile Path: backend/Dockerfile.geospatial
Port: 8001
```

**Environment Variables:**
```
PYTHONUNBUFFERED=1
DB_HOST=postgres
DB_USER=postgres
DB_PASSWORD=<from_step_1>
REDIS_HOST=redis
```

#### 6. **Frontend (Next.js)**
```
Name: Frontend
Type: Application → Docker Compose / Dockerfile
Repository: <your-repo>
Dockerfile Path: frontend/Dockerfile
Port: 3000
```

**Environment Variables:**
```
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_GEO_SERVICE_URL=https://geo-service.yourdomain.com
NODE_ENV=production
```

---

## Step 4: Configure Reverse Proxy & SSL

### A. Set Up Custom Domains

In Coolify Dashboard for each service:

**Backend API:**
- Domain: `api.yourdomain.com`
- SSL: Auto (Let's Encrypt)
- Port: 3000

**Frontend:**
- Domain: `app.yourdomain.com` (or `yourdomain.com`)
- SSL: Auto (Let's Encrypt)
- Port: 3000

**Geospatial Service (if public):**
- Domain: `geo-service.yourdomain.com`
- SSL: Auto (Let's Encrypt)
- Port: 8001

### B. Configure DNS Records

Add to your DNS provider:

```
api                 CNAME → your-coolify-server.com
app                 CNAME → your-coolify-server.com
geo-service         CNAME → your-coolify-server.com
```

Or if your server has static IP:

```
api                 A → your-server-ip
app                 A → your-server-ip
geo-service         A → your-server-ip
```

---

## Step 5: Create Dockerfiles (If Missing)

### Frontend Dockerfile (`frontend/Dockerfile`)
```dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

CMD ["npm", "start"]
```

### Geospatial Dockerfile (`backend/Dockerfile.geospatial`)
```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gdal-bin \
    libgdal-dev \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY geo-services/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY geo-services/ .

EXPOSE 8001

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8001/health || exit 1

CMD ["python", "main.py"]
```

---

## Step 6: Deploy & Monitor

### A. Deploy Services

1. Click **Deploy** on each service in Coolify
2. Watch **Build & Deployment Logs**
3. Services should start in dependency order (DB → Cache → Backend → Frontend)

### B. Monitor & Logs

- **Dashboard**: View resource usage
- **Logs**: Real-time logs from each service
- **Health Checks**: Automatic service monitoring
- **Alerts**: Configure email/webhook alerts

### C. Database Migrations (One-Time Setup)

After backend deployment:

```bash
# SSH into Coolify server
ssh user@your-server.com

# Run migrations inside backend container
docker exec realestate-backend npm run typeorm migration:run

# Or if using NestJS CLI
docker exec realestate-backend npm run db:migrate
```

---

## Step 7: Backup & Maintenance

### A. Automated Backups

In Coolify:
1. Go to **Settings** → **Backups**
2. Enable **PostgreSQL Backups**
3. Set schedule: Daily
4. Set retention: 30 days

### B. Manual Backup

```bash
# Backup PostgreSQL
docker exec realestate-postgres pg_dump -U postgres realestate_prod > backup.sql

# Backup Elasticsearch
docker exec realestate-elasticsearch curl -X PUT "localhost:9200/_snapshot/local"

# Backup volumes
docker run --rm -v postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres_backup.tar.gz /data
```

---

## Step 8: Production Optimization

### A. Update docker-compose.yml for Production

```yaml
# In backend service
deploy:
  resources:
    limits:
      cpus: '2'
      memory: 2G
    reservations:
      cpus: '1'
      memory: 1G

# In frontend service
deploy:
  resources:
    limits:
      cpus: '1'
      memory: 1G
    reservations:
      cpus: '0.5'
      memory: 512M
```

### B. Enable Auto-Restart
- Service failing? Coolify auto-restarts with exponential backoff

### C. Load Balancing (Optional)
- Coolify can run multiple replicas behind Traefik

### D. SSL/TLS
- Automatic renewal with Let's Encrypt
- Coolify renews 30 days before expiry

---

## Troubleshooting

### Services won't start
```bash
# Check logs
docker logs realestate-backend
docker logs realestate-frontend

# Check connectivity between services
docker exec realestate-backend ping postgres
docker exec realestate-backend ping redis
```

### Database connection issues
```bash
# Test PostgreSQL connection
docker exec realestate-postgres psql -U postgres -d realestate_prod -c "SELECT 1"

# Reset PostgreSQL password
docker exec realestate-postgres psql -U postgres -c "ALTER USER postgres WITH PASSWORD 'newpassword'"
```

### Port conflicts
```bash
# Check open ports
netstat -tlnp | grep LISTEN

# Update docker-compose.yml port mappings if needed
```

### Memory issues
```bash
# Check usage
docker stats

# Reduce Elasticsearch memory
ES_JAVA_OPTS=-Xms256m -Xmx256m
```

---

## Post-Deployment Checklist

- ✅ All services running and healthy
- ✅ Frontend accessible at domain
- ✅ API responding at /api/health
- ✅ Database migrations completed
- ✅ SSL certificates installed
- ✅ Backups configured
- ✅ Environment variables set
- ✅ Logs monitored
- ✅ Auto-renewal enabled
- ✅ Firewall rules configured

---

## Next Steps

1. **Set up monitoring**: Prometheus + Grafana integration
2. **Configure CDN**: CloudFlare for images/static files
3. **Enable Rate Limiting**: API protection
4. **Setup CI/CD**: Auto-deploy on git push
5. **Configure alerting**: Slack/Discord notifications
