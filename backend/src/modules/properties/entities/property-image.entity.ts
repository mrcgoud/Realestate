import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Property } from './property.entity';

@ObjectType()
@Entity('property_images')
export class PropertyImage {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  propertyId: string;

  @Field()
  @Column()
  url: string;

  @Field()
  @Column({ nullable: true })
  description: string;

  @Field()
  @Column({ default: false })
  isPrimary: boolean;

  @Field()
  @Column({ default: 0 })
  order: number;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Property, (property) => property.images, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'propertyId' })
  property: Property;
}
