# Backend - NestJS Core API

## Project Structure

```
backend/
├── src/
│   ├── main.ts                    # Entry point
│   ├── app.module.ts              # Root module
│   │
│   ├── auth/                      # Authentication module
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.module.ts
│   │   ├── strategies/
│   │   │   ├── jwt.strategy.ts
│   │   │   └── oauth.strategy.ts
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts
│   │   │   └── roles.guard.ts
│   │   ├── decorators/
│   │   │   ├── current-user.decorator.ts
│   │   │   └── public.decorator.ts
│   │   ├── dto/
│   │   │   ├── signup.dto.ts
│   │   │   ├── login.dto.ts
│   │   │   └── auth-payload.dto.ts
│   │   └── entities/
│   │       └── user.entity.ts
│   │
│   ├── users/                     # Users module
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   ├── users.module.ts
│   │   ├── users.repository.ts
│   │   ├── dto/
│   │   │   ├── create-user.dto.ts
│   │   │   ├── update-user.dto.ts
│   │   │   └── user-response.dto.ts
│   │   └── entities/
│   │       └── user.entity.ts
│   │
│   ├── properties/                # Properties module
│   │   ├── properties.controller.ts
│   │   ├── properties.service.ts
│   │   ├── properties.module.ts
│   │   ├── properties.repository.ts
│   │   ├── dto/
│   │   │   ├── create-property.dto.ts
│   │   │   ├── update-property.dto.ts
│   │   │   └── property-filter.dto.ts
│   │   └── entities/
│   │       └── property.entity.ts
│   │
│   ├── search/                    # Search module
│   │   ├── search.controller.ts
│   │   ├── search.service.ts
│   │   ├── search.module.ts
│   │   ├── search.repository.ts
│   │   └── dto/
│   │       └── search-query.dto.ts
│   │
│   ├── geospatial/               # Geospatial services
│   │   ├── geospatial.service.ts  # Client for Python service
│   │   ├── geospatial.module.ts
│   │   ├── dto/
│   │   │   ├── isochrone.dto.ts
│   │   │   └── heatmap.dto.ts
│   │   └── types/
│   │       └── geo.types.ts
│   │
│   ├── ai/                        # AI/ML features
│   │   ├── ai.service.ts
│   │   ├── price-predictor.ts
│   │   ├── fraud-detector.ts
│   │   ├── ai.module.ts
│   │   └── dto/
│   │       └── price-estimate.dto.ts
│   │
│   ├── upload/                    # File uploads
│   │   ├── upload.controller.ts
│   │   ├── upload.service.ts
│   │   ├── upload.module.ts
│   │   ├── s3.service.ts          # AWS S3
│   │   └── dto/
│   │       └── upload.dto.ts
│   │
│   ├── notifications/             # Notifications
│   │   ├── notifications.service.ts
│   │   ├── email.service.ts
│   │   ├── sms.service.ts
│   │   ├── push.service.ts
│   │   ├── notifications.module.ts
│   │   └── queue/
│   │       └── notifications.queue.ts
│   │
│   ├── analytics/                 # Analytics
│   │   ├── analytics.controller.ts
│   │   ├── analytics.service.ts
│   │   ├── analytics.module.ts
│   │   └── dto/
│   │       └── analytics-query.dto.ts
│   │
│   ├── messaging/                 # In-app chat
│   │   ├── messaging.gateway.ts   # WebSocket
│   │   ├── messaging.service.ts
│   │   ├── messaging.module.ts
│   │   └── dto/
│   │       └── message.dto.ts
│   │
│   ├── common/
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts
│   │   ├── interceptors/
│   │   │   ├── logging.interceptor.ts
│   │   │   ├── response.interceptor.ts
│   │   │   └── timeout.interceptor.ts
│   │   ├── decorators/
│   │   │   ├── current-user.decorator.ts
│   │   │   └── roles.decorator.ts
│   │   ├── guards/
│   │   │   └── rate-limit.guard.ts
│   │   ├── pipes/
│   │   │   └── validation.pipe.ts
│   │   └── types/
│   │       └── index.ts
│   │
│   ├── database/
│   │   ├── typeorm.config.ts      # Database config
│   │   └── migrations/
│   │       └── *.migration.ts
│   │
│   ├── config/
│   │   ├── app.config.ts
│   │   ├── database.config.ts
│   │   ├── jwt.config.ts
│   │   └── s3.config.ts
│   │
│   └── graphql/                   # GraphQL schema
│       ├── schema.gql
│       ├── resolvers/
│       │   ├── property.resolver.ts
│       │   ├── user.resolver.ts
│       │   ├── search.resolver.ts
│       │   └── geo.resolver.ts
│       └── types/
│           └── *.ts
│
├── geo-services/                  # Python microservice
│   ├── main.py
│   ├── requirements.txt
│   ├── app/
│   │   ├── routers/
│   │   │   ├── isochrone.py
│   │   │   ├── heatmap.py
│   │   │   ├── flood.py
│   │   │   └── analytics.py
│   │   └── services/
│   │       ├── geospatial.py
│   │       ├── oroute.py     # OpenRouteService
│   │       └── ml_models.py
│   └── Dockerfile
│
├── docker/
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── nginx.conf
│
├── .env.example
├── .dockerignore
├── package.json
├── tsconfig.json
├── jest.config.js
├── Dockerfile
└── README.md
```

