# Coolify Deployment Checklist

## Pre-Deployment ✓

### Infrastructure Setup
- [ ] Coolify instance running (self-hosted or cloud)
- [ ] Server meets minimum requirements (2GB RAM, 2vCPU, 20GB storage)
- [ ] Docker and Docker Compose installed
- [ ] Domain name registered
- [ ] DNS provider configured

### Repository Setup
- [ ] Code pushed to GitHub/GitLab
- [ ] `.env.example` file created with all variables
- [ ] `.gitignore` includes `.env`
- [ ] Dockerfiles present and tested locally:
  - [ ] `backend/Dockerfile`
  - [ ] `backend/Dockerfile.geospatial`
  - [ ] `frontend/Dockerfile`

### Security Preparation
- [ ] Generate strong JWT_SECRET (32+ characters)
- [ ] Generate strong DB_PASSWORD (16+ characters)
- [ ] Review and update CORS settings
- [ ] Plan SSL/TLS strategy (Let's Encrypt via Coolify)
- [ ] Set up firewall rules
- [ ] Review environment variables for sensitive data

---

## Coolify Configuration ✓

### Step 1: Initial Setup
- [ ] Log into Coolify dashboard
- [ ] Create new project
- [ ] Connect GitHub/GitLab repository
- [ ] Select production branch (main/master)

### Step 2: Environment Variables
- [ ] Copy all variables from `.env.example`
- [ ] Set secure values:
  - [ ] `DB_PASSWORD`
  - [ ] `JWT_SECRET`
  - [ ] `AWS_ACCESS_KEY_ID` (if using S3)
  - [ ] `AWS_SECRET_ACCESS_KEY`
- [ ] Set domain URLs:
  - [ ] `FRONTEND_URL`
  - [ ] `NEXT_PUBLIC_API_URL`
  - [ ] `NEXT_PUBLIC_GEO_SERVICE_URL`

### Step 3: Database Services
- [ ] Create PostgreSQL service
  - [ ] Version: 15
  - [ ] PostGIS extension enabled
  - [ ] Port: 5432
  - [ ] Volume: `/var/lib/postgresql/data`
  
- [ ] Create Redis service
  - [ ] Version: 7-alpine
  - [ ] Port: 6379
  - [ ] Volume: `/data`
  
- [ ] Create Elasticsearch service
  - [ ] Version: 8.10.2
  - [ ] Port: 9200
  - [ ] Volume: `/usr/share/elasticsearch/data`
  - [ ] Heap size: 512MB max

### Step 4: Application Services
- [ ] Create Backend API service
  - [ ] Source: Git repository
  - [ ] Dockerfile: `backend/Dockerfile`
  - [ ] Port: 3000
  - [ ] Health check: `GET /api/health`
  - [ ] Environment variables added
  
- [ ] Create Geospatial Service
  - [ ] Source: Git repository
  - [ ] Dockerfile: `backend/Dockerfile.geospatial`
  - [ ] Port: 8001
  - [ ] Health check: `GET /health`
  
- [ ] Create Frontend service
  - [ ] Source: Git repository
  - [ ] Dockerfile: `frontend/Dockerfile`
  - [ ] Port: 3000
  - [ ] Health check: `GET /`

### Step 5: Networking & Domains
- [ ] Configure reverse proxy (Traefik)
- [ ] Set custom domain for backend: `api.yourdomain.com`
- [ ] Set custom domain for frontend: `app.yourdomain.com`
- [ ] Set custom domain for geo-service: `geo-service.yourdomain.com`
- [ ] Enable SSL/TLS (Let's Encrypt)
- [ ] Configure DNS records (A or CNAME)

---

## Deployment ✓

### Step 1: Deploy Services
- [ ] Deploy PostgreSQL (wait for healthy)
- [ ] Deploy Redis (wait for healthy)
- [ ] Deploy Elasticsearch (wait for healthy)
- [ ] Deploy Backend API (wait for healthy)
- [ ] Deploy Geospatial Service (wait for healthy)
- [ ] Deploy Frontend (wait for healthy)

### Step 2: Database Setup
- [ ] SSH into Coolify server
- [ ] Run database migrations: `docker-compose exec backend npm run typeorm migration:run`
- [ ] Seed initial data (if applicable)
- [ ] Verify tables created: `docker exec postgres psql -U postgres -d realestate_prod -c "\dt"`

### Step 3: Health Verification
- [ ] Backend API responding: `curl https://api.yourdomain.com/api/health`
- [ ] Frontend accessible: `curl https://app.yourdomain.com`
- [ ] Geospatial service responding: `curl https://geo-service.yourdomain.com/health`
- [ ] SSL certificates valid: `curl -I https://api.yourdomain.com`

### Step 4: Feature Testing
- [ ] Home page loads correctly
- [ ] Property search works
- [ ] Map displays
- [ ] API endpoints responding
- [ ] Database queries working
- [ ] Images loading
- [ ] Forms submitting data

---

## Post-Deployment ✓

### Monitoring Setup
- [ ] Enable Coolify logs collection
- [ ] Configure log retention (14+ days)
- [ ] Set up alerts for:
  - [ ] Service unhealthy
  - [ ] CPU usage > 80%
  - [ ] Memory usage > 85%
  - [ ] Disk space < 10%

### Backup Configuration
- [ ] Enable PostgreSQL backups
- [ ] Set backup schedule: Daily
- [ ] Set retention: 30 days
- [ ] Test backup restoration
- [ ] Configure off-site backup (if critical)

### SSL/TLS
- [ ] Verify Let's Encrypt auto-renewal enabled
- [ ] Check certificate expiry: `docker exec nginx-container curl -I https://yourdomain.com`
- [ ] Certificate should be valid 89 days

### Performance Tuning
- [ ] Enable caching headers
- [ ] Configure CDN (CloudFlare optional)
- [ ] Optimize database indexes
- [ ] Monitor response times
- [ ] Set up performance alerts

### Security Hardening
- [ ] Enable firewall rules
- [ ] Close unnecessary ports
- [ ] Review CORS configuration
- [ ] Enable rate limiting
- [ ] Set up DDoS protection
- [ ] Review access logs
- [ ] Configure Web Application Firewall (WAF)

### Team Access
- [ ] Create Coolify user accounts for team members
- [ ] Set appropriate permission levels
- [ ] Configure SSH keys for server access
- [ ] Document access procedures

---

## Ongoing Maintenance ✓

### Weekly
- [ ] Check Coolify dashboard for alerts
- [ ] Review error logs
- [ ] Monitor performance metrics
- [ ] Test backups exist

### Monthly
- [ ] Review security logs
- [ ] Update dependencies
- [ ] Check for pending updates in Coolify
- [ ] Verify SSL certificate renewal status
- [ ] Database optimization (VACUUM, ANALYZE)

### Quarterly
- [ ] Full disaster recovery test
- [ ] Update documentation
- [ ] Review resource allocation
- [ ] Plan capacity scaling if needed

---

## Deployment Troubleshooting Quick Links

| Issue | Solution |
|-------|----------|
| Services won't start | [See Troubleshooting #1](COOLIFY_TROUBLESHOOTING.md#1-services-wont-start) |
| Database connection failed | [See Troubleshooting #2](COOLIFY_TROUBLESHOOTING.md#2-database-connection-failed) |
| Frontend can't reach backend | [See Troubleshooting #3](COOLIFY_TROUBLESHOOTING.md#3-frontend-cant-connect-to-backend-api) |
| SSL issues | [See Troubleshooting #4](COOLIFY_TROUBLESHOOTING.md#4-ssl-certificate-issues) |
| Out of memory | [See Troubleshooting #5](COOLIFY_TROUBLESHOOTING.md#5-out-of-memory-oom-errors) |
| Elasticsearch won't start | [See Troubleshooting #6](COOLIFY_TROUBLESHOOTING.md#6-elasticsearch-wont-start) |
| Slow API | [See Troubleshooting #7](COOLIFY_TROUBLESHOOTING.md#7-slow-api-response--timeouts) |

---

## Emergency Procedures

### Rollback to Previous Version
```bash
# In Coolify:
1. Go to Service → Settings
2. Click "Rollback" to previous deployment
3. Monitor logs
```

### Restart All Services
```bash
# SSH to server
docker-compose restart

# Wait for health checks
sleep 30
docker-compose ps
```

### Emergency Stop
```bash
docker-compose down
# Warning: This stops all services including databases
```

### Force Redeploy
```bash
docker-compose up -d --force-recreate --build
```

---

## Success Criteria

App is successfully deployed when:

✅ All services show "healthy" in Coolify dashboard
✅ Frontend accessible at custom domain with valid SSL
✅ Backend API responding with 200 status
✅ Database migrations completed successfully
✅ No error logs in past 1 hour
✅ CPU usage < 50%
✅ Memory usage < 60%
✅ API response time < 1 second average
✅ All features working (search, map, properties, etc.)
✅ Images and static assets loading
✅ Email notifications working (if configured)
✅ Backups running on schedule
✅ SSL certificate valid and auto-renewing

---

## Contact & Support

- **Coolify Docs**: https://docs.coolfiy.io
- **Coolify Community**: https://coolfiy.io/community
- **Issue Tracker**: File issues in your repository

---

## Deployment Completed ✓

**Deployment Date**: ________________
**Server IP**: ________________
**Domain**: ________________
**Notes**: 

_________________________________
_________________________________
_________________________________
