import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlJwtAuthGuard } from '@modules/auth/guards/gql-jwt-auth.guard';
import { Property } from './entities/property.entity';
import { PropertiesService } from './properties.service';
import { CreatePropertyDto, UpdatePropertyDto, SearchPropertyDto } from './dto';

@Resolver(() => Property)
export class PropertiesResolver {
  constructor(private propertiesService: PropertiesService) {}

  @Query(() => [Property])
  async properties(
    @Args('limit', { defaultValue: 10 }) limit: number,
    @Args('offset', { defaultValue: 0 }) offset: number,
  ) {
    const result = await this.propertiesService.findAll(limit, offset);
    return result.properties;
  }

  @Query(() => Property)
  async property(@Args('id') id: string) {
    return this.propertiesService.findOne(id);
  }

  @Query(() => [Property])
  async searchProperties(@Args('input') searchDto: SearchPropertyDto) {
    const result = await this.propertiesService.search(searchDto);
    return result.properties;
  }

  @Mutation(() => Property)
  @UseGuards(GqlJwtAuthGuard)
  async createProperty(
    @Context() context,
    @Args('input') createPropertyDto: CreatePropertyDto,
  ) {
    return this.propertiesService.create(createPropertyDto, context.req.user.id);
  }

  @Mutation(() => Property)
  @UseGuards(GqlJwtAuthGuard)
  async updateProperty(
    @Args('id') id: string,
    @Args('input') updatePropertyDto: UpdatePropertyDto,
  ) {
    return this.propertiesService.update(id, updatePropertyDto);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlJwtAuthGuard)
  async deleteProperty(@Args('id') id: string) {
    await this.propertiesService.delete(id);
    return true;
  }
}