## Key Dependencies

```json
{
  "dependencies": {
    "@nestjs/common": "^10.2.0",
    "@nestjs/core": "^10.2.0",
    "@nestjs/platform-express": "^10.2.0",
    
    "@nestjs/graphql": "^12.0.0",
    "@nestjs/apollo": "^12.0.0",
    "apollo-server-express": "^4.9.0",
    "@apollo/client": "^3.8.0",
    "type-graphql": "^2.0.0",
    
    "@nestjs/typeorm": "^9.0.0",
    "typeorm": "^0.3.0",
    "pg": "^8.11.0",
    "postgis": "^2.0.0",
    
    "@nestjs/jwt": "^10.1.0",
    "@nestjs/passport": "^10.0.0",
    "passport": "^0.6.0",
    "passport-jwt": "^4.0.1",
    "passport-google-oauth20": "^2.0.0",
    "bcrypt": "^5.1.0",
    
    "@nestjs/config": "^3.0.0",
    "@nestjs/cache-manager": "^2.0.0",
    "cache-manager": "^5.2.0",
    "cache-manager-redis-store": "^3.0.0",
    
    "@nestjs/bull": "^10.0.0",
    "bull": "^4.11.0",
    "redis": "^4.6.0",
    
    "@nestjs/websockets": "^10.2.0",
    "@nestjs/platform-ws": "^10.2.0",
    
    "aws-sdk": "^2.1488.0",
    "@aws-sdk/client-s3": "^3.425.0",
    
    "axios": "^1.6.0",
    "class-validator": "^0.14.0",
    "class-transformer": "^0.5.0",
    "openroute-js": "^1.1.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/express": "^4.17.0",
    "typescript": "^5.3.0",
    "@nestjs/testing": "^10.2.0",
    "jest": "^29.0.0",
    "@types/jest": "^29.0.0",
    "ts-jest": "^29.0.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "prettier": "^3.0.0"
  }
}
```

## Environment Variables

```env
# Server
NODE_ENV=development
PORT=3000
LOG_LEVEL=debug

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/realestate_db
DB_SYNC=false
DB_MIGRATIONS=true

# JWT Auth
JWT_SECRET=your_jwt_secret
JWT_EXPIRATION=24h
REFRESH_TOKEN_SECRET=your_refresh_secret
REFRESH_TOKEN_EXPIRATION=7d

# OAuth
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback

# AWS S3
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
S3_BUCKET_NAME=realestate-uploads
S3_BUCKET_URL=https://your-bucket.s3.amazonaws.com

# Redis (caching & messaging)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Geospatial Services
GEO_SERVICE_URL=http://localhost:8001
OPENROUTE_API_KEY=your_key
ISRO_BHUVAN_KEY=your_key

# Email
SENDGRID_API_KEY=your_key
SENDGRID_FROM_EMAIL=noreply@realestate.com

# SMS
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=+1234567890

# GraphQL
GRAPHQL_PLAYGROUND=true
GRAPHQL_DEBUG=true

# Monitoring
SENTRY_DSN=your_dsn
DATADOG_API_KEY=your_key
```

## Sample Code

### Property Service

