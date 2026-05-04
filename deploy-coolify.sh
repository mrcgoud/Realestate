#!/bin/bash

# Coolify Deployment Script for RealEstate App
# This script helps automate the deployment process

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}RealEstate Coolify Deployment${NC}"
echo -e "${BLUE}================================${NC}\n"

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file not found. Creating from .env.example...${NC}"
    cp .env.example .env
    echo -e "${YELLOW}Please edit .env with your production credentials${NC}"
    exit 1
fi

# Check Docker
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}❌ Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

# Check Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo -e "${YELLOW}❌ Docker Compose is not installed. Please install Docker Compose first.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Docker and Docker Compose are installed${NC}\n"

# Load environment variables
export $(cat .env | grep -v '#' | xargs)

echo -e "${BLUE}Starting services...${NC}\n"

# Use production docker-compose file
if [ "$1" = "production" ]; then
    echo -e "${BLUE}🚀 Deploying in PRODUCTION mode...${NC}"
    docker-compose -f docker-compose.prod.yml --env-file .env up -d
else
    echo -e "${BLUE}🚀 Deploying in DEVELOPMENT mode...${NC}"
    docker-compose -f docker-compose.yml --env-file .env up -d
fi

echo -e "\n${BLUE}Waiting for services to be ready...${NC}"
sleep 10

# Check service health
echo -e "\n${BLUE}Checking service health...${NC}"

check_service() {
    local service_name=$1
    local port=$2
    local endpoint=$3
    
    if curl -sf "http://localhost:${port}${endpoint}" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ $service_name is healthy${NC}"
        return 0
    else
        echo -e "${YELLOW}⚠️  $service_name may still be starting...${NC}"
        return 1
    fi
}

# Check services
check_service "Backend API" "3000" "/api/health"
check_service "Frontend" "3001" "/"
check_service "Geo Service" "8001" "/health"

echo -e "\n${BLUE}Running database migrations...${NC}"

# Run migrations
if docker-compose ps backend > /dev/null 2>&1; then
    docker-compose exec -T backend npm run typeorm migration:run 2>/dev/null || echo "ℹ️  No pending migrations"
fi

echo -e "\n${GREEN}================================${NC}"
echo -e "${GREEN}✓ Deployment Complete!${NC}"
echo -e "${GREEN}================================${NC}\n"

echo -e "Services running at:"
echo -e "${BLUE}Backend API:${NC}     http://localhost:3000"
echo -e "${BLUE}Frontend:${NC}       http://localhost:3001"
echo -e "${BLUE}Geo Service:${NC}    http://localhost:8001"
echo -e "\n${YELLOW}For Coolify deployment:${NC}"
echo -e "1. Push to your Git repository"
echo -e "2. Add repository to Coolify"
echo -e "3. Configure environment variables"
echo -e "4. Set up custom domains and SSL"
echo -e "5. Monitor logs in Coolify dashboard"

# Display logs
read -p "Would you like to see live logs? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    docker-compose logs -f
fi
