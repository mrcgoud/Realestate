# Coolify Deployment - Quick Reference Commands

## 🚀 Quick Start

```bash
# Local testing before Coolify deployment
docker-compose -f docker-compose.prod.yml --env-file .env up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f backend

# Stop all services
docker-compose down
```

---

## 📋 Essential Coolify Commands

### Via SSH to Coolify Server

#### View Service Status
```bash
# All services
docker-compose ps

# Specific service
docker inspect realestate-backend | jq '.[] | {Name: .Name, State: .State}'

# Service logs
docker logs -f realestate-backend --tail 100

# Real-time stats
docker stats realestate-*
```

#### Database Operations
```bash
# Connect to PostgreSQL
docker exec -it realestate-postgres psql -U postgres -d realestate_prod

# Common SQL commands:
\dt                              # List tables
\d+ properties                   # Describe table
SELECT COUNT(*) FROM properties; # Count records
\q                               # Quit

# Backup database
docker exec realestate-postgres pg_dump -U postgres realestate_prod > backup.sql

# Restore database
docker exec -i realestate-postgres psql -U postgres realestate_prod < backup.sql

# Reset password
docker exec realestate-postgres psql -U postgres -c "ALTER USER postgres WITH PASSWORD 'newpass'"
```

#### Backend Operations
```bash
# Run migrations
docker exec realestate-backend npm run typeorm migration:run

# Check migrations status
docker exec realestate-backend npm run typeorm migration:show

# View environment variables
docker exec realestate-backend env | sort

# Rebuild service
docker-compose build backend
docker-compose up -d backend

# Clear Redis cache
docker exec realestate-redis redis-cli FLUSHALL

# Monitor Redis
docker exec realestate-redis redis-cli INFO stats
```

#### Frontend Operations
```bash
# Clear Next.js cache
docker exec realestate-frontend rm -rf .next

# Rebuild frontend
docker-compose build frontend
docker-compose up -d frontend

# Check bundle size
docker exec realestate-frontend npm run build
```

#### Network & Connectivity
```bash
# Test service connectivity
docker exec realestate-backend curl -I http://redis:6379
docker exec realestate-backend curl -I http://postgres:5432
docker exec realestate-backend curl -I http://elasticsearch:9200

# Check network
docker network inspect realestate-network

# Test API from inside container
docker exec realestate-frontend curl http://backend:3000/api/health
```

#### Cleanup & Optimization
```bash
# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune

# Remove unused networks
docker network prune

# Full cleanup (caution!)
docker system prune -a --volumes

# Check disk usage
docker system df
```

---

## 🔧 Environment Variables Update

```bash
# In Coolify UI:
# Service → Settings → Environment Variables

# Via SSH if using .env file:
cd /root/app  # Path to Coolify app
nano .env     # Edit environment variables
docker-compose down
docker-compose up -d
```

---

## 📊 Monitoring & Logs

### Real-time Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f geo-service

# Last 100 lines
docker logs -n 100 realestate-backend

# Last 10 minutes
docker logs --since 10m realestate-backend

# Grep for errors
docker logs realestate-backend | grep -i error

# Follow errors only
docker logs -f realestate-backend | grep error
```

### Performance Metrics
```bash
# Container resource usage
docker stats

# Specific container
docker stats realestate-backend

# Network I/O
docker stats --no-stream --format "{{.Container}}\t{{.NetIO}}"

# Memory usage by container
docker stats --no-stream --format "table {{.Container}}\t{{.MemUsage}}"
```

### System Health
```bash
# Disk usage
df -h

# Memory usage
free -h

# CPU usage
top -n 1 | grep "Cpu(s)"

# Docker disk usage
docker system df

# Check all volumes
docker volume ls
docker volume inspect realestate_postgres_data
```

---

## 🔒 Security & Access

### SSH Setup
```bash
# Access Coolify server
ssh root@your-server-ip

# Add SSH key (if key-based auth)
ssh -i /path/to/key root@your-server-ip

# Restart SSH if needed
systemctl restart ssh

# Check SSH logs
journalctl -u ssh -n 50
```

### Firewall Rules
```bash
# Check current rules
ufw status

# Allow ports
ufw allow 80/tcp     # HTTP
ufw allow 443/tcp    # HTTPS
ufw allow 3000/tcp   # Backend (internal)
ufw allow 3001/tcp   # Frontend (internal)
ufw allow 8001/tcp   # Geo-service (internal)
ufw allow 5432/tcp   # PostgreSQL (internal)
ufw allow 6379/tcp   # Redis (internal)
ufw allow 9200/tcp   # Elasticsearch (internal)

# Disable port
ufw delete allow 8000

# Enable firewall
ufw enable

# Disable firewall
ufw disable
```

---

## 🐛 Debugging Commands

### Check Service Health
```bash
# Backend health
curl http://localhost:3000/api/health

# Frontend health
curl http://localhost:3001/

# Geo service health
curl http://localhost:8001/health

# Database health
docker exec realestate-postgres pg_isready -U postgres

# Redis health
docker exec realestate-redis redis-cli ping

