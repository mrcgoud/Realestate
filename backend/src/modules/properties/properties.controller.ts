import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PropertiesService } from './properties.service';
import { CreatePropertyDto, UpdatePropertyDto, SearchPropertyDto } from './dto';

@ApiTags('properties')
@Controller('properties')
export class PropertiesController {
  constructor(private propertiesService: PropertiesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all available properties' })
  async findAll(
    @Query('limit') limit = 10,
    @Query('offset') offset = 0,
  ) {
    return this.propertiesService.findAll(limit, offset);
  }

  @Post('search')
  @ApiOperation({ summary: 'Search properties with filters' })
  async search(@Body() searchDto: SearchPropertyDto) {
    return this.propertiesService.search(searchDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get property details by ID' })
  async findOne(@Param('id') id: string) {
    return this.propertiesService.findOne(id);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new property listing' })
  async create(
    @Body() createPropertyDto: CreatePropertyDto,
    @Request() req,
  ) {
    return this.propertiesService.create(createPropertyDto, req.user.id);
  }

  @Get('owner/:ownerId')
  @ApiOperation({ summary: 'Get all properties by owner' })
  async findByOwner(
    @Param('ownerId') ownerId: string,
    @Query('limit') limit = 10,
    @Query('offset') offset = 0,
  ) {
    return this.propertiesService.findByOwner(ownerId, limit, offset);
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update property listing' })
  async update(
    @Param('id') id: string,
    @Body() updatePropertyDto: UpdatePropertyDto,
  ) {
    return this.propertiesService.update(id, updatePropertyDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete property listing' })
  async delete(@Param('id') id: string) {
    await this.propertiesService.delete(id);
    return { success: true };
  }

  @Post(':id/images')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add image to property' })
  async addImage(
    @Param('id') propertyId: string,
    @Body() { imageUrl, isPrimary }: { imageUrl: string; isPrimary?: boolean },
  ) {
    return this.propertiesService.addImage(propertyId, imageUrl, isPrimary);
  }

  @Delete('images/:imageId')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove image from property' })
  async removeImage(@Param('imageId') imageId: string) {
    await this.propertiesService.removeImage(imageId);
    return { success: true };
  }

  @Get('nearby/:id')
  @ApiOperation({ summary: 'Find nearby properties' })
  async getNearby(
    @Param('id') propertyId: string,
    @Query('radiusKm') radiusKm = 5,
  ) {
    const property = await this.propertiesService.findOne(propertyId);
    return await this.propertiesService.getNearbyCom mitities(
      property.latitude,
      property.longitude,
      radiusKm,
    );
  }
}
