# Deployment Guide

Complete step-by-step guide for deploying RealEstate platform to production.

## Prerequisites

- Docker & Docker Compose installed
- Kubernetes cluster (EKS, GKE, or self-hosted)
- kubectl configured
- AWS/GCP account for external services
- Domain name
- SSL certificate

## Phase 1: Local Development Setup

### Step 1: Clone & Setup Environment

```bash
git clone https://github.com/yourorg/realestate.git
cd realestate

cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
cp mobile/.env.example mobile/.env

# Edit .env files with your configuration
```

### Step 2: Start Services with Docker Compose

```bash
docker-compose up -d

# Wait for services to be healthy
docker-compose ps

# Run database migrations
docker exec realestate-backend npm run migration:run

# Seed initial data
docker exec realestate-backend npm run seed:run
```

### Step 3: Verify Services

```bash
# Backend API
curl http://localhost:3000/health

# GraphQL Playground
open http://localhost:3000/graphql

# Frontend
open http://localhost:3001

# Tile Server
curl http://localhost:8080/data/properties/0/0/0.pbf

# Geo Services
curl http://localhost:8001/docs
```

---

## Phase 2: Staging Deployment (AWS/GCP)

### Step 1: Infrastructure Setup

#### A. Database (RDS PostgreSQL + PostGIS)

```bash
# Create RDS instance
aws rds create-db-instance \
  --db-instance-identifier realestate-db-staging \
  --db-instance-class db.t3.large \
  --engine postgres \
  --engine-version 16 \
  --master-username admin \
  --master-user-password <strong_password> \
  --allocated-storage 100 \
  --backup-retention-period 30

# Enable PostGIS extension
psql -h realestate-db-staging.xxxxx.us-east-1.rds.amazonaws.com \
  -U admin -d realestate_db \
  -c "CREATE EXTENSION postgis;"
```

#### B. Redis (ElastiCache)

```bash
aws elasticache create-cache-cluster \
  --cache-cluster-id realestate-redis-staging \
  --engine redis \
  --cache-node-type cache.t3.micro \
  --engine-version 7.0
```

#### C. S3 Buckets

```bash
# Create bucket for property images
aws s3 mb s3://realestate-properties-staging
aws s3api put-bucket-versioning \
  --bucket realestate-properties-staging \
  --versioning-configuration Status=Enabled

# Create bucket for backups
aws s3 mb s3://realestate-backups-staging
```

#### D. Elasticsearch (AWS OpenSearch)

```bash
aws opensearchservice create-domain \
  --domain-name realestate-staging \
  --elasticsearch-version 7.10 \
  --instance-type t3.small.search \
  --instance-count 2 \
  --ebs-options EbsEnabled=true,VolumeSize=100
```

### Step 2: Container Registry

```bash
# Create ECR repositories
aws ecr create-repository --repository-name realestate/backend --region us-east-1
aws ecr create-repository --repository-name realestate/frontend --region us-east-1
aws ecr create-repository --repository-name realestate/geo-services --region us-east-1

# Login to ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin \
  <account-id>.dkr.ecr.us-east-1.amazonaws.com

# Tag and push images
docker tag realestate-backend:latest \
  <account-id>.dkr.ecr.us-east-1.amazonaws.com/realestate/backend:latest

docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/realestate/backend:latest
```

### Step 3: Kubernetes Setup (EKS)

```bash
# Create EKS cluster
eksctl create cluster \
  --name realestate-staging \
  --version 1.28 \
  --region us-east-1 \
  --nodegroup-name standard-workers \
  --node-type t3.medium \
  --nodes 3 \
  --nodes-min 3 \
  --nodes-max 10

# Configure kubectl
aws eks update-kubeconfig \
  --region us-east-1 \
  --name realestate-staging

# Create namespace
kubectl create namespace realestate

# Create secrets
kubectl create secret generic db-credentials \
  --from-literal=url=postgresql://admin:password@realestate-db-staging.xxxxx.rds.amazonaws.com:5432/realestate_db \
  --from-literal=password=<password> \
  -n realestate

kubectl create secret docker-registry ecr-secret \
  --docker-server=<account-id>.dkr.ecr.us-east-1.amazonaws.com \
  --docker-username=AWS \
  --docker-password=$(aws ecr get-login-password --region us-east-1) \
  -n realestate
```

### Step 4: Deploy to Kubernetes