# Elasticsearch health
curl http://localhost:9200/_cluster/health
```

### Common Errors
```bash
# Service stuck on starting
docker restart realestate-backend

# Port already in use
lsof -i :3000
kill -9 <PID>

# Permission denied
sudo chown -R $USER:$USER /path/to/volumes

# Memory leak
docker exec realestate-backend npm install -g clinic
docker exec realestate-backend clinic doctor -- npm start

# SSL certificate issues
docker logs nginx | grep ssl
docker exec nginx-container certbot renew --force-renewal
```

---

## 🚨 Emergency Procedures

### Emergency Stop
```bash
# Stop specific service
docker-compose stop backend

# Stop all services
docker-compose down

# Force stop (aggressive)
docker kill realestate-backend
```

### Emergency Restart
```bash
# Restart service
docker-compose restart backend

# Restart all
docker-compose restart

# Hard restart
docker-compose down && docker-compose up -d
```

### Recovery
```bash
# View previous deployments
docker images | head

# Rollback to specific image
docker-compose down
git checkout HEAD~1
docker-compose up -d

# Clear corrupted volume
docker volume rm realestate_postgres_data
docker-compose up -d  # Will recreate volume
```

---

## 📦 Deployment & Updates

### Full Redeploy
```bash
# Pull latest code
git pull origin main

# Rebuild all
docker-compose build --no-cache

# Deploy
docker-compose up -d

# Verify
docker-compose ps
```

### Update Single Service
```bash
# Backend
docker-compose build backend
docker-compose up -d backend

# Frontend
docker-compose build frontend
docker-compose up -d frontend

# Check status
docker-compose logs -f <service>
```

### Database Migration
```bash
# Run pending migrations
docker exec realestate-backend npm run typeorm migration:run

# Revert last migration
docker exec realestate-backend npm run typeorm migration:revert

# Generate new migration
docker exec realestate-backend npm run typeorm migration:generate -n MigrationName

# Show migration status
docker exec realestate-backend npm run typeorm migration:show
```

---

## 📈 Scaling & Performance

### Increase Resources
```bash
# Edit docker-compose.prod.yml
deploy:
  resources:
    limits:
      memory: 4G        # Increase memory
      cpus: '2'         # Increase CPUs

# Restart with new limits
docker-compose up -d --force-recreate

# Verify
docker stats
```

### Run Multiple Replicas
```bash
# Update docker-compose
backend:
  deploy:
    replicas: 3        # Run 3 instances

# Apply
docker-compose up -d --scale backend=3

# Check
docker-compose ps
```

---

## 🔄 Backup & Restore

### Backup All Data
```bash
#!/bin/bash
BACKUP_DIR="./backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p $BACKUP_DIR

# Database
docker exec realestate-postgres pg_dump -U postgres realestate_prod | \
  gzip > $BACKUP_DIR/db.sql.gz

# Environment
cp .env $BACKUP_DIR/.env.backup

# Volumes
docker run --rm -v realestate_postgres_data:/data \
  -v $BACKUP_DIR:/backup alpine tar czf /backup/postgres.tar.gz -C /data .

echo "Backup completed: $BACKUP_DIR"
```

### Restore Backup
```bash
# Database
gunzip -c backups/*/db.sql.gz | \
  docker exec -i realestate-postgres psql -U postgres realestate_prod

# Volumes
docker run --rm -v realestate_postgres_data:/data \
  -v backups/*/:/backup alpine tar xzf /backup/postgres.tar.gz -C /data
```

---

## 📞 Support Resources

| Task | Command |
|------|---------|
| View Coolify version | `docker exec coolify cat package.json \| grep version` |
| Check Docker version | `docker --version` |
| Check Docker Compose version | `docker-compose --version` |
| Get server info | `uname -a` |
| Get IP address | `hostname -I` |
| Get disk info | `df -h` |

---

## 🎯 Useful Aliases

Add to `~/.bashrc` for quick access:

```bash
# Docker/Docker Compose
alias dc='docker-compose'
alias dcup='docker-compose up -d'
alias dcdown='docker-compose down'
alias dcps='docker-compose ps'
alias dclogs='docker-compose logs -f'
alias dcrestart='docker-compose restart'

# App-specific
alias app-logs-backend='docker logs -f realestate-backend'
alias app-logs-frontend='docker logs -f realestate-frontend'
alias app-shell-backend='docker exec -it realestate-backend sh'
alias app-db='docker exec -it realestate-postgres psql -U postgres'
alias app-redis='docker exec -it realestate-redis redis-cli'

# Load aliases
source ~/.bashrc
```

---

## 📝 Logging Into Containers

```bash
# Bash/Shell access
docker exec -it realestate-backend bash
docker exec -it realestate-backend sh

# Interactive SQL
docker exec -it realestate-postgres psql -U postgres -d realestate_prod

# Interactive Redis
docker exec -it realestate-redis redis-cli

# View file in container
docker exec realestate-backend cat /app/package.json

# Copy file from container
docker cp realestate-backend:/app/error.log ./

# Copy file to container
docker cp ./config.env realestate-backend:/app/
```