```typescript
// src/properties/properties.service.ts
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Property } from './entities/property.entity';
import { CreatePropertyDto } from './dto/create-property.dto';
import { GeospatialService } from '../geospatial/geospatial.service';

@Injectable()
export class PropertiesService {
  constructor(
    @InjectRepository(Property)
    private propertyRepository: Repository<Property>,
    private geospatialService: GeospatialService,
  ) {}

  async create(createPropertyDto: CreatePropertyDto, userId: string) {
    // Get flood risk at property location
    const floodRisk = await this.geospatialService.getFloodRisk({
      latitude: createPropertyDto.latitude,
      longitude: createPropertyDto.longitude,
    });

    // Get nearby infrastructure
    const infrastructure = await this.geospatialService.getNearbyInfrastructure(
      {
        latitude: createPropertyDto.latitude,
        longitude: createPropertyDto.longitude,
        radiusMeters: 1500,
      },
    );

    const property = this.propertyRepository.create({
      ...createPropertyDto,
      ownerId: userId,
      geom: {
        type: 'Point',
        coordinates: [createPropertyDto.longitude, createPropertyDto.latitude],
      },
      floodRiskLevel: floodRisk?.riskLevel,
    });

    return this.propertyRepository.save(property);
  }

  async searchByLocation(
    latitude: number,
    longitude: number,
    radiusMeters: number = 2000,
  ) {
    // PostGIS query: find properties within radius
    return this.propertyRepository.query(`
      SELECT id, title, price, 
             ST_Distance(geom, ST_Point($1, $2)) as distance
      FROM properties
      WHERE ST_DWithin(geom, ST_Point($1, $2), $3)
      AND status = 'active'
      ORDER BY distance ASC
      LIMIT 20
    `, [longitude, latitude, radiusMeters]);
  }

  async findNearby(id: string, radiusKm: number = 2) {
    return this.propertyRepository.query(`
      SELECT p1.id, p1.title, p1.price
      FROM properties p1
      JOIN properties p2 ON p2.id = $1
      WHERE ST_DWithin(p1.geom, p2.geom, $2)
      AND p1.id != p2.id
      ORDER BY p1.price ASC
      LIMIT 10
    `, [id, radiusKm * 1000]);
  }
}
```

### Geospatial Service (calls Python backend)

```typescript
// src/geospatial/geospatial.service.ts
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GeospatialService {
  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {}

  async getIsochrone(
    latitude: number,
    longitude: number,
    minutes: number,
    transitType: string,
  ) {
    const url = `${this.configService.get('GEO_SERVICE_URL')}/isochrone`;
    const { data } = await this.httpService.axiosRef.post(url, {
      center: [longitude, latitude],
      minutes,
      transit_type: transitType,
    });
    return data;
  }

  async getNearbyInfrastructure(
    latitude: number,
    longitude: number,
    radiusMeters: number = 1500,
  ) {
    const url = `${this.configService.get('GEO_SERVICE_URL')}/infrastructure`;
    const { data } = await this.httpService.axiosRef.get(url, {
      params: {
        lat: latitude,
        lon: longitude,
        radius: radiusMeters,
      },
    });
    return data;
  }

  async getFloodRisk(latitude: number, longitude: number) {
    const url = `${this.configService.get('GEO_SERVICE_URL')}/flood-risk`;
    const { data } = await this.httpService.axiosRef.get(url, {
      params: {
        lat: latitude,
        lon: longitude,
      },
    });
    return data;
  }

  async getPriceHeatmap(bounds: {
    minLat: number;
    maxLat: number;
    minLon: number;
    maxLon: number;
  }) {
    const url = `${this.configService.get('GEO_SERVICE_URL')}/heatmap`;
    const { data } = await this.httpService.axiosRef.get(url, {
      params: bounds,
    });
    return data;
  }
}
```

## Running Locally

```bash
# Install dependencies
npm install

# Run database migrations
npm run migration:run

# Start development server
npm run start:dev

# Run tests
npm run test

# Linting
npm run lint
```

## Docker Deployment

```bash
docker build -t realestate-backend .
docker run -p 3000:3000 --env-file .env realestate-backend
```

## Performance Tips

- Use DataLoader to prevent N+1 queries
- Implement caching with Redis
- Use PostGIS spatial indexes
- Pagination on all list endpoints
- Background jobs for heavy operations (Bull/Celery)
- Rate limiting on all endpoints
