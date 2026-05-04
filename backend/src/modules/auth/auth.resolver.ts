import { Resolver, Mutation, Query, Args, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, RefreshTokenDto } from './dto';
import { User } from '@modules/users/entities/user.entity';
import { GqlJwtAuthGuard } from './guards/gql-jwt-auth.guard';

@Resolver()
export class AuthResolver {
  constructor(private authService: AuthService) {}

  @Mutation(() => String)
  async register(@Args('input') registerDto: RegisterDto) {
    const result = await this.authService.register(registerDto);
    return JSON.stringify(result);
  }

  @Mutation(() => String)
  async login(@Args('input') loginDto: LoginDto) {
    const result = await this.authService.login(loginDto);
    return JSON.stringify(result);
  }

  @Mutation(() => String)
  async refreshToken(@Args('input') refreshTokenDto: RefreshTokenDto) {
    const result = await this.authService.refreshToken(refreshTokenDto);
    return JSON.stringify(result);
  }

  @Query(() => User)
  @UseGuards(GqlJwtAuthGuard)
  async me(@Context() context) {
    return context.req.user;
  }
}