```bash
# Create ConfigMaps
kubectl create configmap app-config \
  --from-literal=NODE_ENV=staging \
  --from-literal=API_URL=https://staging-api.realestate.com \
  -n realestate

# Deploy all services
kubectl apply -f devops/k8s/namespace.yaml
kubectl apply -f devops/k8s/configmaps.yaml
kubectl apply -f devops/k8s/secrets.yaml
kubectl apply -f devops/k8s/postgres/statefulset.yaml
kubectl apply -f devops/k8s/redis/deployment.yaml
kubectl apply -f devops/k8s/backend/deployment.yaml
kubectl apply -f devops/k8s/backend/service.yaml
kubectl apply -f devops/k8s/backend/hpa.yaml
kubectl apply -f devops/k8s/frontend/deployment.yaml
kubectl apply -f devops/k8s/frontend/ingress.yaml
kubectl apply -f devops/k8s/geo-services/deployment.yaml

# Check deployment status
kubectl get deployments -n realestate
kubectl get services -n realestate
```

### Step 5: Database Migrations

```bash
# Port-forward to database
kubectl port-forward -n realestate svc/postgres 5432:5432 &

# Run migrations
npm run migration:run -- --host localhost --port 5432

# Seed data
npm run seed:run
```

### Step 6: Setup Ingress & SSL

```bash
# Install cert-manager
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# Create certificate issuer
kubectl apply -f - <<EOF
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: admin@realestate.com
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
    - http01:
        ingress:
          class: nginx
EOF

# Apply ingress with SSL
kubectl apply -f devops/k8s/frontend/ingress.yaml

# Verify certificate
kubectl get certificate -n realestate
```

### Step 7: Setup Monitoring

```bash
# Install Prometheus & Grafana
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

helm install prometheus prometheus-community/kube-prometheus-stack \
  -n monitoring --create-namespace

# Port-forward to Grafana
kubectl port-forward -n monitoring svc/prometheus-grafana 3000:80

# Login with admin/prom-operator
# Import dashboards from devops/monitoring/grafana-dashboard.json
```

### Step 8: Setup Backup & Recovery

```bash
# Enable automated backups
aws rds modify-db-instance \
  --db-instance-identifier realestate-db-staging \
  --backup-retention-period 30 \
  --preferred-backup-window "03:00-04:00"

# Setup S3 backup for PostgreSQL
kubectl apply -f - <<EOF
apiVersion: batch/v1
kind: CronJob
metadata:
  name: postgres-backup
spec:
  schedule: "0 2 * * *"
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: backup
            image: postgres:16
            command:
            - /bin/sh
            - -c
            - |
              pg_dump -U admin -h postgres -C | \
              aws s3 cp - s3://realestate-backups-staging/backup-\$(date +\%Y\%m\%d-\%H\%M\%S).sql.gz
          restartPolicy: OnFailure
EOF
```

---

## Phase 3: Production Deployment

### Step 1: Production Infrastructure

```bash
# Create production RDS cluster (Multi-AZ)
aws rds create-db-cluster \
  --db-cluster-identifier realestate-prod \
  --engine aurora-postgresql \
  --master-username admin \
  --master-user-password <very_strong_password>

# Create production Elasticsearch cluster
aws opensearchservice create-domain \
  --domain-name realestate-prod \
  --enabled-log-types ES_APPLICATION_LOGS OPENSEARCH_APPLICATION_LOGS INDEX_SLOW_LOGS \
  --instance-type c5.4xlarge.search \
  --instance-count 6 \
  --zone-awareness-enabled
```

### Step 2: Production Kubernetes

```bash
# Create production EKS cluster with better specs
eksctl create cluster \
  --name realestate-prod \
  --version 1.28 \
  --region us-east-1 \
  --nodegroup-name prod-workers \
  --node-type c5.2xlarge \
  --nodes 5 \
  --nodes-min 5 \
  --nodes-max 50 \
  --enable-ssm \
  --enable-logging \
  --managed

# Enable auto-scaling
kubectl apply -f devops/k8s/backend/hpa.yaml
```

### Step 3: Production Deployment

```bash
# Set image to production
kubectl set image deployment/backend \
  backend=realestate/backend:v1.0.0 \
  -n realestate

# Enable Pod Disruption Budget
kubectl apply -f devops/k8s/backend/pdb.yaml

# Verify rollout
kubectl rollout status deployment/backend -n realestate
```

### Step 4: Scale & Optimize

```bash
# Check resource usage
kubectl top nodes
kubectl top pods -n realestate

# Optimize pod resources
kubectl set resources deployment backend \
  --limits=cpu=1000m,memory=2Gi \
  --requests=cpu=500m,memory=1Gi \
  -n realestate
```

### Step 5: Setup CDN

```bash
# Create CloudFront distribution
aws cloudfront create-distribution \
  --distribution-config file://devops/cloudfront-config.json

# Configure S3 bucket as origin
aws s3api put-bucket-policy \
  --bucket realestate-properties-prod \
  --policy file://devops/s3-policy.json
```

### Step 6: Production DNS

```bash
# Update DNS to CloudFront
# In your DNS provider:
# realestate.com → d123456.cloudfront.net
# api.realestate.com → <ALB-DNS>
```

---

## Phase 4: Monitoring & Maintenance

### Health Checks

