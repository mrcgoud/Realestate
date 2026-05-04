import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Between, MoreThan, LessThan } from 'typeorm';
import { Property, PropertyType, PropertyStatus } from './entities/property.entity';
import { PropertyImage } from './entities/property-image.entity';
import { CreatePropertyDto, UpdatePropertyDto, SearchPropertyDto } from './dto';

@Injectable()
export class PropertiesService {
  constructor(
    @InjectRepository(Property)
    private propertyRepository: Repository<Property>,
    @InjectRepository(PropertyImage)
    private propertyImageRepository: Repository<PropertyImage>,
  ) {}

  async create(createPropertyDto: CreatePropertyDto, ownerId: string): Promise<Property> {
    const property = this.propertyRepository.create({
      ...createPropertyDto,
      ownerId,
      location: {
        type: 'Point',
        coordinates: [createPropertyDto.longitude, createPropertyDto.latitude],
      },
    });

    const pricePerSqFt = createPropertyDto.price / createPropertyDto.areaSquareFeet;
    property.pricePerSquareFoot = parseFloat(pricePerSqFt.toFixed(2));

    return this.propertyRepository.save(property);
  }

  async findAll(limit = 10, offset = 0) {
    const [properties, total] = await this.propertyRepository.findAndCount({
      take: limit,
      skip: offset,
      relations: ['owner', 'images'],
      order: { createdAt: 'DESC' },
      where: { status: PropertyStatus.AVAILABLE },
    });

    return { properties, total };
  }

  async findOne(id: string): Promise<Property> {
    const property = await this.propertyRepository.findOne({
      where: { id },
      relations: ['owner', 'images'],
    });

    if (!property) {
      throw new NotFoundException(`Property with id ${id} not found`);
    }

    // Increment views
    property.views += 1;
    await this.propertyRepository.save(property);

    return property;
  }

  async findByOwner(ownerId: string, limit = 10, offset = 0) {
    const [properties, total] = await this.propertyRepository.findAndCount({
      where: { ownerId },
      take: limit,
      skip: offset,
      relations: ['images'],
      order: { createdAt: 'DESC' },
    });

    return { properties, total };
  }

  async update(id: string, updatePropertyDto: UpdatePropertyDto): Promise<Property> {
    const property = await this.findOne(id);

    Object.assign(property, updatePropertyDto);

    if (updatePropertyDto.latitude && updatePropertyDto.longitude) {
      property.location = {
        type: 'Point',
        coordinates: [updatePropertyDto.longitude, updatePropertyDto.latitude],
      };

      const pricePerSqFt =
        property.price / property.areaSquareFeet;
      property.pricePerSquareFoot = parseFloat(pricePerSqFt.toFixed(2));
    }

    return this.propertyRepository.save(property);
  }

  async search(searchDto: SearchPropertyDto) {
    let query = this.propertyRepository.createQueryBuilder('property');

    // Filter by type
    if (searchDto.types && searchDto.types.length > 0) {
      query = query.where('property.type IN (:types)', { types: searchDto.types });
    }

    // Filter by price range
    if (searchDto.minPrice !== undefined && searchDto.maxPrice !== undefined) {
      query = query.andWhere('property.price BETWEEN :minPrice AND :maxPrice', {
        minPrice: searchDto.minPrice,
        maxPrice: searchDto.maxPrice,
      });
    }

    // Filter by bedrooms
    if (searchDto.bedrooms !== undefined) {
      query = query.andWhere('property.bedrooms >= :bedrooms', {
        bedrooms: searchDto.bedrooms,
      });
    }

    // Filter by bathrooms
    if (searchDto.bathrooms !== undefined) {
      query = query.andWhere('property.bathrooms >= :bathrooms', {
        bathrooms: searchDto.bathrooms,
      });
    }

    // Filter by location (city)
    if (searchDto.city) {
      query = query.andWhere('property.city ILIKE :city', {
        city: `%${searchDto.city}%`,
      });
    }

    // Geographic search (distance-based)
    if (searchDto.latitude && searchDto.longitude && searchDto.radiusKm) {
      query = query.andWhere(
        `ST_DistanceSphere(property.location, ST_GeomFromText(:point)) <= :distance`,
        {
          point: `POINT(${searchDto.longitude} ${searchDto.latitude})`,
          distance: searchDto.radiusKm * 1000,
        },
      );
    }

    query = query
      .leftJoinAndSelect('property.owner', 'owner')
      .leftJoinAndSelect('property.images', 'images')
      .where('property.status = :status', { status: PropertyStatus.AVAILABLE })
      .orderBy('property.createdAt', 'DESC')
      .take(searchDto.limit || 10)
      .skip(searchDto.offset || 0);

    const [properties, total] = await query.getManyAndCount();

    return { properties, total };
  }

  async addImage(propertyId: string, imageUrl: string, isPrimary = false) {
    const property = await this.findOne(propertyId);

    const image = this.propertyImageRepository.create({
      propertyId,
      url: imageUrl,
      isPrimary,
    });

    return this.propertyImageRepository.save(image);
  }

  async removeImage(imageId: string) {
    await this.propertyImageRepository.delete(imageId);
  }

  async delete(id: string): Promise<void> {
    const property = await this.findOne(id);
    property.deletedAt = new Date();
    await this.propertyRepository.save(property);
  }

  async getNearbyCom mitities(latitude: number, longitude: number, radiusKm: number) {
    // This will be called by geospatial service
    return await this.propertyRepository.query(`
      SELECT 
        id,
        title,
        price,
        ST_AsGeoJSON(location) as location,
        ST_Distance(location, ST_GeomFromText('POINT(${longitude} ${latitude})', 4326)) / 1000 as distance
      FROM properties
      WHERE ST_DistanceSphere(location, ST_GeomFromText('POINT(${longitude} ${latitude})', 4326)) <= ${radiusKm * 1000}
      AND status = '${PropertyStatus.AVAILABLE}'
      ORDER BY distance
      LIMIT 50
    `);
  }

  async getHeatmapData(minLat: number, maxLat: number, minLng: number, maxLng: number) {
    return await this.propertyRepository.query(`
      SELECT 
        id,
        latitude,
        longitude,
        price,
        ST_AsGeoJSON(location) as location
      FROM properties
      WHERE latitude BETWEEN ${minLat} AND ${maxLat}
      AND longitude BETWEEN ${minLng} AND ${maxLng}
      AND status = '${PropertyStatus.AVAILABLE}'
    `);
  }
}
