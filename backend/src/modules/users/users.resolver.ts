import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlJwtAuthGuard } from '@modules/auth/guards/gql-jwt-auth.guard';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { UpdateUserDto, UpdatePreferencesDto } from './dto';

@Resolver(() => User)
export class UsersResolver {
  constructor(private usersService: UsersService) {}

  @Query(() => User)
  @UseGuards(GqlJwtAuthGuard)
  async me(@Context() context) {
    return this.usersService.findOne(context.req.user.id);
  }

  @Query(() => User)
  async user(@Args('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Query(() => [User])
  async users(
    @Args('limit', { defaultValue: 10 }) limit: number,
    @Args('offset', { defaultValue: 0 }) offset: number,
  ) {
    const result = await this.usersService.findAll(limit, offset);
    return result.users;
  }

  @Mutation(() => User)
  @UseGuards(GqlJwtAuthGuard)
  async updateProfile(
    @Context() context,
    @Args('input') updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(context.req.user.id, updateUserDto);
  }

  @Mutation(() => User)
  @UseGuards(GqlJwtAuthGuard)
  async updatePreferences(
    @Context() context,
    @Args('input') preferencesDto: UpdatePreferencesDto,
  ) {
    return this.usersService.updatePreferences(
      context.req.user.id,
      preferencesDto,
    );
  }

  @Mutation(() => User)
  @UseGuards(GqlJwtAuthGuard)
  async addFavorite(
    @Context() context,
    @Args('propertyId') propertyId: string,
  ) {
    return this.usersService.addFavorite(context.req.user.id, propertyId);
  }

  @Mutation(() => User)
  @UseGuards(GqlJwtAuthGuard)
  async removeFavorite(
    @Context() context,
    @Args('propertyId') propertyId: string,
  ) {
    return this.usersService.removeFavorite(context.req.user.id, propertyId);
  }
}