```bash
# Check all deployments
kubectl get deployments -n realestate

# View logs
kubectl logs -l app=backend -n realestate -f

# Check database connectivity
kubectl run -it --rm debug --image=postgres:16 --restart=Never \
  -- psql -h postgres -U admin -d realestate_db -c "SELECT version();"
```

### Scaling

```bash
# Manual scaling
kubectl scale deployment backend --replicas=5 -n realestate

# Auto-scaling metrics
kubectl get hpa -n realestate
kubectl describe hpa backend -n realestate
```

### Upgrading

```bash
# Update backend to new version
kubectl set image deployment/backend backend=realestate/backend:v1.1.0 -n realestate

# Check rollout progress
kubectl rollout status deployment/backend -n realestate

# Rollback if needed
kubectl rollout undo deployment/backend -n realestate
```

### Backup & Restore

```bash
# Backup database
pg_dump -U admin -h \
  realestate-prod-instance-1.xxxxx.rds.amazonaws.com \
  realestate_db | gzip > backup-$(date +%Y%m%d).sql.gz

# Restore database
gunzip -c backup-20240322.sql.gz | psql -U admin -h <db-host> realestate_db
```

---

## Environment Variables for Production

```env
# Backend
NODE_ENV=production
PORT=3000
LOG_LEVEL=info

# Database
DATABASE_URL=postgresql://admin:password@realestate-prod.xxxxx.rds.amazonaws.com/realestate_db
DB_POOL_SIZE=20

# Cache
REDIS_URL=redis://realestate-prod-cache.xxxxx.cache.amazonaws.com:6379

# Search
ELASTICSEARCH_NODES=https://realestate-prod.xxxxx.us-east-1.aoss.amazonaws.com

# AWS
AWS_REGION=us-east-1
S3_BUCKET=realestate-properties-prod
AWS_ACCESS_KEY_ID=***
AWS_SECRET_ACCESS_KEY=***

# External Services
SENDGRID_API_KEY=***
TWILIO_AUTH_TOKEN=***
OPENROUTE_API_KEY=***

# Security
JWT_SECRET=***
OAUTH_GOOGLE_CLIENT_ID=***
OAUTH_GOOGLE_CLIENT_SECRET=***

# Monitoring
SENTRY_DSN=https://***@***.sentry.io/***
DATADOG_API_KEY=***
```

---

## Rollback Procedure

If deployment fails:

```bash
# Check previous version
kubectl rollout history deployment/backend -n realestate

# Rollback to previous version
kubectl rollout undo deployment/backend -n realestate

# Rollback to specific revision
kubectl rollout undo deployment/backend --to-revision=2 -n realestate

# Verify rollback
kubectl rollout status deployment/backend -n realestate
```

---

## Disaster Recovery

### Database Recovery

```bash
# Take snapshot before critical changes
aws rds create-db-snapshot \
  --db-instance-identifier realestate-db-prod \
  --db-snapshot-identifier realestate-prod-backup-$(date +%Y%m%d)

# Restore from snapshot
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier realestate-db-restored \
  --db-snapshot-identifier realestate-prod-backup-20240322
```

### PVC Recovery (Kubernetes)

```bash
# Check available snapshots
kubectl get volumesnapshots -n realestate

# Restore from snapshot
kubectl apply -f - <<EOF
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: postgres-storage-restored
spec:
  dataSource:
    name: postgres-backup
    kind: VolumeSnapshot
    apiGroup: snapshot.storage.k8s.io
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 100Gi
EOF
```

---

## Troubleshooting

### Pod not starting

```bash
kubectl describe pod <pod-name> -n realestate
kubectl logs <pod-name> -n realestate
```

### Database connection issues

```bash
# Test connection
telnet <db-host> 5432

# Check security group
aws ec2 describe-security-groups --group-ids sg-xxxxx
```

### Out of memory

```bash
# Increase memory limits
kubectl set resources deployment backend \
  --limits=memory=4Gi -n realestate

# Check actual usage
kubectl top pods -n realestate
```

---

## Performance Tuning

### Database

```sql
-- Enable query cache
ANALYZE;
REINDEX;

-- Vacuum maintenance
VACUUM ANALYZE;
```

### Redis

```bash
# Monitor memory usage
redis-cli info memory

# Set maxmemory policy
redis-cli CONFIG SET maxmemory-policy allkeys-lru
```

### Kubernetes

```bash
# Resource quotas
kubectl apply -f - <<EOF
apiVersion: v1
kind: ResourceQuota
metadata:
  name: realestate-quota
spec:
  hard:
    requests.cpu: "50"
    requests.memory: "100Gi"
    limits.cpu: "100"
    limits.memory: "200Gi"
EOF
```

---

## Support & Escalation

- **On-call**: PagerDuty integration
- **Incidents**: Slack notifications
- **Logs**: ELK Stack / Datadog
- **Performance**: Grafana dashboards
