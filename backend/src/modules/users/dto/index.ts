import { InputType, Field, PartialType } from '@nestjs/graphql';
import {
  IsEmail,
  IsString,
  IsOptional,
  IsBoolean,
  IsArray,
  IsObject,
} from 'class-validator';

@InputType()
export class CreateUserDto {
  @Field()
  @IsEmail()
  email: string;

  @Field()
  @IsString()
  firstName: string;

  @Field()
  @IsString()
  lastName: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  phone?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  password?: string;
}

@InputType()
export class UpdateUserDto {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  firstName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  lastName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  phone?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  avatar?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  bio?: string;
}

@InputType()
export class UpdatePreferencesDto {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  currency?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  language?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  notifications?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  newsletter?: boolean;
}

@InputType()
export class UpdateKycDto {
  @Field()
  @IsString()
  documentType: string;

  @Field()
  @IsString()
  documentNumber: string;

  @Field()
  @IsString()
  frontImageUrl: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  backImageUrl?: string;
}
