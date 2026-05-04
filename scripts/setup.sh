#!/bin/bash

# Real Estate Platform - Quick Start Script

echo "🚀 Starting Real Estate Platform Setup..."

# Create .env files if they don't exist
if [ ! -f backend/.env ]; then
  echo "📝 Creating backend/.env..."
  cp backend/.env.example backend/.env
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
  echo "❌ Docker is not installed. Please install Docker first."
  exit 1
fi

# Start services
echo "🐳 Starting Docker services..."
docker-compose up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be healthy..."
sleep 15

# Run migrations
echo "🔄 Running database migrations..."
docker-compose exec -T backend npm run migration:run

# Seed database (optional)
#echo "🌱 Seeding database..."
#docker-compose exec -T backend npm run seed

echo "✅ Setup complete!"
echo ""
echo "🌐 Services are now running at:"
echo "   - Backend API: http://localhost:3000"
echo "   - GraphQL: http://localhost:3000/graphql"
echo "   - Swagger Docs: http://localhost:3000/api/docs"
echo "   - PostgreSQL: localhost:5432 (postgres:postgres)"
echo "   - Redis: localhost:6379"
echo "   - Elasticsearch: http://localhost:9200"
echo "   - PgAdmin: http://localhost:5050"
echo "   - Martin Tiles: http://localhost:3856"
echo ""
echo "📚 View logs: docker-compose logs -f"
echo "🛑 Stop services: docker-compose down"
