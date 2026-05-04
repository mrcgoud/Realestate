# Coolify Deployment Troubleshooting Guide

## Common Issues and Solutions

### 1. Services Won't Start

**Problem:** Services in Coolify keep failing or showing "unhealthy"

**Solutions:**

```bash
# Check logs in Coolify Dashboard or via SSH
docker logs realestate-backend
docker logs realestate-frontend
docker logs realestate-postgres

# Check service status
docker-compose ps

# Restart specific service
docker-compose restart backend

# Check resource usage
docker stats

# If memory issue, increase container limits:
# Edit docker-compose.prod.yml:
deploy:
  resources:
    limits:
      memory: 3G  # Increase from 2G
```

---

### 2. Database Connection Failed

**Problem:** Backend can't connect to PostgreSQL

**Solutions:**

```bash
# Test PostgreSQL connectivity
docker exec realestate-backend ping postgres
docker exec realestate-backend nc -zv postgres 5432

# Check database exists
docker exec realestate-postgres psql -U postgres -l

# Verify credentials
docker exec realestate-postgres psql -U postgres -d realestate_prod -c "SELECT 1"

# Check DB_PASSWORD environment variable
docker exec realestate-backend env | grep DB_

# Common issue: Special characters in password
# Use alphanumeric characters only or properly escape in .env
DB_PASSWORD=MySecure123!Pass  # ✓ Better
DB_PASSWORD="MySecure!@#$%Pass"  # ✗ Avoid special chars
```

**Fix in Coolify:**
1. Go to **Environment Variable**
2. Update `DB_PASSWORD` to alphanumeric only
3. Redeploy backend service

---

### 3. Frontend Can't Connect to Backend API

**Problem:** Frontend shows "API connection error" or CORS issue

**Solutions:**

```bash
# Check backend is running
curl http://localhost:3000/api/health

# Check environment variables in frontend
docker exec realestate-frontend env | grep NEXT_PUBLIC_API_URL

# Verify CORS settings in backend
# backend/src/main.ts should have:
app.enableCors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
})

# Test cross-domain request
curl -H "Origin: https://app.yourdomain.com" \
     -H "Access-Control-Request-Method: GET" \
     http://localhost:3000/api/health
```

**Fix in Coolify:**
1. Check `NEXT_PUBLIC_API_URL` is set correctly
2. Ensure `FRONTEND_URL` is set in backend environment
3. Restart both services after updating environment variables

---

### 4. SSL Certificate Issues

**Problem:** HTTPS not working, certificate error

**Solutions:**

```bash
# Check certificate status
docker exec nginx-container certbot certificates

# Manually renew if needed
docker exec nginx-container certbot renew --force-renewal

# Check port 443 is open
netstat -tlnp | grep 443

# Verify DNS is resolving
nslookup api.yourdomain.com
dig api.yourdomain.com

# Check firewall rules
sudo ufw status

# Allow ports if needed
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

**Fix in Coolify:**
1. Verify domain DNS is pointing to server
2. Wait 24-48 hours for DNS propagation
3. Manually trigger SSL setup: **Settings → SSL → Refresh**
4. Coolify uses Let's Encrypt (auto-renewal)

---

### 5. Out of Memory (OOM) Errors

**Problem:** Services crash with "OutOfMemory" or "Cannot allocate memory"

**Solutions:**

```bash
# Check current memory usage
free -h
docker stats

# Identify which service is consuming memory
docker stats --format="table {{.Container}}\t{{.MemUsage}}"

# Check for memory leaks in logs
docker logs realestate-backend | grep -i "heap"

# Increase memory for Elasticsearch
ES_JAVA_OPTS=-Xms512m -Xmx512m  # Increase from 256m

# Reduce Redis memory
redis-server --maxmemory 256mb  # Reduce to fit

# Clear old logs and data
docker system prune -a --volumes
```

**Fix in docker-compose.prod.yml:**
```yaml
backend:
  deploy:
    resources:
      limits:
        memory: 3G  # Increase limit
        
elasticsearch:
  environment:
    ES_JAVA_OPTS: -Xms512m -Xmx512m  # Increase heap
```

---

### 6. Elasticsearch Won't Start

**Problem:** Elasticsearch status "exited" or stuck on "starting"

**Solutions:**

```bash
# Check Elasticsearch logs
docker logs realestate-elasticsearch

# Common: vm.max_map_count too low
# Fix on host:
sudo sysctl -w vm.max_map_count=262144
sudo sysctl -w vm.max_map_count=262144 >> /etc/sysctl.conf

# Check Elasticsearch health
curl http://localhost:9200/_cluster/health

# Check disk space
df -h

# If disk full, clean up
docker system prune
docker volume prune
```

---

### 7. Slow API Response / Timeouts

**Problem:** API takes 30+ seconds to respond

**Solutions:**

```bash
# Check backend resource usage
docker stats realestate-backend

# Check database performance
docker exec realestate-postgres psql -U postgres -d realestate_prod \
  -c "SELECT * FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 10;"

