import { IsEmail, IsString, MinLength, IsEnum, IsOptional } from 'class-validator';
import { InputType, Field } from '@nestjs/graphql';
import { UserRole } from '@modules/users/entities/user.entity';

@InputType()
export class RegisterDto {
  @Field()
  @IsEmail()
  email: string;

  @Field()
  @IsString()
  @MinLength(8)
  password: string;

  @Field()
  @IsString()
  firstName: string;

  @Field()
  @IsString()
  lastName: string;

  @Field(() => String, { defaultValue: UserRole.BUYER })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}

@InputType()
export class LoginDto {
  @Field()
  @IsEmail()
  email: string;

  @Field()
  @IsString()
  @MinLength(8)
  password: string;
}

@InputType()
export class RefreshTokenDto {
  @Field()
  @IsString()
  refreshToken: string;
}

@InputType()
export class ChangePasswordDto {
  @Field()
  @IsString()
  oldPassword: string;

  @Field()
  @IsString()
  @MinLength(8)
  newPassword: string;
}

@InputType()
export class ForgotPasswordDto {
  @Field()
  @IsEmail()
  email: string;
}

@InputType()
export class ResetPasswordDto {
  @Field()
  @IsString()
  token: string;

  @Field()
  @IsString()
  @MinLength(8)
  newPassword: string;
}
