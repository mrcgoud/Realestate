import { InputType, Field, Float, Int } from '@nestjs/graphql';
import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  IsArray,
  IsBoolean,
  Min,
  Max,
} from 'class-validator';
import { PropertyType, PropertyStatus } from '../entities/property.entity';

@InputType()
export class CreatePropertyDto {
  @Field()
  @IsString()
  title: string;

  @Field()
  @IsString()
  description: string;

  @Field(() => Float)
  @IsNumber()
  price: number;

  @Field(() => PropertyType)
  @IsEnum(PropertyType)
  type: PropertyType;

  @Field()
  @IsString()
  address: string;

  @Field()
  @IsString()
  city: string;

  @Field()
  @IsString()
  state: string;

  @Field()
  @IsString()
  postalCode: string;

  @Field()
  @IsString()
  country: string;

  @Field(() => Float)
  @IsNumber()
  latitude: number;

  @Field(() => Float)
  @IsNumber()
  longitude: number;

  @Field(() => Int)
  @IsNumber()
  bedrooms: number;

  @Field(() => Int)
  @IsNumber()
  bathrooms: number;

  @Field(() => Float)
  @IsNumber()
  areaSquareFeet: number;

  @Field(() => Int)
  @IsNumber()
  yearBuilt: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  features?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  amenities?: string[];
}

@InputType()
export class UpdatePropertyDto {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  title?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  price?: number;

  @Field(() => PropertyStatus, { nullable: true })
  @IsOptional()
  @IsEnum(PropertyStatus)
  status?: PropertyStatus;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  features?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  amenities?: string[];

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  longitude?: number;
}

@InputType()
export class SearchPropertyDto {
  @Field(() => [PropertyType], { nullable: true })
  @IsOptional()
  @IsArray()
  types?: PropertyType[];

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  minPrice?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  maxPrice?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  bedrooms?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  bathrooms?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  city?: string;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  radiusKm?: number;

  @Field(() => Int, { defaultValue: 10 })
  @IsOptional()
  @IsNumber()
  limit?: number;

  @Field(() => Int, { defaultValue: 0 })
  @IsOptional()
  @IsNumber()
  offset?: number;
}