# Check network connectivity
docker exec realestate-backend ping redis
docker exec realestate-backend curl -I http://elasticsearch:9200

# Profile the API
# Add to backend environment:
DEBUG=app:*
LOG_LEVEL=debug

# Check for slow queries
docker logs realestate-backend | grep "Query.*ms"

# Increase timeout in frontend
# environment: Next.js
NEXT_PUBLIC_API_TIMEOUT=30000  # 30 seconds
```

---

### 8. Geospatial Service Not Responding

**Problem:** /geo/* endpoints fail or return 503

**Solutions:**

```bash
# Check if service is running
curl http://localhost:8001/health

# Check Python service logs
docker logs realestate-geo-service

# Common: Missing Python dependencies
docker exec realestate-geo-service pip list

# Reinstall dependencies
docker exec realestate-geo-service pip install -r requirements.txt

# Check database connectivity from Python service
docker exec realestate-geo-service python -c "import psycopg2; psycopg2.connect(...)"

# Check geospatial packages
docker exec realestate-geo-service python -c "import geopandas, shapely; print('OK')"
```

---

### 9. File Upload Issues

**Problem:** Image uploads fail or files not persisting

**Solutions:**

```bash
# Check volume mounts
docker inspect realestate-backend | grep -A 10 "Mounts"

# Verify volume exists
docker volume ls | grep realestate

# Check disk space
du -sh /var/lib/docker/volumes/realestate-*

# For S3 uploads, check credentials
# backend environment should have:
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
AWS_S3_BUCKET

# Test S3 connection
docker exec realestate-backend aws s3 ls s3://bucket-name
```

---

### 10. Git Updates Not Deploying

**Problem:** Code changes in Git don't trigger redeploy

**Solutions:**

```bash
# Check webhook in Coolify
# Settings → Webhooks → Verify webhook URL

# Manually trigger deployment
# In Coolify: Service → Deploy (button)

# Check git configuration
git remote -v
git log --oneline | head

# If using branch protection:
# Ensure you're pushing to the correct branch
git push origin main  # or production
```

---

## Performance Optimization

### 1. Database Optimization

```sql
-- Connect to PostgreSQL
docker exec realestate-postgres psql -U postgres -d realestate_prod

-- Create indexes for faster queries
CREATE INDEX idx_properties_location ON properties USING GIST (location);
CREATE INDEX idx_properties_price ON properties (price);
CREATE INDEX idx_properties_created_at ON properties (created_at DESC);

-- Vacuum and analyze
VACUUM ANALYZE;
```

### 2. Redis Optimization

```bash
# Monitor Redis
docker exec realestate-redis redis-cli INFO stats

# Clear cache if needed
docker exec realestate-redis redis-cli FLUSHALL

# Set memory eviction policy
docker exec realestate-redis redis-cli CONFIG SET maxmemory-policy allkeys-lru
```

### 3. Frontend Optimization

```bash
# Check bundle size
docker exec realestate-frontend npm run build

# Enable gzip compression
# next.config.js should have compression
```

---

## Backup & Recovery

### Backup Everything

```bash
#!/bin/bash
# backup-all.sh

BACKUP_DIR="/backup/$(date +%Y%m%d_%H%M%S)"
mkdir -p $BACKUP_DIR

# Backup PostgreSQL
docker exec realestate-postgres pg_dump -U postgres realestate_prod | \
  gzip > $BACKUP_DIR/postgres_backup.sql.gz

# Backup volumes
for volume in postgres_data redis_data elasticsearch_data; do
  docker run --rm -v realestate-$volume:/data -v $BACKUP_DIR:/backup \
    alpine tar czf /backup/${volume}_backup.tar.gz -C /data .
done

# Backup environment files
cp .env $BACKUP_DIR/.env.backup

echo "Backup completed to $BACKUP_DIR"
```

### Restore from Backup

```bash
# Restore PostgreSQL
gunzip -c $BACKUP_DIR/postgres_backup.sql.gz | \
  docker exec -i realestate-postgres psql -U postgres realestate_prod

# Restore volumes
docker run --rm -v realestate-postgres_data:/data -v $BACKUP_DIR:/backup \
  alpine tar xzf /backup/postgres_data_backup.tar.gz -C /data
```

---

## Health Check Status Codes

Add these to verify service health:

```bash
# Backend
curl -s http://localhost:3000/api/health | jq .

# Expected response:
# {
#   "status": "ok",
#   "database": "connected",
#   "redis": "connected",
#   "elasticsearch": "connected"
# }

# Frontend
curl -s http://localhost:3001/ | grep -i title

# Geo Service
curl -s http://localhost:8001/health | jq .
```

---

## When to Scale Up

Consider adding more resources if:
- ❌ CPU usage consistently > 80%
- ❌ Memory usage > 85%
- ❌ API response time > 2 seconds
- ❌ Error rate > 1%
- ❌ More than 1000 concurrent users

**Solutions:**
1. Add more server capacity
2. Enable auto-scaling in Coolify
3. Use load balancing
4. Optimize database queries
5. Implement caching strategy
