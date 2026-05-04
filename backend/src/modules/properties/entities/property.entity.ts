import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { ObjectType, Field, ID, Float, Int } from '@nestjs/graphql';
import { Point } from 'geojson';
import { User } from '@modules/users/entities/user.entity';
import { PropertyImage } from './property-image.entity';

export enum PropertyType {
  APARTMENT = 'apartment',
  HOUSE = 'house',
  COMMERCIAL = 'commercial',
  LAND = 'land',
  OFFICE = 'office',
  VILLA = 'villa',
}

export enum PropertyStatus {
  AVAILABLE = 'available',
  SOLD = 'sold',
  RENTED = 'rented',
  PENDING = 'pending',
  DELISTED = 'delisted',
}

@ObjectType()
@Entity('properties')
@Index(['location', 'status'])
@Index(['createdAt'])
export class Property {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  title: string;

  @Field()
  @Column('text')
  description: string;

  @Field(() => Float)
  @Column('numeric', { precision: 15, scale: 2 })
  price: number;

  @Field(() => PropertyType)
  @Column({ type: 'enum', enum: PropertyType })
  type: PropertyType;

  @Field(() => PropertyStatus)
  @Column({ type: 'enum', enum: PropertyStatus, default: PropertyStatus.AVAILABLE })
  status: PropertyStatus;

  @Field()
  @Column()
  address: string;

  @Field()
  @Column()
  city: string;

  @Field()
  @Column()
  state: string;

  @Field()
  @Column()
  postalCode: string;

  @Field()
  @Column()
  country: string;

  @Field(() => Float)
  @Column('numeric', { precision: 10, scale: 8 })
  latitude: number;

  @Field(() => Float)
  @Column('numeric', { precision: 11, scale: 8 })
  longitude: number;

  @Column({
    type: 'geometry',
    spatialFeatureType: 'Point',
    srid: 4326,
    nullable: true,
  })
  location: Point;

  @Field(() => Int)
  @Column()
  bedrooms: number;

  @Field(() => Int)
  @Column()
  bathrooms: number;

  @Field(() => Float)
  @Column('numeric', { precision: 10, scale: 2 })
  areaSquareFeet: number;

  @Field()
  @Column()
  yearBuilt: number;

  @Field()
  @Column({ type: 'text', nullable: true })
  features: string;

  @Field()
  @Column({ type: 'jsonb', nullable: true })
  amenities: string[];

  @Field(() => Float, { nullable: true })
  @Column('numeric', { precision: 10, scale: 2, nullable: true })
  pricePerSquareFoot: number;

  @Field()
  @Column({ default: 0 })
  views: number;

  @Field()
  @Column({ default: 0 })
  favorites: number;

  @Field()
  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    taxRecords?: string;
    lastSalePrice?: number;
    lastSaleDate?: Date;
    daysOnMarket?: number;
  };

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.properties)
  @JoinColumn()
  owner: User;

  @Column()
  ownerId: string;

  @Field(() => [PropertyImage], { nullable: true })
  @OneToMany(() => PropertyImage, (image) => image.property)
  images: PropertyImage[];

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  deletedAt: Date;
}
