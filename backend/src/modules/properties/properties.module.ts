import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Property } from './entities/property.entity';
import { PropertyImage } from './entities/property-image.entity';
import { PropertiesService } from './properties.service';
import { PropertiesController } from './properties.controller';
import { PropertiesResolver } from './properties.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Property, PropertyImage])],
  controllers: [PropertiesController],
  providers: [PropertiesService, PropertiesResolver],
  exports: [PropertiesService],
})
export class PropertiesModule {}
