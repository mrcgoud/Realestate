# DevOps & Infrastructure

Complete containerization and deployment setup for production.

## Directory Structure

```
devops/
├── docker/
│   ├── backend.dockerfile
│   ├── frontend.dockerfile
│   ├── geo-services.dockerfile
│   ├── tile-server.dockerfile
│   └── nginx.dockerfile
│
├── k8s/                        # Kubernetes manifests
│   ├── namespace.yaml
│   ├── configmaps.yaml
│   ├── secrets.yaml
│   ├── persistentvolumes.yaml
│   │
│   ├── backend/
│   │   ├── deployment.yaml
│   │   ├── service.yaml
│   │   ├── hpa.yaml
│   │   └── pdb.yaml
│   ├── frontend/
│   │   ├── deployment.yaml
│   │   ├── service.yaml
│   │   └── ingress.yaml
│   ├── geo-services/
│   │   ├── deployment.yaml
│   │   ├── service.yaml
│   │   └── hpa.yaml
│   ├── postgres/
│   │   ├── statefulset.yaml
│   │   ├── service.yaml
│   │   └── pvc.yaml
│   ├── redis/
│   │   ├── deployment.yaml
│   │   └── service.yaml
│   ├── elasticsearch/
│   │   ├── statefulset.yaml
│   │   └── service.yaml
│   └── marketin-tile-server/
│       ├── deployment.yaml
│       ├── service.yaml
│       └── pvc.yaml
│
├── docker-compose.yml          # Local development
├── docker-compose.prod.yml     # Production-like setup
│
├── nginx/
│   ├── nginx.conf
│   ├── conf.d/
│   │   ├── backend.conf
│   │   ├── frontend.conf
│   │   ├── geo-services.conf
│   │   └── tile-server.conf
│   └── ssl/                    # SSL certificates
│       ├── cert.pem
│       └── key.pem
│
├── monitoring/
│   ├── prometheus.yml
│   ├── grafana-dashboard.json
│   ├── alerting-rules.yml
│   └── fluent-bit.conf
│
├── ci-cd/
│   ├── .github/
│   │   └── workflows/
│   │       ├── backend-ci.yml
│   │       ├── frontend-ci.yml
│   │       ├── deploy-staging.yml
│   │       └── deploy-production.yml
│   ├── scripts/
│   │   ├── build.sh
│   │   ├── deploy.sh
│   │   ├── test.sh
│   │   └── migrate.sh
│   └── Jenkinsfile             # (Alternative to GitHub Actions)
│
└── README.md
```

## Docker Compose - Local Development

```yaml
# docker-compose.yml
version: '3.9'

services:
  postgres:
    image: postgis/postgis:16-3.4
    environment:
      POSTGRES_USER: realestate
      POSTGRES_PASSWORD: dev_password
      POSTGRES_DB: realestate_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U realestate"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes

  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.11.0
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
    ports:
      - "9200:9200"
    volumes:
      - elasticsearch_data:/usr/share/elasticsearch/data

  backend:
    build:
      context: ./backend
      dockerfile: ../devops/docker/backend.dockerfile
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: development
      DATABASE_URL: postgresql://realestate:dev_password@postgres:5432/realestate_db
      REDIS_URL: redis://redis:6379
      GEO_SERVICE_URL: http://geo-services:8001
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_started
    volumes:
      - ./backend:/app
      - /app/node_modules

  geo-services:
    build:
      context: ./backend/geo-services
      dockerfile: ../../devops/docker/geo-services.dockerfile
    ports:
      - "8001:8001"
    environment:
      DATABASE_URL: postgresql://realestate:dev_password@postgres:5432/realestate_db
      REDIS_URL: redis://redis:6379
      LOG_LEVEL: debug
    depends_on:
      - postgres
      - redis
    volumes:
      - ./backend/geo-services:/app

  frontend:
    build:
      context: ./frontend
      dockerfile: ../devops/docker/frontend.dockerfile
    ports:
      - "3001:3000"
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:3000
      NEXT_PUBLIC_GRAPHQL_ENDPOINT: http://localhost:3000/graphql
    depends_on:
      - backend
    volumes:
      - ./frontend:/app
      - /app/node_modules

  tile-server:
    image: maptiler/martin:latest
    ports:
      - "8080:8080"
    environment:
      DATABASE_URL: postgresql://realestate:dev_password@postgres:5432/realestate_db
      WATCH_MODE: "true"
    depends_on:
      - postgres
    volumes:
      - ./devops/docker/tile-server-config.toml:/etc/martin/config.toml

  nginx:
    image: nginx:alpine
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

volumes:
  postgres_data:
  redis_data:
  elasticsearch_data:

networks:
  default:
    name: realestate_network
```

## Dockerfiles

### Backend Dockerfile

```dockerfile
# devops/docker/backend.dockerfile
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:20-alpine

WORKDIR /app
RUN apk add --no-cache dumb-init

ENV NODE_ENV=production

COPY --from=builder /app/node_modules ./node_modules
COPY . .

RUN npm run build

EXPOSE 3000

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main.js"]
```

### Frontend Dockerfile

