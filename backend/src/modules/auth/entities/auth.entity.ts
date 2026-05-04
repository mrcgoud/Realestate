import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('auth_tokens')
@Index(['userId', 'expiresAt'])
export class AuthToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  userId: string;

  @Column()
  token: string;

  @Column({ type: 'enum', enum: ['refresh', 'email_verification', 'password_reset'] })
  type: string;

  @Column()
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  isExpired(): boolean {
    return new Date() > this.expiresAt;
  }
}

@Entity('oauth_providers')
export class OAuthProvider {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  userId: string;

  @Column()
  provider: string; // 'google', 'facebook', 'github'

  @Column()
  providerUid: string;

  @Column({ nullable: true })
  email: string;

  @Column({ type: 'jsonb', nullable: true })
  profile: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
