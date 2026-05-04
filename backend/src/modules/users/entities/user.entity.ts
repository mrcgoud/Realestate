import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  BeforeInsert,
} from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import * as bcrypt from 'bcrypt';
import { Property } from '@modules/properties/entities/property.entity';

export enum UserRole {
  ADMIN = 'admin',
  AGENT = 'agent',
  BUYER = 'buyer',
  SELLER = 'seller',
}

@ObjectType()
@Entity('users')
export class User {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Field()
  @Column()
  firstName: string;

  @Field()
  @Column()
  lastName: string;

  @Field()
  @Column({ nullable: true })
  phone: string;

  @Field()
  @Column({ type: 'enum', enum: UserRole, default: UserRole.BUYER })
  role: UserRole;

  @Field()
  @Column({ type: 'text', nullable: true })
  avatar: string;

  @Field()
  @Column({ type: 'text', nullable: true })
  bio: string;

  @Field()
  @Column({ default: false })
  emailVerified: boolean;

  @Field(() => [String], { nullable: true })
  @Column('simple-array', { nullable: true })
  favoritePropertyIds: string[];

  @Field()
  @Column({ type: 'jsonb', nullable: true })
  preferences: {
    currency?: string;
    language?: string;
    notifications?: boolean;
    newsletter?: boolean;
  };

  @Field()
  @Column({ type: 'jsonb', nullable: true })
  kycData: {
    verified?: boolean;
    documentType?: string;
    documentNumber?: string;
    verifiedAt?: Date;
  };

  @Field()
  @Column({ default: true })
  isActive: boolean;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Property, (property) => property.owner)
  properties: Property[];

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }

  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }

  getFullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
