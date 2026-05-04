import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import { UpdateUserDto, CreateUserDto, UpdatePreferencesDto } from './dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { email } = createUserDto;

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const user = this.userRepository.create(createUserDto);
    return this.userRepository.save(user);
  }

  async findAll(limit = 10, offset = 0) {
    const [users, total] = await this.userRepository.findAndCount({
      take: limit,
      skip: offset,
      order: { createdAt: 'DESC' },
    });

    return { users, total };
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    Object.assign(user, updateUserDto);
    return this.userRepository.save(user);
  }

  async updatePreferences(
    userId: string,
    preferencesDto: UpdatePreferencesDto,
  ): Promise<User> {
    const user = await this.findOne(userId);

    user.preferences = {
      ...user.preferences,
      ...preferencesDto,
    };

    return this.userRepository.save(user);
  }

  async addFavorite(userId: string, propertyId: string): Promise<User> {
    const user = await this.findOne(userId);

    if (!user.favoritePropertyIds) {
      user.favoritePropertyIds = [];
    }

    if (!user.favoritePropertyIds.includes(propertyId)) {
      user.favoritePropertyIds.push(propertyId);
    }

    return this.userRepository.save(user);
  }

  async removeFavorite(userId: string, propertyId: string): Promise<User> {
    const user = await this.findOne(userId);

    if (user.favoritePropertyIds) {
      user.favoritePropertyIds = user.favoritePropertyIds.filter(
        (id) => id !== propertyId,
      );
    }

    return this.userRepository.save(user);
  }

  async getFavorites(userId: string) {
    const user = await this.findOne(userId);
    return user.favoritePropertyIds || [];
  }

  async delete(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
  }

  async updateKycData(userId: string, kycData: any): Promise<User> {
    const user = await this.findOne(userId);

    user.kycData = {
      ...user.kycData,
      ...kycData,
      verifiedAt: new Date(),
    };

    user.emailVerified = true;

    return this.userRepository.save(user);
  }

  async getAgents(limit = 10, offset = 0) {
    const [agents, total] = await this.userRepository.findAndCount({
      where: { role: UserRole.AGENT },
      take: limit,
      skip: offset,
      order: { createdAt: 'DESC' },
    });

    return { agents, total };
  }
}
