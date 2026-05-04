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
import { UsersService } from './users.service';
import { UpdateUserDto, UpdatePreferencesDto, UpdateKycDto } from './dto';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all users (admin only)' })
  async findAll(@Query('limit') limit = 10, @Query('offset') offset = 0) {
    return this.usersService.findAll(limit, offset);
  }

  @Get('agents')
  @ApiOperation({ summary: 'Get all real estate agents' })
  async getAgents(@Query('limit') limit = 10, @Query('offset') offset = 0) {
    return this.usersService.getAgents(limit, offset);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  async getProfile(@Request() req) {
    return this.usersService.findOne(req.user.id);
  }

  @Get('favorites')
  @ApiOperation({ summary: 'Get user favorite properties' })
  async getFavorites(@Request() req) {
    return this.usersService.getFavorites(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by id' })
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Put('me')
  @ApiOperation({ summary: 'Update current user profile' })
  async updateProfile(@Request() req, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(req.user.id, updateUserDto);
  }

  @Put('preferences')
  @ApiOperation({ summary: 'Update user preferences' })
  async updatePreferences(
    @Request() req,
    @Body() preferencesDto: UpdatePreferencesDto,
  ) {
    return this.usersService.updatePreferences(req.user.id, preferencesDto);
  }

  @Post('favorites/:propertyId')
  @ApiOperation({ summary: 'Add property to favorites' })
  async addFavorite(@Request() req, @Param('propertyId') propertyId: string) {
    return this.usersService.addFavorite(req.user.id, propertyId);
  }

  @Delete('favorites/:propertyId')
  @ApiOperation({ summary: 'Remove property from favorites' })
  async removeFavorite(@Request() req, @Param('propertyId') propertyId: string) {
    return this.usersService.removeFavorite(req.user.id, propertyId);
  }

  @Post('kyc')
  @ApiOperation({ summary: 'Submit KYC verification' })
  async submitKyc(@Request() req, @Body() kycDto: UpdateKycDto) {
    return this.usersService.updateKycData(req.user.id, kycDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete user account' })
  async delete(@Param('id') id: string) {
    await this.usersService.delete(id);
    return { success: true };
  }
}