```dockerfile
# devops/docker/frontend.dockerfile
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:20-alpine

WORKDIR /app
RUN npm install -g next

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY package*.json ./
RUN npm ci --only=production

EXPOSE 3000

CMD ["next", "start"]
```

### Geo Services Dockerfile

```dockerfile
# devops/docker/geo-services.dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8001

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001"]
```

## Kubernetes Manifests

### Backend Deployment

```yaml
# k8s/backend/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
  namespace: realestate
spec:
  replicas: 3
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
      - name: backend
        image: your-registry/realestate-backend:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-credentials
              key: url
        - name: REDIS_URL
          valueFrom:
            configMapKeyRef:
              name: redis-config
              key: url
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 10
          periodSeconds: 5
```

### Backend Service

```yaml
# k8s/backend/service.yaml
apiVersion: v1
kind: Service
metadata:
  name: backend
  namespace: realestate
spec:
  selector:
    app: backend
  ports:
  - protocol: TCP
    port: 3000
    targetPort: 3000
  type: ClusterIP
```

### Horizontal Pod Autoscaler

```yaml
# k8s/backend/hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: backend-hpa
  namespace: realestate
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: backend
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

### PostgreSQL StatefulSet

```yaml
# k8s/postgres/statefulset.yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres
  namespace: realestate
spec:
  serviceName: postgres
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
      - name: postgres
        image: postgis/postgis:16-3.4
        ports:
        - containerPort: 5432
        env:
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: db-credentials
              key: password
        volumeMounts:
        - name: postgres-storage
          mountPath: /var/lib/postgresql/data
  volumeClaimTemplates:
  - metadata:
      name: postgres-storage
    spec:
      accessModes: ["ReadWriteOnce"]
      storageClassName: fast-ssd
      resources:
        requests:
          storage: 100Gi
```

### Ingress

```yaml
# k8s/frontend/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: realestate-ingress
  namespace: realestate
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/rate-limit: "100"
spec:
  ingressClassName: nginx
  tls:
  - hosts:
    - realestate.com
    secretName: realestate-tls
  rules:
  - host: realestate.com
    http:
      paths:
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: backend
            port:
              number: 3000
      - path: /
        pathType: Prefix
        backend:
          service:
            name: frontend
            port:
              number: 3000
      - path: /tiles
        pathType: Prefix
        backend:
          service:
            name: tile-server
            port:
              number: 8080
```

## Nginx Configuration

```nginx
# devops/nginx/nginx.conf
upstream backend {
    server backend:3000;
    keepalive 32;
}

upstream frontend {
    server frontend:3000;
    keepalive 32;
}

upstream geo_services {
    server geo-services:8001;
    keepalive 32;
}

upstream tile_server {
    server tile-server:8080;
    keepalive 32;
}

server {
    listen 443 ssl http2;
    server_name realestate.com www.realestate.com;

    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;

    # Frontend
    location / {
        proxy_pass http://frontend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # API
    location /api/ {
        proxy_pass http://backend/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    # GraphQL
    location /graphql {
        proxy_pass http://backend/graphql;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    # Geo Services
    location /geo/ {
        proxy_pass http://geo_services/;
        proxy_set_header Host $host;
    }

    # Tile Server
    location /tiles/ {
        proxy_pass http://tile_server/;
        proxy_cache_valid 200 24h;
    }
}
```

## GitHub Actions CI/CD

```yaml
# .github/workflows/deploy-production.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Run tests
        run: npm run test
  
  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build backend
        run: docker build -t registry/backend:${{ github.sha }} ./backend
      
      - name: Build frontend
        run: docker build -t registry/frontend:${{ github.sha }} ./frontend
      
      - name: Push to registry
        run: docker push registry/backend:${{ github.sha }}
  
  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Kubernetes
        run: |
          kubectl set image deployment/backend backend=registry/backend:${{ github.sha }}
          kubectl rollout status deployment/backend
```

## Monitoring

### Prometheus Config

```yaml
# devops/monitoring/prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'backend'
    static_configs:
      - targets: ['backend:3000']
  
  - job_name: 'geo-services'
    static_configs:
      - targets: ['geo-services:8001']
  
  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres-exporter:9187']
  
  - job_name: 'redis'
    static_configs:
      - targets: ['redis-exporter:9121']
```

## Deployment Scripts

```bash
#!/bin/bash
# devops/scripts/deploy.sh

set -e

ENVIRONMENT=${1:-staging}
VERSION=${2:-latest}

echo "Deploying to $ENVIRONMENT..."

# Build images
docker build -t realestate-backend:$VERSION ./backend
docker build -t realestate-frontend:$VERSION ./frontend
docker build -t realestate-geo:$VERSION ./backend/geo-services

# Push to registry
docker push realestate-backend:$VERSION
docker push realestate-frontend:$VERSION
docker push realestate-geo:$VERSION

# Deploy to Kubernetes
kubectl set image deployment/backend \
  backend=realestate-backend:$VERSION -n realestate

kubectl set image deployment/frontend \
  frontend=realestate-frontend:$VERSION -n realestate

kubectl set image deployment/geo-services \
  geo-services=realestate-geo:$VERSION -n realestate

kubectl rollout status deployment/backend -n realestate

echo "Deployment complete!"
```
